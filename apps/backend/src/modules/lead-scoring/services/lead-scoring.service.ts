import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';

import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { applyLeadScope } from '../../../shared/utils/data-scope.js';
import { financeEngineService } from '../../finance-engine/finance-engine.module.js';
import { GRADE_ALIASES } from '../../leads/constants/leads.constants.js';
import { leadRepository } from '../../leads/repositories/lead.repository.js';
import { computeSlaDeadline } from '../../leads/utils/leads.utils.js';
import { DEFAULT_WEIGHT_VERSION, GRADE_CLASSIFICATIONS } from '../constants/lead-scoring.constants.js';
import { leadScoringRepository } from '../repositories/lead-scoring.repository.js';
import type { LeadScoringAnalytics, LeadScoringEngineResult, LeadScoringProfile, RequestContext } from '../types/lead-scoring.types.js';
import type { BulkCalculateInput, ScoringAnalyticsQuery } from '../validators/lead-scoring.validator.js';

import { scoringEngineService } from './scoring-engine.service.js';
import { scoringRulesService, weightConfigService } from './weight-config.service.js';

async function buildProfileFromLead(leadId: string): Promise<LeadScoringProfile> {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, deletedAt: null },
    include: {
      product: { include: { family: true } },
      source: true,
      partner: true,
      customer: {
        include: {
          incomes: { where: { deletedAt: null }, take: 1, orderBy: { declaredAt: 'desc' } },
          employments: { where: { isCurrent: true }, take: 1 },
        },
      },
      applications: { take: 1, orderBy: { updatedAt: 'desc' } },
    },
  });

  if (!lead) throw new NotFoundError('Lead', leadId);

  const metadata = (lead.metadata ?? {}) as Record<string, unknown>;
  const monthlyIncome =
    Number(lead.customer?.incomes?.[0]?.grossAmount ?? lead.customer?.incomes?.[0]?.netAmount ?? metadata.monthlyIncome ?? 0) || undefined;

  const totalDocs = await prisma.document.count({ where: { leadId, deletedAt: null } });
  const verifiedDocs = await prisma.document.count({ where: { leadId, deletedAt: null, status: 'VERIFIED' } });
  const openDeficiencies = await prisma.documentDeficiency.count({ where: { leadId, status: 'OPEN' } });
  const documentCompletenessPct = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : openDeficiencies > 0 ? 30 : 50;

  const loanAmount = Number(lead.requestedAmount ?? metadata.loanAmount ?? 0) || undefined;
  const existingObligations = Number(metadata.existingObligations ?? 0) || undefined;
  const propertyValue = Number(metadata.propertyValue ?? 0) || undefined;

  let foir: number | undefined;
  let ltv: number | undefined;
  let dscr: number | undefined;

  if (monthlyIncome && loanAmount) {
    const annualEmi = loanAmount * 0.01;
    foir = Math.round(((existingObligations ?? 0) + annualEmi / 12) / monthlyIncome * 100);
  }
  if (propertyValue && loanAmount) {
    ltv = Math.round((loanAmount / propertyValue) * 100);
  }
  if (monthlyIncome && metadata.businessTurnover) {
    const annualDebt = (existingObligations ?? 0) * 12 + (loanAmount ?? 0) * 0.12;
    dscr = annualDebt > 0 ? Number((Number(metadata.businessTurnover) / annualDebt).toFixed(2)) : undefined;
  }

  return {
    monthlyIncome,
    propertyValue,
    vehicleValue: Number(metadata.vehicleValue ?? 0) || undefined,
    businessTurnover: Number(metadata.businessTurnover ?? 0) || undefined,
    businessVintageYears: Number(metadata.businessVintageYears ?? 0) || undefined,
    loanAmount,
    existingObligations,
    location: String(metadata.city ?? metadata.location ?? ''),
    occupation: String(lead.customer?.employments?.[0]?.designation ?? metadata.occupation ?? ''),
    employmentType: String(lead.customer?.employments?.[0]?.employmentType ?? metadata.employmentType ?? ''),
    productType: String(lead.product?.code ?? lead.product?.family?.code ?? ''),
    creditScore: Number(metadata.creditScore ?? metadata.cibil ?? 0) || undefined,
    documentCompletenessPct,
    bankingBehaviourScore: Number(metadata.bankingBehaviourScore ?? 70) || undefined,
    partnerQualityScore: lead.partner ? 75 : undefined,
    leadSourceChannel: lead.source?.channel,
    referralSource: lead.partner?.businessName ?? lead.source?.name,
    applicationStage: lead.applications[0]?.status ?? lead.status,
    leadStatus: lead.status,
    foir,
    ltv,
    dscr,
  };
}

