import type { AuthenticatedUser } from '@kuberone/shared-types';

import { financeEngineService } from '../../finance-engine/finance-engine.module.js';
import type {
  AiChatResult,
  AiAdvisorContext,
  RequestContext,
} from '../types/ai-advisor.types.js';
import type {
  AiChatInputValidated,
  AiContextInputValidated,
  AiEligibilityInputValidated,
  AiRecommendationInputValidated,
} from '../validators/ai-advisor.validator.js';

import { contextBuilderService } from './context-builder.service.js';
import { conversationStoreService, AI_ACTIONS } from './conversation-store.service.js';
import { openAiService } from './openai.service.js';
import { promptBuilderService } from './prompt-builder.service.js';

export const aiAdvisorService = {
  async chat(actor: AuthenticatedUser, input: AiChatInputValidated, ctx: RequestContext): Promise<AiChatResult> {
    const audience = promptBuilderService.resolveAudience(actor);
    const language = input.language;

    let conversationId = input.conversationId;
    if (conversationId) {
      const existing = await conversationStoreService.getConversation(conversationId, actor.id);
      if (!existing) {
        conversationId = undefined;
      }
    }

    if (!conversationId) {
      conversationId = await conversationStoreService.createConversation({
        userId: actor.id,
        audience,
        language,
        customerId: input.customerId ?? actor.customerId,
        leadId: input.leadId,
        applicationId: input.applicationId,
        partnerId: actor.partnerId,
      });
    }

    const intent = detectIntent(input.message, audience);

    const advisorContext = await contextBuilderService.buildForChat(
      actor,
      {
        customerId: input.customerId ?? actor.customerId,
        leadId: input.leadId,
        applicationId: input.applicationId,
        productSlug: input.productSlug,
        monthlyIncome: input.monthlyIncome,
        creditScore: input.creditScore,
        requestedLoanAmount: input.requestedLoanAmount,
        requestedTenureMonths: input.requestedTenureMonths,
        includeKnowledge: true,
        ragQuery: input.message,
      },
      language,
      ctx,
    );

    await conversationStoreService.appendUserMessage(
      conversationId,
      actor.id,
      input.message,
      language,
      intent,
      ctx,
    );

    const history =
      (await conversationStoreService.getConversation(conversationId, actor.id))?.messages ?? [];

    const systemPrompt = promptBuilderService.buildSystemPrompt({
      audience,
      language,
      context: { ...advisorContext, intent } as AiAdvisorContext & { intent: string },
    });

    const messages = promptBuilderService.buildChatMessages({
      systemPrompt,
      history: history
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      userMessage: input.message,
    });

    const fallback = () =>
      openAiService.fallbackReply({
        intent,
        language,
        structured: { context: advisorContext, intent },
      });

    let reply;
    try {
      reply = await openAiService.chat(messages, ctx, fallback);
    } catch {
      reply = fallback();
    }

    const assistantMessage = await conversationStoreService.appendAssistantMessage(
      conversationId,
      actor.id,
      reply.content,
      language,
      intent,
      reply.tokensUsed,
      ctx,
    );

    await conversationStoreService.auditInteraction({
      userId: actor.id,
      action: AI_ACTIONS.MESSAGE,
      payload: {
        conversationId,
        intent,
        provider: reply.provider,
        model: reply.model,
        audience,
        language,
      },
      ctx,
    });

    return {
      conversationId,
      message: assistantMessage,
      intent,
      contextUsed: true,
      model: reply.model,
      provider: reply.provider,
    };
  },

  async getContext(actor: AuthenticatedUser, input: AiContextInputValidated, ctx: RequestContext) {
    const context = await contextBuilderService.build({
      actor,
      input,
      language: input.language,
    });

    await conversationStoreService.auditInteraction({
      userId: actor.id,
      action: AI_ACTIONS.CONTEXT_BUILT,
      payload: { customerId: input.customerId, leadId: input.leadId, applicationId: input.applicationId },
      ctx,
    });

    return context;
  },

  async getRecommendation(
    actor: AuthenticatedUser,
    input: AiRecommendationInputValidated,
    ctx: RequestContext,
  ) {
    const baseContext = await contextBuilderService.build({
      actor,
      input: {
        customerId: input.customerId ?? actor.customerId,
        leadId: input.leadId,
        applicationId: input.applicationId,
        includeKnowledge: true,
      },
      language: 'en',
    });

    const productRecommendations = await financeEngineService.ai.getProductRecommendations({
      monthlyIncome: input.monthlyIncome,
      creditScore: input.creditScore,
      propertyValue: input.propertyValue,
      vehicleValue: input.vehicleValue,
      preferredSegment: input.preferredSegment,
    });

    let lenderRecommendations: Record<string, unknown>[] = [];
    const productId =
      (baseContext.application?.productId as string | undefined) ??
      (baseContext.lead?.productId as string | undefined);

    if (productId && input.requestedLoanAmount) {
      lenderRecommendations = (
        await financeEngineService.ai.getLenderRecommendations(
          productId,
          input.requestedLoanAmount,
          input.interestRate,
          input.requestedTenureMonths,
        )
      ).map((l) => ({ ...l }));
    }

    const crossSell = productRecommendations.slice(1, 4);

    await conversationStoreService.auditInteraction({
      userId: actor.id,
      action: AI_ACTIONS.RECOMMENDATION,
      payload: { input, productCount: productRecommendations.length },
      ctx,
    });

    return {
      agent: 'Kuber AI Advisor',
      productRecommendations,
      lenderRecommendations,
      crossSellSuggestions: crossSell,
      nextBestActions: baseContext.nextBestActions,
    };
  },

  async assessEligibility(
    actor: AuthenticatedUser,
    input: AiEligibilityInputValidated,
    ctx: RequestContext,
  ) {
    if (!input.productSlug && !input.productId) {
      const segment = input.employmentType === 'BUSINESS_OWNER' ? 'BUSINESS' : 'HOME';
      const recs = await financeEngineService.ai.getProductRecommendations({
        monthlyIncome: input.monthlyIncome,
        creditScore: input.creditScore,
        propertyValue: input.propertyValue,
        vehicleValue: input.vehicleValue,
        preferredSegment: segment as 'HOME',
      });
      if (recs[0]) {
        input = { ...input, productSlug: recs[0].productSlug as never };
      }
    }

    const eligibility = (await financeEngineService.calculateEligibility(
      {
        ...input,
        existingObligations: input.existingObligations ?? 0,
        persist: false,
        useCache: true,
      } as never,
      { ...ctx, actorId: actor.id },
    )) as Record<string, unknown> & {
      outcome?: string;
      advisor?: unknown;
      lenderRecommendations?: unknown[];
    };

    let approvalProbability: Record<string, unknown> | null = null;
    if (input.includeApprovalProbability !== false) {
      try {
        approvalProbability = (await financeEngineService.calculateApprovalProbability(
          {
            productSlug: input.productSlug,
            productId: input.productId,
            monthlyIncome: input.monthlyIncome,
            creditScore: input.creditScore,
            age: input.age,
            employmentType: input.employmentType as never,
            requestedLoanAmount: input.requestedLoanAmount,
            requestedTenureMonths: input.requestedTenureMonths,
            interestRate: input.interestRate,
            propertyValue: input.propertyValue,
            vehicleValue: input.vehicleValue,
            existingObligations: input.existingObligations ?? 0,
            documentsComplete: true,
            kycVerified: false,
            customerId: input.customerId ?? actor.customerId,
            leadId: input.leadId,
            applicationId: input.applicationId,
            persist: false,
            useCache: true,
          },
          { ...ctx, actorId: actor.id },
        )) as Record<string, unknown>;
      } catch {
        approvalProbability = null;
      }
    }

    await conversationStoreService.auditInteraction({
      userId: actor.id,
      action: AI_ACTIONS.ELIGIBILITY,
      payload: {
        productSlug: input.productSlug,
        productId: input.productId,
        outcome: eligibility.outcome,
      },
      ctx,
    });

    return {
      agent: 'Kuber AI Advisor',
      eligibility,
      approvalProbability,
      advisorSummary: eligibility.advisor,
      lenderRecommendations: input.includeLenderRecommendations === false ? [] : eligibility.lenderRecommendations,
      language: input.language,
    };
  },

  listConversations(actor: AuthenticatedUser, limit = 20) {
    return conversationStoreService.listConversations(actor.id, limit);
  },
};

