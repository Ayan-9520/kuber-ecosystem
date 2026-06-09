import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  CreateRegionalTarget,
  RegionalApplicationsQuery,
  RegionalBranchesQuery,
  RegionalDashboardQuery,
  RegionalExportQuery,
  RegionalForecastQuery,
  RegionalLeadsQuery,
  RegionalPartnersQuery,
  RegionalPerformanceQuery,
  RegionalRankingsQuery,
  RegionalRevenueQuery,
  RegionalTargetsQuery,
} from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { aggregationEngineService } from '../../analytics/services/aggregation-engine.service.js';
import { analyticsCacheService } from '../../analytics/services/analytics-cache.service.js';
import { CONVERTED_STATUSES } from '../../leads/constants/leads.constants.js';
import { leadAnalyticsService } from '../../leads/services/lead-analytics.service.js';
import { REGIONAL_CACHE_TTL_MS } from '../constants/regional-analytics.constants.js';
import { regionalAnalyticsRepository } from '../repositories/regional-analytics.repository.js';
import { scopedRegionalQuery } from '../utils/regional-date.utils.js';
import { branchFilter, regionWhere, resolveRegionalScope } from '../utils/regional-scope.utils.js';

import { regionalExportEngineService } from './regional-export-engine.service.js';
import { regionalForecastEngineService } from './regional-forecast-engine.service.js';
import { regionalMetricEngineService } from './regional-metric-engine.service.js';
import { regionalPerformanceEngineService } from './regional-performance-engine.service.js';
import { regionalRankingEngineService } from './regional-ranking-engine.service.js';
import { regionalTargetEngineService } from './regional-target-engine.service.js';

async function resolvePrimaryRegion(
  actor: AuthenticatedUser,
  query: RegionalDashboardQuery,
  scope: Awaited<ReturnType<typeof resolveRegionalScope>>['scope'],
) {
  const regionId = query.regionId ?? scope.regionId ?? actor.regionId;
  if (!regionId) return undefined;
  return regionalAnalyticsRepository.getRegion(regionId);
}

async function trendPoints(
  scope: Awaited<ReturnType<typeof resolveRegionalScope>>['scope'],
  metric: 'leads' | 'applications' | 'revenue' | 'disbursements',
  period: ReturnType<typeof scopedRegionalQuery>,
) {
  const days = Math.min(30, Math.ceil((period.toDate.getTime() - period.fromDate.getTime()) / 86400000));
  const points: Array<{ date: string; value: number }> = [];
  const bf = branchFilter(scope);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(period.toDate);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    let value = 0;
    if (metric === 'leads') {
      value = await prisma.lead.count({ where: { ...bf, deletedAt: null, createdAt: { gte: d, lte: end } } });
    } else if (metric === 'applications') {
      value = await prisma.application.count({ where: { ...bf, deletedAt: null, createdAt: { gte: d, lte: end } } });
    } else {
      const agg = await prisma.disbursement.aggregate({
        where: { application: { ...bf }, disbursementDate: { gte: d, lte: end } },
        _sum: { disbursementAmount: true },
      });
      value = Number(agg._sum.disbursementAmount ?? 0);
    }
    points.push({ date: d.toISOString().slice(0, 10), value });
  }
  return points;
}

async function computeAiAdoption(scope: Awaited<ReturnType<typeof resolveRegionalScope>>['scope'], period: ReturnType<typeof scopedRegionalQuery>) {
  const employees = await prisma.employee.findMany({
    where: {
      ...(scope.branchIds.length ? { branchId: { in: scope.branchIds } } : { branch: { regionId: scope.regionId } }),
      isActive: true,
    },
    select: { userId: true },
  });
  const userIds = employees.map((e) => e.userId).filter(Boolean);
  if (!userIds.length) return 0;
  const aiUsage = await prisma.aiUsageLog.count({
    where: { userId: { in: userIds }, createdAt: { gte: period.fromDate, lte: period.toDate } },
  });
  return Math.min(100, aiUsage * 2);
}