async function enrichWithEligibility(profile: LeadScoringProfile, leadId: string, productId: string, customerId: string | null, ctx: RequestContext) {
  if (!profile.monthlyIncome || !profile.loanAmount) return profile;

  try {
    const result = (await financeEngineService.calculateEligibility(
      {
        monthlyIncome: profile.monthlyIncome,
        creditScore: profile.creditScore,
        requestedLoanAmount: profile.loanAmount,
        requestedTenureMonths: 240,
        productId,
        leadId,
        customerId: customerId ?? undefined,
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

async function persistScoreResult(
  leadId: string,
  result: LeadScoringEngineResult,
  ctx: RequestContext,
  previousScore?: { score: number; grade: string } | null,
) {
  const now = new Date();

  const record = await leadScoringRepository.createScore({
    lead: { connect: { id: leadId } },
    score: result.score,
    grade: result.grade,
    classification: result.classification,
    ruleScore: result.ruleScore,
    aiScore: result.aiScore,
    approvalProbability: result.approvalProbability,
    disbursalProbability: result.disbursalProbability,
    conversionProbability: result.conversionProbability,
    riskRating: result.riskRating,
    priorityLevel: result.priorityLevel,
    riskIndicators: result.riskIndicators as Prisma.InputJsonValue,
    factorBreakdown: result.factorBreakdown as unknown as Prisma.InputJsonValue,
    modelVersion: result.modelVersion,
    weightVersion: result.weightVersion,
    calculatedAt: now,
  });

  await leadScoringRepository.createHistory({
    lead: { connect: { id: leadId } },
    leadScore: { connect: { id: record.id } },
    previousScore: previousScore?.score ?? null,
    previousGrade: (previousScore?.grade as never) ?? null,
    newScore: result.score,
    newGrade: result.grade,
    changeReason: previousScore ? 'Recalculated' : 'Initial scoring',
    snapshot: result as unknown as Prisma.InputJsonValue,
    calculatedById: ctx.actorId,
    modelVersion: result.modelVersion,
  });

  await leadScoringRepository.createRiskProfile({
    lead: { connect: { id: leadId } },
    riskRating: result.riskRating,
    riskScore: Object.values(result.riskFactors).reduce((s, v) => s + v, 0),
    riskFactors: result.riskFactors as Prisma.InputJsonValue,
    fraudRisk: result.predictions.fraud,
    documentRisk: result.predictions.document,
    dropOffRisk: result.predictions.dropOff,
    modelVersion: result.modelVersion,
    calculatedAt: now,
  });

  const predictionTypes = [
    ['APPROVAL', result.predictions.approval],
    ['DISBURSAL', result.predictions.disbursal],
    ['CONVERSION', result.predictions.conversion],
    ['DROPOFF', result.predictions.dropOff],
    ['DOCUMENT', result.predictions.document],
    ['FRAUD', result.predictions.fraud],
  ] as const;

  for (const [type, probability] of predictionTypes) {
    await leadScoringRepository.createPrediction({
      lead: { connect: { id: leadId } },
      predictionType: type,
      probability,
      factors: result.factorBreakdown as unknown as Prisma.InputJsonValue,
      modelVersion: result.modelVersion,
      calculatedAt: now,
    });
  }

  const priorityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = {
    HOT: 'URGENT',
    WARM: 'HIGH',
    NORMAL: 'MEDIUM',
    LOW: 'LOW',
  };

  await leadRepository.update(leadId, {
    score: result.score,
    grade: result.grade,
    priority: priorityMap[result.priorityLevel] ?? 'MEDIUM',
    slaDeadline: computeSlaDeadline(result.grade),
    updatedById: ctx.actorId,
  });

  await leadScoringRepository.createAudit({
    userId: ctx.actorId,
    action: 'SCORE_CALCULATED',
    entityType: 'lead_score',
    entityId: record.id,
    lead: { connect: { id: leadId } },
    newValues: { score: result.score, grade: result.grade, riskRating: result.riskRating } as never,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    requestId: ctx.requestId,
  });

  return record;
}

export const leadScoringService = {
  async calculate(actor: AuthenticatedUser, leadId: string, ctx: RequestContext, options?: { aiScore?: number; force?: boolean }) {
    const lead = await prisma.lead.findFirst({
      where: applyLeadScope(actor, { id: leadId, deletedAt: null }),
    });
    if (!lead) throw new NotFoundError('Lead', leadId);

    if (!options?.force) {
      const latest = await leadScoringRepository.findLatestScore(leadId);
      const hoursSince = latest ? (Date.now() - new Date(latest.calculatedAt).getTime()) / 3600000 : 999;
      if (latest && hoursSince < 1) {
        return this.formatScoreResponse(latest);
      }
    }

    let profile = await buildProfileFromLead(leadId);
    profile = await enrichWithEligibility(profile, leadId, lead.productId, lead.customerId, ctx);

    const weights = await weightConfigService.getActiveWeights();
    const result = await scoringEngineService.scoreWithRules(profile, weights, options?.aiScore ?? 50);

    const previous = await leadScoringRepository.findLatestScore(leadId);
    const record = await persistScoreResult(
      leadId,
      result,
      ctx,
      previous ? { score: previous.score, grade: previous.grade } : null,
    );

    return this.formatScoreResponse(record, result);
  },

  async bulkCalculate(actor: AuthenticatedUser, input: BulkCalculateInput, ctx: RequestContext) {
    const results = [];
    for (const leadId of input.leadIds) {
      try {
        const score = await this.calculate(actor, leadId, ctx, { aiScore: input.aiScore, force: input.force });
        results.push({ leadId, success: true, score });
      } catch (err) {
        results.push({ leadId, success: false, error: err instanceof Error ? err.message : 'Failed' });
      }
    }

    await leadScoringRepository.createAudit({
      userId: ctx.actorId,
      action: 'BULK_SCORE_CALCULATED',
      entityType: 'lead_scoring',
      newValues: { count: input.leadIds.length, succeeded: results.filter((r) => r.success).length } as never,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return { results, total: input.leadIds.length, succeeded: results.filter((r) => r.success).length };
  },

  async getHistory(actor: AuthenticatedUser, leadId: string) {
    const lead = await prisma.lead.findFirst({
      where: applyLeadScope(actor, { id: leadId, deletedAt: null }),
    });
    if (!lead) throw new NotFoundError('Lead', leadId);

    const [history, latest, riskProfile, predictions] = await Promise.all([
      leadScoringRepository.listHistory(leadId, 50),
      leadScoringRepository.findLatestScore(leadId),
      prisma.leadRiskProfile.findFirst({ where: { leadId }, orderBy: { calculatedAt: 'desc' } }),
      prisma.leadPrediction.findMany({ where: { leadId }, orderBy: { calculatedAt: 'desc' }, take: 12 }),
    ]);

    return { history, latestScore: latest ? this.formatScoreResponse(latest) : null, riskProfile, predictions };
  },

  async getAnalytics(_actor: AuthenticatedUser, query: ScoringAnalyticsQuery): Promise<LeadScoringAnalytics> {
    const dateFilter = {
      ...(query.fromDate || query.toDate
        ? {
            calculatedAt: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {}),
    };

    const leadFilter = {
      ...(query.branchId ? { lead: { branchId: query.branchId } } : {}),
      ...(query.regionId ? { lead: { regionId: query.regionId } } : {}),
      ...dateFilter,
    };

    const [byGrade, byRisk, byPriority, totalScored, accurate, totalPreds, convertedLeads, totalLeads] = await Promise.all([
      leadScoringRepository.analyticsGroupByGrade(leadFilter),
      leadScoringRepository.analyticsGroupByRisk(leadFilter),
      leadScoringRepository.analyticsGroupByPriority(leadFilter),
      leadScoringRepository.countScores(leadFilter),
      leadScoringRepository.countAccuratePredictions(),
      leadScoringRepository.countTotalPredictions(),
      prisma.lead.count({ where: { status: { in: ['APPLICATION_CREATED', 'SANCTIONED', 'DISBURSED'] }, deletedAt: null } }),
      prisma.lead.count({ where: { deletedAt: null } }),
    ]);

    const gradeDistribution: Record<string, number> = {};
    let scoreSum = 0;
    let approvalSum = 0;
    let disbursalSum = 0;

    for (const row of byGrade) {
      gradeDistribution[row.grade] = row._count.id;
      scoreSum += (row._avg.score ?? 0) * row._count.id;
      approvalSum += Number(row._avg.approvalProbability ?? 0) * row._count.id;
      disbursalSum += Number(row._avg.disbursalProbability ?? 0) * row._count.id;
    }

    const riskDistribution: Record<string, number> = {};
    for (const row of byRisk) {
      if (row.riskRating) riskDistribution[row.riskRating] = row._count.id;
    }

    const priorityDistribution: Record<string, number> = {};
    for (const row of byPriority) {
      if (row.priorityLevel) priorityDistribution[row.priorityLevel] = row._count.id;
    }

    return {
      totalScored,
      gradeDistribution,
      riskDistribution,
      priorityDistribution,
      averageScore: totalScored > 0 ? Math.round(scoreSum / totalScored) : 0,
      averageApprovalProbability: totalScored > 0 ? Math.round(approvalSum / totalScored) : 0,
      averageDisbursalProbability: totalScored > 0 ? Math.round(disbursalSum / totalScored) : 0,
      conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
      predictionAccuracy: totalPreds > 0 ? Math.round((accurate / totalPreds) * 100) : 0,
    };
  },

  formatScoreResponse(record: {
    id: string;
    leadId: string;
    score: number;
    grade: string;
    classification?: string | null;
    ruleScore?: number | null;
    aiScore?: number | null;
    approvalProbability?: unknown;
    disbursalProbability?: unknown;
    conversionProbability?: unknown;
    riskRating?: string | null;
    priorityLevel?: string | null;
    riskIndicators?: unknown;
    factorBreakdown?: unknown;
    modelVersion: string;
    weightVersion?: string | null;
    calculatedAt: Date;
  }, engineResult?: LeadScoringEngineResult) {
    return {
      id: record.id,
      leadId: record.leadId,
      score: record.score,
      grade: record.grade,
      gradeAlias: GRADE_ALIASES[record.grade] ?? record.grade,
      classification: record.classification ?? GRADE_CLASSIFICATIONS[record.grade] ?? record.grade,
      ruleScore: record.ruleScore,
      aiScore: record.aiScore,
      approvalProbability: Number(record.approvalProbability ?? engineResult?.approvalProbability ?? 0),
      disbursalProbability: Number(record.disbursalProbability ?? engineResult?.disbursalProbability ?? 0),
      conversionProbability: Number(record.conversionProbability ?? engineResult?.conversionProbability ?? 0),
      riskRating: record.riskRating ?? engineResult?.riskRating,
      priorityLevel: record.priorityLevel ?? engineResult?.priorityLevel,
      riskIndicators: record.riskIndicators ?? engineResult?.riskIndicators ?? [],
      factorBreakdown: record.factorBreakdown ?? engineResult?.factorBreakdown ?? {},
      predictions: engineResult?.predictions,
      modelVersion: record.modelVersion,
      weightVersion: record.weightVersion ?? DEFAULT_WEIGHT_VERSION,
      calculatedAt: record.calculatedAt,
    };
  },

  rules: scoringRulesService,
  weights: weightConfigService,
};
