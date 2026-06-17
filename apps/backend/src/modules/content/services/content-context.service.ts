import type { ContentGenerateInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { knowledgeContextService } from '../../knowledge-base/services/knowledge-context.service.js';
import { ragContextService } from '../../rag/services/rag-context.service.js';

function interpolate(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? `{{${key}}}`));
}

export const contentContextService = {
  async buildPersonalization(input: ContentGenerateInput): Promise<Record<string, unknown>> {
    const base = { ...(input.personalization ?? {}) };

    if (input.personalization?.leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: input.personalization.leadId },
        include: { product: { select: { name: true } }, branch: { select: { name: true, city: true } }, region: { select: { name: true } } },
      });
      if (lead) {
        Object.assign(base, {
          customerName: lead.prospectName,
          product: lead.product?.name,
          loanAmount: lead.requestedAmount,
          leadScore: lead.score,
          applicationStatus: lead.status,
          branch: lead.branch?.name,
          region: lead.region?.name,
        });
      }
    }

    if (input.personalization?.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: input.personalization.customerId },
      });
      if (customer) {
        Object.assign(base, {
          customerName: customer.fullName ?? customer.customerCode,
        });
      }
    }

    if (input.personalization?.applicationId) {
      const app = await prisma.application.findUnique({
        where: { id: input.personalization.applicationId },
        include: { product: { select: { name: true } } },
      });
      if (app) {
        Object.assign(base, {
          applicationStatus: app.status,
          loanAmount: app.requestedAmount,
          product: app.product?.name,
        });
      }
    }

    if (input.personalization?.ticketId) {
      const ticket = await prisma.ticket.findUnique({ where: { id: input.personalization.ticketId } });
      if (ticket) {
        Object.assign(base, { ticketSubject: ticket.subject, ticketStatus: ticket.status });
      }
    }

    return base;
  },

  async buildRagContext(prompt: string, actorId: string) {
    try {
      const rag = await ragContextService.build(
        { q: prompt, topK: 6, source: 'COPILOT', categoryCode: undefined, productCode: undefined, lenderCode: undefined },
        actorId,
      );
      return {
        snippets: rag.snippets,
        policies: rag.policies,
        faqs: rag.faqs,
        sops: rag.sops,
        sources: rag.chunks?.map((c) => ({ title: c.documentTitle, sourceType: c.sourceType })) ?? [],
      };
    } catch {
      return { snippets: [], policies: [], faqs: [], sops: [], sources: [] };
    }
  },

  async buildKnowledgeContext(prompt: string) {
    try {
      const kb = await knowledgeContextService.buildForAi({ query: prompt, limit: 5, source: 'RAG' });
      return {
        articles: kb.snippets.map((s) => ({ title: s.title, contentType: s.contentType, excerpt: s.content.slice(0, 400) })),
      };
    } catch {
      return { articles: [] };
    }
  },

  renderPrompt(template: string, vars: Record<string, unknown>) {
    return interpolate(template, vars);
  },

  languageLabel(lang: string): string {
    switch (lang) {
      case 'HI':
        return 'Hindi';
      case 'HINGLISH':
        return 'Hinglish (Hindi-English mix, natural Indian fintech tone)';
      default:
        return 'English';
    }
  },

  toneGuidance(tone: string): string {
    const map: Record<string, string> = {
      PROFESSIONAL: 'Professional, clear, trustworthy',
      PREMIUM_FINTECH: 'Premium fintech — sophisticated, confident, RBI-compliant',
      SALES: 'Persuasive sales tone with clear CTA',
      SUPPORT: 'Empathetic, solution-oriented support tone',
      FORMAL: 'Formal business communication',
      FRIENDLY: 'Warm and approachable',
      URGENT: 'Urgent but not alarmist — action-oriented',
      PROMOTIONAL: 'Promotional marketing with compliance guardrails',
    };
    return map[tone] ?? map.PROFESSIONAL!;
  },
};
