import type { AuthenticatedUser } from '@kuberone/shared-types';

import { prisma } from '../../../config/database.js';
import {
  applyApplicationScope,
  applyLeadScope,
} from '../../../shared/utils/data-scope.js';
import { applicationService } from '../../applications/services/application.service.js';
import { documentDeficiencyService } from '../../documents/services/document-deficiency.service.js';
import { financeEngineService } from '../../finance-engine/finance-engine.module.js';
import { knowledgeContextService } from '../../knowledge-base/services/knowledge-context.service.js';
import { leadService } from '../../leads/services/lead.service.js';
import { documentRuleService } from '../../product/services/document-rule.service.js';
import { ragContextService } from '../../rag/services/rag-context.service.js';
import { FINTECH_KNOWLEDGE_BASE } from '../constants/ai-advisor.constants.js';
import type { AiLanguage } from '../constants/ai-advisor.constants.js';
import type {
  AiAdvisorContext,
  AiContextInput,
  BuildContextParams,
  RequestContext,
} from '../types/ai-advisor.types.js';

import { promptBuilderService } from './prompt-builder.service.js';

function serialize<T>(value: T): Record<string, unknown> | null {
  if (value === null || value === undefined) return null;
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

async function loadKnowledgeSnippets(
  actorId: string,
  query?: string,
  productCode?: string,
): Promise<string[]> {
  if (query) {
    try {
      const ragSnippets = await ragContextService.getSnippetStrings(
        query,
        { topK: 8, productCode, source: 'AI_ADVISOR' },
        actorId,
      );
      if (ragSnippets.length > 0) return ragSnippets;
    } catch {
      /* fall through */
    }
  }

  try {
    const kbSnippets = await knowledgeContextService.getSnippetStrings(8, productCode);
    if (kbSnippets.length > 0) return kbSnippets;
  } catch {
    /* fall through */
  }

  return [...FINTECH_KNOWLEDGE_BASE];
}

export const contextBuilderService = {
  async build(params: BuildContextParams): Promise<AiAdvisorContext> {
    const { actor, input, language = 'en' } = params;
    const audience = promptBuilderService.resolveAudience(actor);

    const customerId = input.customerId ?? actor.customerId;
    const leadId = input.leadId;
    const applicationId = input.applicationId;
    const partnerId = actor.partnerId;

    const knowledgeSnippets = input.includeKnowledge === false
      ? []
      : await loadKnowledgeSnippets(actor.id, input.ragQuery, input.productSlug);

    const context: AiAdvisorContext = {
      audience,
      language,
      actor: {
        userId: actor.id,
        userType: actor.userType,
        roles: actor.roles,
        customerId: customerId ?? undefined,
        partnerId: partnerId ?? undefined,
      },
      knowledgeSnippets: knowledgeSnippets.length > 0 ? knowledgeSnippets : [...FINTECH_KNOWLEDGE_BASE],
      nextBestActions: [],
    };

    if (customerId) {
      const customer = await prisma.customer.findFirst({
        where: { id: customerId, deletedAt: null },
        include: { profile: true },
      });
      context.customer = serialize(customer);

      const appsWhere = applyApplicationScope(actor, { customerId, deletedAt: null });
      const applications = await prisma.application.findMany({
        where: appsWhere,
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { product: true },
      });
      context.applications = applications.map((a) => serialize(a)!);

      const documents = await prisma.document.findMany({
        where: { customerId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: { documentType: true },
      });
      context.documents = documents.map((d) => serialize(d)!);

      try {
        const deficiencies = await documentDeficiencyService.list({
          customerId,
          status: 'OPEN',
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        context.documentDeficiencies = deficiencies.items.map((d) => serialize(d)!);
      } catch {
        context.documentDeficiencies = [];
      }
    }

    if (leadId) {
      try {
        const lead = await leadService.getById(actor, leadId);
        context.lead = serialize(lead);
      } catch {
        context.lead = null;
      }
    } else if (audience === 'dsa' && partnerId) {
      const leadsWhere = applyLeadScope(actor, { partnerId, deletedAt: null });
      const recentLeads = await prisma.lead.findMany({
        where: leadsWhere,
        orderBy: { updatedAt: 'desc' },
        take: 3,
      });
      if (recentLeads[0]) {
        context.lead = serialize(recentLeads[0]);
      }
    }

    if (applicationId) {
      try {
        const app = await applicationService.getById(actor, applicationId);
        context.application = serialize(app);
      } catch {
        context.application = null;
      }
    }

    const products = await prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      take: 12,
      include: { family: true },
      orderBy: { name: 'asc' },
    });
    context.products = products.map((p) => serialize(p)!);

    const profile = extractProfile(context);
    context.productRecommendations = (
      await financeEngineService.ai.getProductRecommendations({
        monthlyIncome: profile.monthlyIncome,
        creditScore: profile.creditScore,
        propertyValue: profile.propertyValue,
        vehicleValue: profile.vehicleValue,
        preferredSegment: profile.preferredSegment,
      })
    ).map((r) => serialize(r)!);

    if (input.productId || input.productSlug || context.application?.productId) {
      await enrichProductContext(context, input, profile, actor.id);
    }

    context.nextBestActions = buildNextBestActions(context);
    return context;
  },

  async buildForChat(
    actor: AuthenticatedUser,
    input: AiContextInput & {
      monthlyIncome?: number;
      creditScore?: number;
      requestedLoanAmount?: number;
      requestedTenureMonths?: number;
      productSlug?: string;
    },
    language: AiLanguage,
    ctx: RequestContext,
  ): Promise<AiAdvisorContext> {
    const base = await contextBuilderService.build({ actor, input, language });

    const profile = {
      ...extractProfile(base),
      monthlyIncome: input.monthlyIncome ?? extractProfile(base).monthlyIncome,
      creditScore: input.creditScore ?? extractProfile(base).creditScore,
      requestedLoanAmount:
        input.requestedLoanAmount ??
        (Number(base.lead?.requestedAmount ?? base.application?.requestedAmount ?? 0) || undefined),
      requestedTenureMonths: input.requestedTenureMonths ?? 240,
      productSlug: input.productSlug,
    };

    if (profile.productSlug || base.application?.productId) {
      try {
        const eligibility = await financeEngineService.calculateEligibility(
          {
            productSlug: profile.productSlug as never,
            productId: base.application?.productId as string | undefined,
            monthlyIncome: profile.monthlyIncome ?? 75000,
            creditScore: profile.creditScore ?? 720,
            age: 32,
            employmentType: 'SALARIED',
            requestedLoanAmount: profile.requestedLoanAmount ?? 3000000,
            requestedTenureMonths: profile.requestedTenureMonths,
            interestRate: 9.5,
            existingObligations: 0,
            customerId: base.actor.customerId,
            leadId: input.leadId,
            applicationId: input.applicationId,
            persist: false,
            useCache: true,
          },
          { ...ctx, actorId: actor.id },
        );
        const eligibilityData = eligibility as typeof eligibility & {
          lenderRecommendations?: Array<Record<string, unknown>>;
        };
        base.eligibility = serialize(eligibility);
        base.lenderRecommendations = (eligibilityData.lenderRecommendations ?? []).map((l) =>
          serialize(l)!,
        );

        if (profile.requestedLoanAmount) {
          const emi = await financeEngineService.calculateEmi(
            {
              productSlug: profile.productSlug as never,
              loanAmount: profile.requestedLoanAmount,
              interestRate: 9.5,
              tenureMonths: profile.requestedTenureMonths ?? 240,
              processingFee: 0,
              includeAmortization: false,
              persist: false,
              useCache: true,
              customerId: base.actor.customerId,
            },
            { ...ctx, actorId: actor.id },
          );
          base.emiPreview = serialize(emi);
        }

        const approval = await financeEngineService.calculateApprovalProbability(
          {
            productSlug: profile.productSlug as never,
            productId: base.application?.productId as string | undefined,
            monthlyIncome: profile.monthlyIncome ?? 75000,
            creditScore: profile.creditScore ?? 720,
            requestedLoanAmount: profile.requestedLoanAmount ?? 3000000,
            requestedTenureMonths: profile.requestedTenureMonths,
            existingObligations: 0,
            documentsComplete: (base.documentDeficiencies?.length ?? 0) === 0,
            kycVerified: base.customer?.kycStatus === 'VERIFIED',
            persist: false,
            useCache: true,
            customerId: base.actor.customerId,
            leadId: input.leadId,
            applicationId: input.applicationId,
          },
          { ...ctx, actorId: actor.id },
        );
        base.approvalProbability = serialize(approval);
      } catch {
        /* eligibility optional for chat context */
      }
    }

    base.nextBestActions = buildNextBestActions(base);
    return base;
  },
};

async function enrichProductContext(
  context: AiAdvisorContext,
  input: AiContextInput,
  profile: ReturnType<typeof extractProfile>,
  actorId: string,
) {
  const productId =
    input.productId ??
    (context.application?.productId as string | undefined) ??
    (context.lead?.productId as string | undefined);

  if (!productId) return;

  try {
    const resolved = await documentRuleService.resolve({
      productId,
      variantId: (context.application?.variantId as string | undefined) ?? undefined,
      employmentType: 'SALARIED',
      riskLevel: 'MEDIUM',
    });
    context.requiredDocuments = Array.isArray(resolved) ? resolved.map((r) => serialize(r)!) : [serialize(resolved)!];
  } catch {
    context.requiredDocuments = [];
  }

  if (profile.requestedLoanAmount && productId) {
    context.lenderRecommendations = (
      await financeEngineService.ai.getLenderRecommendations(
        productId,
        profile.requestedLoanAmount,
        profile.interestRate ?? 9.5,
        profile.requestedTenureMonths ?? 240,
      )
    ).map((l) => serialize(l)!);
  }

  void actorId;
}

function extractProfile(context: AiAdvisorContext) {
  const customer = context.customer;
  const lead = context.lead;
  const app = context.application;
  const leadMeta = (lead?.metadata ?? {}) as Record<string, unknown>;

  return {
    monthlyIncome: Number(customer?.monthlyIncome ?? leadMeta.monthlyIncome ?? 0) || undefined,
    creditScore: Number(customer?.creditScore ?? leadMeta.creditScore ?? 0) || undefined,
    propertyValue: Number(leadMeta.propertyValue ?? 0) || undefined,
    vehicleValue: Number(leadMeta.vehicleValue ?? 0) || undefined,
    preferredSegment: inferSegment(app, lead),
    requestedLoanAmount:
      Number(app?.requestedAmount ?? lead?.requestedAmount ?? 0) || undefined,
    requestedTenureMonths: Number(app?.requestedTenureMonths ?? 240) || 240,
    interestRate: 9.5,
    productSlug: undefined as string | undefined,
  };
}

function inferSegment(
  app?: Record<string, unknown> | null,
  lead?: Record<string, unknown> | null,
): 'HOME' | 'AUTO' | 'BUSINESS' | undefined {
  const name = String(app?.productName ?? lead?.productName ?? '').toLowerCase();
  if (name.includes('car') || name.includes('auto') || name.includes('vehicle')) return 'AUTO';
  if (name.includes('business') || name.includes('msme')) return 'BUSINESS';
  if (name.includes('home') || name.includes('lap') || name.includes('property')) return 'HOME';
  return undefined;
}

function buildNextBestActions(context: AiAdvisorContext): string[] {
  const actions: string[] = [];

  if (context.audience === 'customer') {
    if ((context.documentDeficiencies?.length ?? 0) > 0) {
      actions.push('Upload or re-submit documents flagged as deficient');
    }
    if ((context.applications?.length ?? 0) === 0) {
      actions.push('Browse recommended products and start an application');
    }
    if (context.eligibility && (context.eligibility.outcome as string) === 'NOT_ELIGIBLE') {
      actions.push('Review eligibility tips or choose an alternate product');
    }
  }

  if (context.audience === 'dsa') {
    if ((context.documentDeficiencies?.length ?? 0) > 0) {
      actions.push('Follow up with customer for pending documents');
    }
    if (context.lead && context.lead.status === 'NEW') {
      actions.push('Contact lead and move status to CONTACTED');
    }
    if (context.lenderRecommendations && context.lenderRecommendations.length > 0) {
      actions.push(`Initiate bank login with ${context.lenderRecommendations[0]?.lenderName ?? 'top-ranked lender'}`);
    }
  }

  if (context.audience === 'crm') {
    if (context.lead) {
      actions.push('Review lead score and schedule follow-up call');
    }
    if (context.approvalProbability) {
      actions.push('Share approval probability summary with sales owner');
    }
  }

  if (actions.length === 0) {
    actions.push('Ask a specific question about eligibility, EMI, documents, or application status');
  }

  return actions;
}
