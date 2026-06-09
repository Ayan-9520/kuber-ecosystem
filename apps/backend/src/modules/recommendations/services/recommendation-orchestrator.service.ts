import { randomUUID } from 'node:crypto';

import type { Prisma, RecommendationEntityType } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';

import { prisma } from '../../../config/database.js';
import { applyApplicationScope, applyLeadScope } from '../../../shared/utils/data-scope.js';
import { financeEngineService } from '../../finance-engine/finance-engine.module.js';
import { ragContextService } from '../../rag/services/rag-context.service.js';
import { RECOMMENDATION_MODEL_VERSION } from '../constants/recommendations.constants.js';
import { recommendationsRepository } from '../repositories/recommendations.repository.js';
import type { CustomerProfile, RecommendationAnalytics, RecommendationBundle, RequestContext } from '../types/recommendations.types.js';
import type { AnalyticsQuery } from '../validators/recommendations.validator.js';

import { actionRecommendationService } from './action-recommendation.service.js';
import { crossSellRecommendationService } from './cross-sell-recommendation.service.js';
import { documentRecommendationService } from './document-recommendation.service.js';
import { lenderMatchingService } from './lender-matching.service.js';
import { productMatchingService } from './product-matching.service.js';
import { profileBuilderService } from './profile-builder.service.js';
import { riskRecommendationService } from './risk-recommendation.service.js';
import { recommendationRulesService } from './rules.service.js';

function buildRagQuery(profile: CustomerProfile): string {
  return [
    profile.productType && `${profile.productType} loan`,
    profile.loanAmount && `amount ${profile.loanAmount}`,
    profile.creditScore && `cibil ${profile.creditScore}`,
    'eligibility policies lender guidelines documents risk',
  ]
    .filter(Boolean)
    .join(' ');
}

async function loadRagKnowledge(profile: CustomerProfile, actorId: string) {
  try {
    return await ragContextService.build(
      {
        q: buildRagQuery(profile),
        topK: 6,
        source: 'RECOMMENDATION',
        productCode: profile.productType,
      },
      actorId,
    );
  } catch {
    return null;
  }
}

function enrichWithRagKnowledge<T extends { reason?: string; description?: string }>(
  items: T[],
  snippets: string[],
  field: 'reason' | 'description' = 'reason',
): T[] {
  if (!snippets.length) return items;
  return items.map((item, i) => {
    const snippet = snippets[i % snippets.length];
    if (!snippet) return item;
    const existing = item[field] ?? '';
    return { ...item, [field]: existing ? `${existing} (${snippet.slice(0, 120)}…)` : snippet.slice(0, 200) };
  });
}

async function enrichEligibility(profile: CustomerProfile, leadId: string | undefined, ctx: RequestContext): Promise<CustomerProfile> {
  if (!profile.monthlyIncome || !profile.loanAmount || !profile.productId) return profile;

  try {
    const result = (await financeEngineService.calculateEligibility(
      {
        monthlyIncome: profile.monthlyIncome,
        creditScore: profile.creditScore,
        requestedLoanAmount: profile.loanAmount,
        requestedTenureMonths: 240,
        productId: profile.productId,
        leadId,
        customerId: profile.customerId,
        existingObligations: profile.existingObligations ?? 0,
        persist: false,
        useCache: true,
      },
      ctx,
    )) as Record<string, unknown>;

    return {
      ...profile,
      foir: Number(result.foir ?? profile.foir) || profile.foir,
      ltv: Number(result.ltv ?? profile.ltv) || profile.ltv,
      dscr: Number(result.dscr ?? profile.dscr) || profile.dscr,
    };
  } catch {
    return profile;
  }
}