function detectIntent(message: string, audience: 'customer' | 'dsa' | 'crm'): string {
  const m = message.toLowerCase();

  if (/emi|monthly installment|installment|bhugtan/.test(m)) return 'emi';
  if (/eligible|eligibility|qualify|yogya|qualification/.test(m)) return 'eligibility';
  if (/document|upload|kyc|paper|dastavez/.test(m)) {
    return audience === 'dsa' ? 'missing_documents' : 'documents';
  }
  if (/status|track|application|where is my|meri application/.test(m)) return 'application_status';
  if (/lender|bank|which bank|kis lender/.test(m)) return 'lender_recommendation';
  if (/recommend|suitable|best loan|which loan|konsa loan|product/.test(m)) return 'product_recommendation';
  if (/approval|probability|approve|sanction chance/.test(m)) return 'approval_probability';
  if (/missing|deficiency|pending doc/.test(m)) return 'missing_documents';
  if (/next|action|follow.?up|kya karu|next step/.test(m)) return 'next_best_action';
  if (/lead summary|summarize lead|lead status/.test(m)) return 'lead_summary';
  if (/risk|foir|ltv/.test(m)) return 'risk_summary';

  if (audience === 'crm') return 'lead_summary';
  if (audience === 'dsa') return 'next_best_action';
  return 'general';
}