export const regionalAnalyticsOrchestratorService = {
  async dashboard(actor: AuthenticatedUser, rawQuery: RegionalDashboardQuery) {
    const { query, scope } = await resolveRegionalScope(actor, rawQuery);
    const period = scopedRegionalQuery(query);
    const region = await resolvePrimaryRegion(actor, query, scope);
    if (!region) return { period, kpis: [], trends: {}, ai: {}, region: null, scope };

    const regionId = region.id;
    const cacheKey = `regional:dashboard:${regionId}:${period.periodType}:${period.fromDate.toISOString()}`;
    const cached = analyticsCacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const q = { ...regionWhere(scope), fromDate: period.fromDate, toDate: period.toDate };

    const [
      overviewKpis,
      leadKpis,
      appKpis,
      revKpis,
      commissionKpis,
      supportKpis,
      productMix,
      partnerPerf,
      branchLeads,
      executives,
      branchComparison,
      leadSummary,
      aiSummary,
      leadTrend,
      appTrend,
      revTrend,
      disbTrend,
      aiAdoption,
    ] = await Promise.all([
      regionalMetricEngineService.computeOverviewKpis(scope, period, regionId),
      regionalMetricEngineService.computeLeadKpis(scope, period, regionId),
      regionalMetricEngineService.computeApplicationKpis(scope, period, regionId),
      regionalMetricEngineService.computeRevenueKpis(scope, period, regionId),
      regionalMetricEngineService.computeCommissionKpis(scope, period),
      regionalMetricEngineService.computeSupportKpis(actor, scope, period),
      regionalMetricEngineService.computeProductMix(scope, period),
      regionalMetricEngineService.computePartnerPerformance(scope, period),
      regionalMetricEngineService.computeBranchLeadContribution(scope, period),
      regionalMetricEngineService.computeExecutiveSummary(scope, period),
      regionalMetricEngineService.computeBranchComparison(scope, period),
      leadAnalyticsService.getSummary(q as never),
      aggregationEngineService.getAiSummary({ fromDate: period.fromDate, toDate: period.toDate, regionId }),
      trendPoints(scope, 'leads', period),
      trendPoints(scope, 'applications', period),
      trendPoints(scope, 'revenue', period),
      trendPoints(scope, 'disbursements', period),
      computeAiAdoption(scope, period),
    ]);

    const employees = await prisma.employee.findMany({
      where: {
        ...(scope.branchIds.length ? { branchId: { in: scope.branchIds } } : { branch: { regionId } }),
        isActive: true,
      },
      select: { userId: true },
    });
    const userIds = employees.map((e) => e.userId).filter(Boolean) as string[];
    const [aiUsage, voiceAi, copilot, recommendations] = await Promise.all([
      userIds.length
        ? prisma.aiUsageLog.count({ where: { userId: { in: userIds }, createdAt: { gte: period.fromDate, lte: period.toDate } } })
        : 0,
      userIds.length
        ? prisma.aiUsageLog.count({
            where: { userId: { in: userIds }, module: 'VOICE_AI', createdAt: { gte: period.fromDate, lte: period.toDate } },
          })
        : 0,
      userIds.length
        ? prisma.aiUsageLog.count({
            where: { userId: { in: userIds }, module: 'COPILOT', createdAt: { gte: period.fromDate, lte: period.toDate } },
          })
        : 0,
      prisma.recommendation.count({ where: { createdAt: { gte: period.fromDate, lte: period.toDate } } }),
    ]);

    const kpis = [...overviewKpis, ...leadKpis, ...appKpis, ...revKpis, ...commissionKpis, ...supportKpis];
    const scores = await regionalPerformanceEngineService.compute(actor, scope, period, regionId, aiAdoption);

    const result = {
      period,
      region: { id: region.id, name: region.name, code: region.code },
      scores,
      kpis,
      overview: { kpis: overviewKpis },
      leadAnalytics: {
        kpis: leadKpis,
        leadSourcePerformance: leadSummary.bySource ?? [],
        gradeDistribution: leadSummary.byGrade ?? {},
        branchContribution: branchLeads,
        partnerContribution: partnerPerf,
      },
      applicationAnalytics: { kpis: appKpis },
      revenueAnalytics: { kpis: revKpis },
      productAnalytics: { productMix },
      branchComparison,
      executiveAnalytics: executives,
      partnerAnalytics: { partners: partnerPerf },
      commissionAnalytics: { kpis: commissionKpis },
      supportAnalytics: { kpis: supportKpis },
      ai: {
        ...aiSummary,
        aiUsage,
        voiceAiUsage: voiceAi,
        copilotUsage: copilot,
        recommendationAdoption: recommendations,
        aiConversionImpact: aiUsage > 0 ? Math.round((1 - (aiSummary.failureCount ?? 0) / aiUsage) * 100) : 100,
      },
      trends: {
        regional: leadTrend,
        branches: branchLeads,
        revenue: revTrend,
        leads: leadTrend,
        applications: appTrend,
        partners: partnerPerf,
        ai: [{ date: period.toDate.toISOString().slice(0, 10), value: aiUsage }],
        growth: leadTrend,
        disbursements: disbTrend,
      },
      scope: { canViewAll: scope.canViewAll, regionId: scope.regionId, branchIds: scope.branchIds },
    };

    analyticsCacheService.set(cacheKey, result, REGIONAL_CACHE_TTL_MS);
    return result;
  },

  async performance(actor: AuthenticatedUser, rawQuery: RegionalPerformanceQuery) {
    const { query, scope } = await resolveRegionalScope(actor, rawQuery);
    const period = scopedRegionalQuery(query);
    const regionId = query.regionId ?? scope.regionId;
    if (!regionId) return { period, scores: null, kpis: [] };

    const aiAdoption = await computeAiAdoption(scope, period);
    const scores = await regionalPerformanceEngineService.compute(actor, scope, period, regionId, aiAdoption);
    const overview = await regionalMetricEngineService.computeOverviewKpis(scope, period, regionId);
    const leadKpis = await regionalMetricEngineService.computeLeadKpis(scope, period, regionId);
    const revKpis = await regionalMetricEngineService.computeRevenueKpis(scope, period, regionId);

    return {
      period,
      regionId,
      scores,
      kpis: [...overview, ...leadKpis, ...revKpis],
      trends: {
        revenue: await trendPoints(scope, 'revenue', period),
        growth: await trendPoints(scope, 'leads', period),
      },
    };
  },

  async revenue(actor: AuthenticatedUser, rawQuery: RegionalRevenueQuery) {
    const { query, scope } = await resolveRegionalScope(actor, rawQuery);
    const period = scopedRegionalQuery(query);
    const regionId = query.regionId ?? scope.regionId;
    if (!regionId) return { period, kpis: [], trends: [] };

    const kpis = await regionalMetricEngineService.computeRevenueKpis(scope, period, regionId);
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    let trends: Array<Record<string, unknown>> = [];

    if (rawQuery.groupBy === 'branch') {
      const byBranch = await prisma.disbursement.groupBy({
        by: ['applicationId'],
        where: { application: { ...branchFilter(scope) }, disbursementDate: dateFilter },
        _sum: { disbursementAmount: true },
      });
      const appIds = byBranch.map((r) => r.applicationId);
      const apps = appIds.length
        ? await prisma.application.findMany({ where: { id: { in: appIds } }, select: { id: true, branchId: true } })
        : [];
      const appBranchMap = new Map(apps.map((a) => [a.id, a.branchId]));
      const branchTotals = new Map<string, number>();
      for (const row of byBranch) {
        const branchId = appBranchMap.get(row.applicationId) ?? 'unknown';
        branchTotals.set(branchId, (branchTotals.get(branchId) ?? 0) + Number(row._sum.disbursementAmount ?? 0));
      }
      const branchIds = [...branchTotals.keys()].filter((id) => id !== 'unknown');
      const branches = branchIds.length ? await prisma.branch.findMany({ where: { id: { in: branchIds } } }) : [];
      const branchMap = new Map(branches.map((b) => [b.id, b]));
      trends = [...branchTotals.entries()].map(([branchId, value]) => ({
        branchId,
        branchName: branchMap.get(branchId)?.name ?? 'Unknown',
        value,
      }));
    } else if (rawQuery.groupBy === 'product') {
      const mix = await regionalMetricEngineService.computeProductMix(scope, period);
      trends = mix.map((p) => ({ productId: p.productId, productName: p.productName, value: p.count }));
    } else {
      trends = await trendPoints(scope, 'revenue', period);
    }

    return { period, regionId, kpis, trends, monthlyTrends: await trendPoints(scope, 'revenue', period) };
  },

  async leads(actor: AuthenticatedUser, rawQuery: RegionalLeadsQuery) {
    const { query, scope } = await resolveRegionalScope(actor, rawQuery);
    const period = scopedRegionalQuery(query);
    const regionId = query.regionId ?? scope.regionId;
    if (!regionId) return { period, kpis: [], sources: [] };

    const kpis = await regionalMetricEngineService.computeLeadKpis(scope, period, regionId);
    const summary = await leadAnalyticsService.getSummary({
      ...regionWhere(scope),
      fromDate: period.fromDate,
      toDate: period.toDate,
    } as never);

    return {
      period,
      regionId,
      kpis,
      sources: summary.bySource ?? [],
      gradeDistribution: summary.byGrade ?? {},
      branchContribution: await regionalMetricEngineService.computeBranchLeadContribution(scope, period),
      partnerContribution: await regionalMetricEngineService.computePartnerPerformance(scope, period),
      trends: await trendPoints(scope, 'leads', period),
    };
  },

  async applications(actor: AuthenticatedUser, rawQuery: RegionalApplicationsQuery) {
    const { query, scope } = await resolveRegionalScope(actor, rawQuery);
    const period = scopedRegionalQuery(query);
    const regionId = query.regionId ?? scope.regionId;
    if (!regionId) return { period, kpis: [], branchComparison: [] };

    const kpis = await regionalMetricEngineService.computeApplicationKpis(scope, period, regionId);
    const comparison = await regionalMetricEngineService.computeBranchComparison(scope, period);

    return {
      period,
      regionId,
      kpis,
      branchComparison: comparison.branches,
      productMix: await regionalMetricEngineService.computeProductMix(scope, period),
      trends: await trendPoints(scope, 'applications', period),
    };
  },

  async branches(actor: AuthenticatedUser, rawQuery: RegionalBranchesQuery) {
    const { query, scope } = await resolveRegionalScope(actor, rawQuery);
    const period = scopedRegionalQuery(query);
    const regionId = query.regionId ?? scope.regionId;
    if (!regionId) return { period, comparison: null };

    const comparison = await regionalMetricEngineService.computeBranchComparison(scope, period);
    return { period, regionId, comparison };
  },

  async partners(actor: AuthenticatedUser, rawQuery: RegionalPartnersQuery) {
    const { query, scope } = await resolveRegionalScope(actor, rawQuery);
    const period = scopedRegionalQuery(query);
    const regionId = query.regionId ?? scope.regionId;
    if (!regionId) return { period, partners: [] };

    const partners = await regionalMetricEngineService.computePartnerPerformance(scope, period);
    const dateFilter = { gte: period.fromDate, lte: period.toDate };
    const bf = branchFilter(scope);

    const enriched = await Promise.all(
      partners.map(async (p) => {
        const converted = await prisma.lead.count({
          where: { ...bf, partnerId: p.partnerId, status: { in: [...CONVERTED_STATUSES] }, createdAt: dateFilter },
        });
        const revenueAgg = await prisma.disbursement.aggregate({
          where: {
            application: { ...bf, lead: { partnerId: p.partnerId } },
            disbursementDate: dateFilter,
          },
          _sum: { disbursementAmount: true },
        });
        return {
          ...p,
          conversions: converted,
          conversionRate: p.leads > 0 ? Math.round((converted / p.leads) * 10000) / 100 : 0,
          revenue: Number(revenueAgg._sum.disbursementAmount ?? 0),
        };
      }),
    );

    enriched.sort((a, b) => b.revenue - a.revenue);
    return { period, regionId, partners: enriched, partnerRanking: enriched };
  },

  async forecast(actor: AuthenticatedUser, rawQuery: RegionalForecastQuery) {
    const { query, scope } = await resolveRegionalScope(actor, rawQuery);
    const period = scopedRegionalQuery(query);
    const regionId = query.regionId ?? scope.regionId;
    if (!regionId) return { period, forecasts: [] };
    return regionalForecastEngineService.get(scope, period, regionId, rawQuery);
  },

  async rankings(actor: AuthenticatedUser, rawQuery: RegionalRankingsQuery) {
    const { query, scope } = await resolveRegionalScope(actor, rawQuery);
    const period = scopedRegionalQuery(query);
    return regionalRankingEngineService.get(actor, scope, period, rawQuery);
  },

  targets: (actor: AuthenticatedUser, query: RegionalTargetsQuery & { page?: number; limit?: number }) =>
    regionalTargetEngineService.list(actor, query),

  createTarget: (actor: AuthenticatedUser, data: CreateRegionalTarget) => regionalTargetEngineService.create(actor, data),

  export: (actor: AuthenticatedUser, query: RegionalExportQuery) => regionalExportEngineService.buildExport(actor, query),
};