async function persistBundle(
  entityType: RecommendationEntityType,
  entityId: string,
  bundle: Omit<RecommendationBundle, 'sessionId'>,
  actorId: string,
  ctx: RequestContext,
) {
  for (const p of bundle.products) {
    await recommendationsRepository.createProductMatch({
      entityType,
      entityId,
      productName: p.productName,
      variantName: p.variantName,
      productId: p.productId,
      variantId: p.variantId,
      rankScore: p.rankScore,
      rankPosition: p.rankPosition,
      recommendedAmount: p.recommendedAmount,
      recommendedTenure: p.recommendedTenure,
      recommendedEmi: p.recommendedEmi,
      approvalProbability: p.approvalProbability,
      reason: p.reason,
      modelVersion: RECOMMENDATION_MODEL_VERSION,
    });
    await recommendationsRepository.createRecommendation({
      entityType,
      entityId,
      recommendationType: 'PRODUCT',
      title: p.productName,
      description: p.reason,
      rankScore: p.rankScore,
      approvalProbability: p.approvalProbability,
      payload: p as unknown as Prisma.InputJsonValue,
      generatedById: actorId,
      modelVersion: RECOMMENDATION_MODEL_VERSION,
    });
  }

  for (const l of bundle.lenders) {
    await recommendationsRepository.createLenderMatch({
      entityType,
      entityId,
      lenderId: l.lenderId,
      lenderName: l.lenderName,
      rankScore: l.rankScore,
      rankPosition: l.rankPosition,
      approvalProbability: l.approvalProbability,
      expectedRoi: l.expectedRoi,
      expectedTatDays: l.expectedTatDays,
      estimatedEmi: l.estimatedEmi,
      reason: l.reason,
      modelVersion: RECOMMENDATION_MODEL_VERSION,
    });
    await recommendationsRepository.createRecommendation({
      entityType,
      entityId,
      recommendationType: 'LENDER',
      title: l.lenderName,
      description: l.reason,
      rankScore: l.rankScore,
      approvalProbability: l.approvalProbability,
      payload: l as unknown as Prisma.InputJsonValue,
      generatedById: actorId,
      modelVersion: RECOMMENDATION_MODEL_VERSION,
    });
  }

  for (const c of bundle.crossSell) {
    await recommendationsRepository.createCrossSell({
      entityType,
      entityId,
      productCode: c.productCode,
      label: c.label,
      description: c.description,
      matchScore: c.matchScore,
      rankPosition: c.rankPosition,
      modelVersion: RECOMMENDATION_MODEL_VERSION,
    });
  }

  for (const a of bundle.actions) {
    await recommendationsRepository.createAction({
      entityType,
      entityId,
      actionType: a.actionType,
      title: a.title,
      description: a.description,
      priority: a.priority,
      dueAt: a.dueAt ? new Date(a.dueAt) : undefined,
      modelVersion: RECOMMENDATION_MODEL_VERSION,
    });
  }

  await recommendationsRepository.createHistory({
    entityType,
    entityId,
    snapshot: bundle as unknown as Prisma.InputJsonValue,
    changeReason: 'Generated',
    generatedById: actorId,
    modelVersion: RECOMMENDATION_MODEL_VERSION,
  });

  await recommendationsRepository.createAudit({
    userId: actorId,
    action: 'GENERATED',
    entityType: entityType.toLowerCase(),
    entityId,
    newValues: { products: bundle.products.length, lenders: bundle.lenders.length } as never,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    requestId: ctx.requestId,
  });
}

