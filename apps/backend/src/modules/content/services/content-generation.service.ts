import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  ContentGenerateInput,
  ContentRewriteInput,
  ContentSummarizeInput,
  ContentTranslateInput,
} from '@kuberone/shared-validation';

import { completionService } from '../../ai-platform/services/completion.service.js';
import { contentRepository } from '../repositories/content.repository.js';

import { contentAuditService } from './content-audit.service.js';
import { contentContextService } from './content-context.service.js';
import { contentQualityService } from './content-quality.service.js';

type RequestContext = { actorId: string; ipAddress?: string; userAgent?: string };

const CHANNEL_LIMITS: Record<string, { maxBody: number; hint: string }> = {
  SMS: { maxBody: 160, hint: 'Keep under 160 characters total.' },
  WHATSAPP: { maxBody: 1024, hint: 'WhatsApp message, conversational tone.' },
  PUSH: { maxBody: 240, hint: 'Push title + body, very concise.' },
  EMAIL: { maxBody: 5000, hint: 'Include subject line and body with optional CTA.' },
};

function parseStructuredOutput(raw: string, contentType: string) {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>;
      return {
        title: parsed.title,
        subject: parsed.subject ?? parsed.title,
        body: parsed.body ?? parsed.content ?? raw,
        ctaLabel: parsed.ctaLabel ?? parsed.cta,
        ctaUrl: parsed.ctaUrl ?? parsed.url,
      };
    }
  } catch {
    // fall through
  }

  if (contentType === 'EMAIL' || contentType === 'CAMPAIGN') {
    const subjectMatch = raw.match(/^Subject:\s*(.+)$/im);
    const body = raw.replace(/^Subject:\s*.+$/im, '').trim();
    return { subject: subjectMatch?.[1], body: body || raw };
  }

  return { body: raw };
}

function buildModeInstruction(mode: string, targetLanguage?: string): string {
  switch (mode) {
    case 'REWRITE':
      return 'Rewrite the source text improving clarity and engagement while preserving meaning.';
    case 'EXPAND':
      return 'Expand the source text with more detail, benefits, and context.';
    case 'SUMMARIZE':
      return 'Summarize the source text concisely preserving key facts.';
    case 'TRANSLATE':
      return `Translate to ${contentContextService.languageLabel(targetLanguage ?? 'EN')} maintaining fintech terminology.`;
    case 'OPTIMIZE':
      return 'Optimize for conversion, readability, and compliance. Improve CTA.';
    case 'PERSONALIZE':
      return 'Personalize using provided customer/lead data. Use {{variables}} only where data is missing.';
    case 'AB_VARIANT':
      return 'Generate a distinct A/B variant with different hook and CTA while same core message.';
    default:
      return 'Generate original content from scratch.';
  }
}

export const contentGenerationService = {
  async generate(actor: AuthenticatedUser, input: ContentGenerateInput, ctx: RequestContext) {
    const start = Date.now();
    const personalization = await contentContextService.buildPersonalization(input);

    const template = input.templateId
      ? await contentRepository.template.findById(input.templateId)
      : input.templateCode
        ? await contentRepository.template.findByCode(input.templateCode)
        : null;

    const request = await contentRepository.request.create({
      template: template ? { connect: { id: template.id } } : undefined,
      contentType: input.contentType as never,
      mode: input.mode as never,
      tone: input.tone as never,
      language: input.language as never,
      prompt: input.prompt,
      sourceText: input.sourceText,
      personalization: personalization as never,
      ragEnabled: input.ragEnabled,
      variantCount: input.variantCount,
      entityType: input.entityType,
      entityId: input.entityId,
      campaign: input.campaignId ? { connect: { id: input.campaignId } } : undefined,
      requestedBy: { connect: { id: actor.id } },
    });

    if (input.async) {
      await contentRepository.queue.enqueue({
        request: { connect: { id: request.id } },
        status: 'PENDING',
        payload: { input } as never,
      });
      return { requestId: request.id, status: 'QUEUED' };
    }

    const results = await contentGenerationService.executeGeneration({
      requestId: request.id,
      input,
      template,
      personalization,
      actorId: actor.id,
      start,
    });

    await contentAuditService.log({
      requestId: request.id,
      action: 'CONTENT_GENERATED',
      actorId: ctx.actorId,
      after: { mode: input.mode, contentType: input.contentType, variants: results.length },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    return contentRepository.request.findById(request.id);
  },

  async executeGeneration(params: {
    requestId: string;
    input: ContentGenerateInput;
    template: Awaited<ReturnType<typeof contentRepository.template.findById>>;
    personalization: Record<string, unknown>;
    actorId: string;
    start: number;
  }) {
    const { requestId, input, template, personalization, actorId, start } = params;
    const promptText = input.prompt ?? input.sourceText ?? template?.userPrompt ?? 'Generate content';
    const rag = input.ragEnabled ? await contentContextService.buildRagContext(promptText, actorId) : null;
    const kb = input.ragEnabled ? await contentContextService.buildKnowledgeContext(promptText) : null;

    const channelHint = CHANNEL_LIMITS[input.contentType];
    const systemPrompt = [
      template?.systemPrompt ??
        `You are Kuber Finserve's AI content engine for KuberOne. Generate ${input.contentType} content.`,
      `Tone: ${contentContextService.toneGuidance(input.tone)}`,
      `Language: ${contentContextService.languageLabel(input.language)}`,
      `Task: ${buildModeInstruction(input.mode, input.targetLanguage)}`,
      channelHint ? channelHint.hint : '',
      'Return JSON: { "subject": "...", "title": "...", "body": "...", "ctaLabel": "...", "ctaUrl": "..." } when applicable.',
      'Never include real PII. Use placeholders if data missing. Comply with RBI/NBFC marketing guidelines.',
    ]
      .filter(Boolean)
      .join('\n');

    const userPrompt = [
      contentContextService.renderPrompt(promptText, personalization),
      input.sourceText ? `\nSource text:\n${input.sourceText}` : '',
      rag?.policies?.length ? `\nPolicies:\n${rag.policies.slice(0, 3).join('\n')}` : '',
      rag?.faqs?.length ? `\nFAQs:\n${rag.faqs.slice(0, 3).join('\n')}` : '',
      rag?.sops?.length ? `\nSOPs:\n${rag.sops.slice(0, 2).join('\n')}` : '',
      kb?.articles?.length ? `\nKnowledge:\n${kb.articles.map((a) => a.excerpt).join('\n')}` : '',
      `\nPersonalization: ${JSON.stringify(personalization)}`,
    ].join('');

    const results = [];
    for (let i = 0; i < input.variantCount; i++) {
      const variantPrompt =
        input.variantCount > 1 ? `${userPrompt}\n\nGenerate variant ${i + 1} of ${input.variantCount}.` : userPrompt;

      const completion = await completionService.chat(
        {
          module: 'CONTENT' as never,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: variantPrompt },
          ],
        },
        { actorId },
      );

      const parsed = parseStructuredOutput(completion.content, input.contentType);
      const quality = contentQualityService.validate(parsed.body, input.contentType);

      const result = await contentRepository.result.create({
        request: { connect: { id: requestId } },
        variantIndex: i,
        title: parsed.title,
        subject: parsed.subject,
        body: parsed.body,
        ctaLabel: parsed.ctaLabel,
        ctaUrl: parsed.ctaUrl,
        qualityStatus: quality.status as never,
        qualityReport: quality as never,
        ragSources: (rag?.sources ?? []) as never,
        modelCode: completion.model,
        tokensUsed: completion.totalTokens ?? (completion.inputTokens ?? 0) + (completion.outputTokens ?? 0),
        generationMs: Date.now() - start,
        estimatedCost: undefined,
      });

      await contentRepository.version.create({
        request: { connect: { id: requestId } },
        version: i + 1,
        title: parsed.title,
        body: parsed.body,
        subject: parsed.subject,
        changeNote: `Generated variant ${i + 1}`,
        createdBy: { connect: { id: actorId } },
      });

      results.push(result);
    }

    if (template) await contentRepository.template.incrementUsage(template.id);

    await contentRepository.request.update(requestId, { status: 'DRAFT' });

    return results;
  },

  async rewrite(actor: AuthenticatedUser, input: ContentRewriteInput, ctx: RequestContext) {
    return contentGenerationService.generate(actor, { ...input, mode: 'REWRITE' }, ctx);
  },

  async summarize(actor: AuthenticatedUser, input: ContentSummarizeInput, ctx: RequestContext) {
    return contentGenerationService.generate(
      actor,
      {
        contentType: input.contentType ?? 'KNOWLEDGE_ARTICLE',
        mode: 'SUMMARIZE',
        sourceText: input.sourceText,
        language: input.language,
        tone: 'PROFESSIONAL',
        prompt: `Summarize in max ${input.maxLength ?? 300} characters.`,
        ragEnabled: false,
        variantCount: 1,
        async: false,
      },
      ctx,
    );
  },

  async translate(actor: AuthenticatedUser, input: ContentTranslateInput, ctx: RequestContext) {
    return contentGenerationService.generate(
      actor,
      {
        contentType: input.contentType ?? 'EMAIL',
        mode: 'TRANSLATE',
        sourceText: input.sourceText,
        language: input.targetLanguage,
        targetLanguage: input.targetLanguage,
        tone: input.tone ?? 'PROFESSIONAL',
        ragEnabled: false,
        variantCount: 1,
        async: false,
      },
      ctx,
    );
  },
};