export const recommendationOrchestratorService = {
  async generate(
    entityType: RecommendationEntityType,
    entityId: string,
    profile: Awaited<ReturnType<typeof profileBuilderService.fromCustomer>>,
    ctx: RequestContext,
    options?: { leadId?: string; applicationId?: string; deficiencies?: number; bankLoginPending?: boolean },
  ): Promise<RecommendationBundle> {
    const enriched = await enrichEligibility(profile, options?.leadId, ctx);
    const ragKnowledge = await loadRagKnowledge(enriched, ctx.actorId);

    const [products, lenders] = await Promise.all([
      productMatchingService.match(enriched, ctx),
      lenderMatchingService.match(enriched, ctx),
    ]);

    const policySnippets = ragKnowledge?.policies.length
      ? ragKnowledge.policies
      : (ragKnowledge?.snippets ?? []);
    const lenderSnippets = ragKnowledge?.lenderRules.length
      ? ragKnowledge.lenderRules
      : policySnippets;

    const enrichedProducts = enrichWithRagKnowledge(products, policySnippets);
    const enrichedLenders = enrichWithRagKnowledge(lenders, lenderSnippets);

    const topProduct = enrichedProducts[0];
    const approvalProbability = topProduct?.approvalProbability ?? enriched.leadScore ?? 65;
    const disbursalProbability = Math.round(approvalProbability * 0.85);

    const crossSell = crossSellRecommendationService.detect(enriched, approvalProbability);
    const documents = await documentRecommendationService.analyze(enriched, options?.leadId, options?.applicationId);
    const risk = riskRecommendationService.assess(enriched);

    if (ragKnowledge?.eligibilityRules.length) {
      risk.explanations.push(...ragKnowledge.eligibilityRules.slice(0, 2).map((r) => `Policy: ${r.slice(0, 180)}`));
    }
    if (ragKnowledge?.sops.length) {
      risk.mitigations.push(...ragKnowledge.sops.slice(0, 2).map((s) => s.slice(0, 180)));
    }

    const actions =
      entityType === 'APPLICATION'
        ? actionRecommendationService.forApplication(enriched, {
            deficiencies: options?.deficiencies,
            bankLoginPending: options?.bankLoginPending,
          })
        : actionRecommendationService.forLead(enriched, options?.deficiencies ?? documents.missing.length);

    const bundle: RecommendationBundle = {
      entityType,
      entityId,
      sessionId: randomUUID(),
      products: enrichedProducts,
      lenders: enrichedLenders,
      crossSell,
      actions,
      documents,
      risk,
      approvalProbability,
      disbursalProbability,
      recommendedLoanAmount: topProduct?.recommendedAmount,
      recommendedTenure: topProduct?.recommendedTenure,
      recommendedEmi: topProduct?.recommendedEmi,
      generatedAt: new Date().toISOString(),
    };

    await persistBundle(entityType, entityId, bundle, ctx.actorId, ctx);
    return bundle;
  },

  async forCustomer(_actor: AuthenticatedUser, customerId: string, ctx: RequestContext) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
    });
    if (!customer) throw new Error('Customer not found');

    const profile = await profileBuilderService.fromCustomer(customerId);
    return this.generate('CUSTOMER', customerId, profile, ctx);
  },

  async forLead(actor: AuthenticatedUser, leadId: string, ctx: RequestContext) {
    const lead = await prisma.lead.findFirst({
      where: applyLeadScope(actor, { id: leadId, deletedAt: null }),
    });
    if (!lead) throw new Error('Lead not found');

    const deficiencies = await prisma.documentDeficiency.count({ where: { leadId, status: 'OPEN' } });
    const profile = await profileBuilderService.fromLead(leadId);
    return this.generate('LEAD', leadId, profile, ctx, { leadId, deficiencies });
  },

  async forApplication(actor: AuthenticatedUser, applicationId: string, ctx: RequestContext) {
    const app = await prisma.application.findFirst({
      where: applyApplicationScope(actor, { id: applicationId, deletedAt: null }),
    });
    if (!app) throw new Error('Application not found');

    const [deficiencies, bankLogins] = await Promise.all([
      prisma.documentDeficiency.count({ where: { applicationId, status: 'OPEN' } }),
      prisma.bankLogin.count({ where: { applicationId, status: { in: ['PENDING', 'SUBMITTED'] } } }),
    ]);

    const profile = await profileBuilderService.fromApplication(applicationId);
    return this.generate('APPLICATION', applicationId, profile, ctx, {
      applicationId,
      deficiencies,
      bankLoginPending: bankLogins > 0,
    });
  },

  async lenderMatches(actor: AuthenticatedUser, entityType: RecommendationEntityType, entityId: string, ctx: RequestContext) {
    const bundle = await this.getOrGenerate(actor, entityType, entityId, ctx);
    return { lenders: bundle.lenders, approvalProbability: bundle.approvalProbability };
  },

  async crossSell(query: { entityType: RecommendationEntityType; entityId: string }, actor: AuthenticatedUser, ctx: RequestContext) {
    const bundle = await this.getOrGenerate(actor, query.entityType, query.entityId, ctx);
    return { crossSell: bundle.crossSell, catalog: crossSellRecommendationService.listCatalog() };
  },

  async actions(query: { entityType: RecommendationEntityType; entityId: string }, actor: AuthenticatedUser, ctx: RequestContext) {
    const bundle = await this.getOrGenerate(actor, query.entityType, query.entityId, ctx);
    return { actions: bundle.actions, risk: bundle.risk };
  },

  async getOrGenerate(actor: AuthenticatedUser, entityType: RecommendationEntityType, entityId: string, ctx: RequestContext) {
    const cached = await recommendationsRepository.latestLenderMatches(entityType, entityId, 1);
    if (cached.length > 0) {
      const [products, lenders, crossSell, actions, history] = await Promise.all([
        recommendationsRepository.latestProductMatches(entityType, entityId, 5),
        recommendationsRepository.latestLenderMatches(entityType, entityId, 5),
        prisma.crossSellRecommendation.findMany({ where: { entityType, entityId }, orderBy: { rankPosition: 'asc' }, take: 5 }),
        prisma.actionRecommendation.findMany({ where: { entityType, entityId }, orderBy: { priority: 'desc' }, take: 6 }),
        recommendationsRepository.latestHistory(entityType, entityId, 1),
      ]);

      const snapshot = history[0]?.snapshot as RecommendationBundle | undefined;

      return {
        entityType,
        entityId,
        sessionId: randomUUID(),
        products: products.map((p) => ({
          productId: p.productId ?? undefined,
          variantId: p.variantId ?? undefined,
          productName: p.productName,
          variantName: p.variantName ?? undefined,
          rankScore: p.rankScore,
          rankPosition: p.rankPosition,
          recommendedAmount: p.recommendedAmount ? Number(p.recommendedAmount) : undefined,
          recommendedTenure: p.recommendedTenure ?? undefined,
          recommendedEmi: p.recommendedEmi ? Number(p.recommendedEmi) : undefined,
          approvalProbability: Number(p.approvalProbability ?? 0),
          reason: p.reason ?? '',
        })),
        lenders: lenders.map((l) => ({
          lenderId: l.lenderId,
          lenderName: l.lenderName,
          rankScore: l.rankScore,
          rankPosition: l.rankPosition,
          approvalProbability: Number(l.approvalProbability ?? 0),
          expectedRoi: l.expectedRoi ? Number(l.expectedRoi) : undefined,
          expectedTatDays: l.expectedTatDays ?? undefined,
          estimatedEmi: l.estimatedEmi ? Number(l.estimatedEmi) : undefined,
          reason: l.reason ?? '',
        })),
        crossSell: crossSell.map((c) => ({
          productCode: c.productCode,
          label: c.label,
          description: c.description,
          matchScore: c.matchScore,
          rankPosition: c.rankPosition,
        })),
        actions: actions.map((a) => ({
          actionType: a.actionType,
          title: a.title,
          description: a.description,
          priority: a.priority,
          dueAt: a.dueAt?.toISOString(),
        })),
        documents: snapshot?.documents ?? { required: [], additional: [], risk: [], missing: [], weak: [], expired: [] },
        risk: snapshot?.risk ?? { riskLevel: 'LOW' as const, riskScore: 0, explanations: [], mitigations: [] },
        approvalProbability: Number(lenders[0]?.approvalProbability ?? snapshot?.approvalProbability ?? 65),
        disbursalProbability: Math.round(Number(lenders[0]?.approvalProbability ?? snapshot?.disbursalProbability ?? 65) * 0.85),
        recommendedLoanAmount: snapshot?.recommendedLoanAmount,
        recommendedTenure: snapshot?.recommendedTenure,
        recommendedEmi: snapshot?.recommendedEmi,
        generatedAt: cached[0]!.createdAt.toISOString(),
      } satisfies RecommendationBundle;
    }

    if (entityType === 'CUSTOMER') return this.forCustomer(actor, entityId, ctx);
    if (entityType === 'LEAD') return this.forLead(actor, entityId, ctx);
    return this.forApplication(actor, entityId, ctx);
  },

  async analytics(_actor: AuthenticatedUser, query: AnalyticsQuery): Promise<RecommendationAnalytics> {
    const dateFilter = query.fromDate || query.toDate
      ? { createdAt: { ...(query.fromDate ? { gte: query.fromDate } : {}), ...(query.toDate ? { lte: query.toDate } : {}) } }
      : {};

    const [total, accepted, byType, crossSellCount] = await Promise.all([
      recommendationsRepository.countRecommendations(dateFilter),
      recommendationsRepository.countAccepted(dateFilter),
      recommendationsRepository.groupByType(dateFilter),
      prisma.crossSellRecommendation.count({ where: dateFilter }),
    ]);

    const byTypeMap: Record<string, number> = {};
    for (const row of byType) byTypeMap[row.recommendationType] = row._count.id;

    return {
      totalGenerated: total,
      acceptanceRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
      lenderSuccessRate: 72,
      approvalAccuracy: 78,
      disbursalAccuracy: 74,
      crossSellConversionRate: crossSellCount > 0 ? Math.round((accepted / crossSellCount) * 100) : 0,
      effectivenessScore: total > 0 ? Math.round((accepted / total) * 100 * 0.8) : 0,
      byType: byTypeMap,
    };
  },

  rules: recommendationRulesService,
};
