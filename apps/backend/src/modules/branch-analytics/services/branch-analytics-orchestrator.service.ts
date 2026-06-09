import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  BranchApplicationsQuery,
  BranchDashboardQuery,
  BranchExportQuery,
  BranchForecastQuery,
  BranchLeadsQuery,
  BranchPartnersQuery,
  BranchPerformanceQuery,
  BranchRankingsQuery,
  BranchRevenueQuery,
  BranchTargetsQuery,
  CreateBranchTarget,
} from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { aggregationEngineService } from '../../analytics/services/aggregation-engine.service.js';
import { analyticsCacheService } from '../../analytics/services/analytics-cache.service.js';
import { CONVERTED_STATUSES } from '../../leads/constants/leads.constants.js';
import { leadAnalyticsService } from '../../leads/services/lead-analytics.service.js';
import { BRANCH_CACHE_TTL_MS } from '../constants/branch-analytics.constants.js';
import { branchAnalyticsRepository } from '../repositories/branch-analytics.repository.js';
import { scopedBranchQuery } from '../utils/branch-date.utils.js';
import { branchWhere, resolveBranchScope } from '../utils/branch-scope.utils.js';

import { branchExportEngineService } from './branch-export-engine.service.js';
import { branchForecastEngineService } from './branch-forecast-engine.service.js';
import { branchMetricEngineService } from './branch-metric-engine.service.js';
import { branchPerformanceEngineService } from './branch-performance-engine.service.js';
import { branchRankingEngineService } from './branch-ranking-engine.service.js';
import { branchTargetEngineService } from './branch-target-engine.service.js';

async function resolvePrimaryBranch(
  actor: AuthenticatedUser,
  query: BranchDashboardQuery,
  scope: Awaited<ReturnType<typeof resolveBranchScope>>['scope'],
) {
  const branchId = query.branchId ?? scope.branchIds[0] ?? actor.branchId;
  if (!branchId) return undefined;
  return branchAnalyticsRepository.getBranch(branchId);
}

async function trendPoints(branchId: string, metric: 'leads' | 'applications' | 'revenue' | 'disbursements', period: ReturnType<typeof scopedBranchQuery>) {
  const days = Math.min(30, Math.ceil((period.toDate.getTime() - period.fromDate.getTime()) / 86400000));
  const points: Array<{ date: string; value: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(period.toDate);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    let value = 0;
    if (metric === 'leads') {
      value = await prisma.lead.count({ where: { branchId, deletedAt: null, createdAt: { gte: d, lte: end } } });
    } else if (metric === 'applications') {
      value = await prisma.application.count({ where: { branchId, deletedAt: null, createdAt: { gte: d, lte: end } } });
    } else if (metric === 'revenue' || metric === 'disbursements') {
      const agg = await prisma.disbursement.aggregate({
        where: { application: { branchId }, disbursementDate: { gte: d, lte: end } },
        _sum: { disbursementAmount: true },
      });
      value = Number(agg._sum.disbursementAmount ?? 0);
    }
    points.push({ date: d.toISOString().slice(0, 10), value });
  }
  return points;
}

export const branchAnalyticsOrchestratorService = {
  async dashboard(actor: AuthenticatedUser, rawQuery: BranchDashboardQuery) {
    const { query, scope } = await resolveBranchScope(actor, rawQuery);
    const period = scopedBranchQuery(query);
    const branch = await resolvePrimaryBranch(actor, query, scope);
    if (!branch) return { period, kpis: [], trends: {}, ai: {}, branch: null, scope };

    const branchId = branch.id;
    const branchScope = { ...scope, branchIds: [branchId] };
    const cacheKey = `branch:dashboard:${branchId}:${period.periodType}:${period.fromDate.toISOString()}`;
    const cached = analyticsCacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const q = {
      ...branchWhere(branchScope, branchId),
      fromDate: period.fromDate,
      toDate: period.toDate,
    };

    const [
      leadKpis,
      appKpis,
      revKpis,
      commissionKpis,
      supportKpis,
      productMix,
      partnerPerf,
      executives,
      leadSummary,
      aiSummary,
      leadTrend,
      appTrend,
      revTrend,
      disbTrend,
    ] = await Promise.all([
      branchMetricEngineService.computeLeadKpis(branchScope, period, branchId),
      branchMetricEngineService.computeApplicationKpis(branchScope, period, branchId),
      branchMetricEngineService.computeRevenueKpis(branchScope, period, branchId),
      branchMetricEngineService.computeCommissionKpis(branchScope, period, branchId),
      branchMetricEngineService.computeSupportKpis(actor, branchScope, period, branchId),
      branchMetricEngineService.computeProductMix(branchScope, period, branchId),
      branchMetricEngineService.computePartnerPerformance(branchScope, period, branchId),
      branchMetricEngineService.computeExecutiveSummary(branchScope, period, branchId),
      leadAnalyticsService.getSummary(q as never),
      aggregationEngineService.getAiSummary({
        fromDate: period.fromDate,
        toDate: period.toDate,
        branchId,
      }),
      trendPoints(branchId, 'leads', period),
      trendPoints(branchId, 'applications', period),
      trendPoints(branchId, 'revenue', period),
      trendPoints(branchId, 'disbursements', period),
    ]);

    const branchUserIds = await prisma.employee.findMany({
      where: { branchId, isActive: true },
      select: { userId: true },
    });
    const userIds = branchUserIds.map((e) => e.userId).filter(Boolean) as string[];
    const aiUsage = userIds.length
      ? await prisma.aiUsageLog.count({
          where: { userId: { in: userIds }, createdAt: { gte: period.fromDate, lte: period.toDate } },
        })
      : 0;
    const voiceAi = userIds.length
      ? await prisma.aiUsageLog.count({
          where: { userId: { in: userIds }, module: 'VOICE_AI', createdAt: { gte: period.fromDate, lte: period.toDate } },
        })
      : 0;
    const copilot = userIds.length
      ? await prisma.aiUsageLog.count({
          where: { userId: { in: userIds }, module: 'COPILOT', createdAt: { gte: period.fromDate, lte: period.toDate } },
        })
      : 0;
    const recommendations = await prisma.recommendation.count({
      where: { createdAt: { gte: period.fromDate, lte: period.toDate } },
    });

    const kpis = [...leadKpis, ...appKpis, ...revKpis, ...commissionKpis, ...supportKpis];
    const scores = await branchPerformanceEngineService.compute(actor, branchScope, period, branchId);

    const result = {
      period,
      branch: { id: branch.id, name: branch.name, code: branch.code, city: branch.city, state: branch.state },
      scores,
      kpis,
      leadAnalytics: {
        leadSourcePerformance: leadSummary.bySource ?? [],
        partnerSourcePerformance: partnerPerf,
        summary: leadSummary,
      },
      applicationAnalytics: { kpis: appKpis },
      revenueAnalytics: { kpis: revKpis },
      productAnalytics: { productMix },
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
        aiEffectiveness: aiUsage > 0 ? Math.round((1 - (aiSummary.failureCount ?? 0) / aiUsage) * 100) : 100,
      },
      trends: {
        leads: leadTrend,
        applications: appTrend,
        revenue: revTrend,
        disbursements: disbTrend,
        branchGrowth: leadTrend,
        executives: executives.topPerformers,
        partners: partnerPerf,
      },
      scope: { canViewRegion: scope.canViewRegion, canViewAll: scope.canViewAll, branchIds: scope.branchIds },
    };

    analyticsCacheService.set(cacheKey, result, BRANCH_CACHE_TTL_MS);
    return result;
  },

  async performance(actor: AuthenticatedUser, rawQuery: BranchPerformanceQuery) {
    const { query, scope } = await resolveBranchScope(actor, rawQuery);
    const period = scopedBranchQuery(query);
    const branchId = query.branchId ?? scope.branchIds[0] ?? actor.branchId;
    if (!branchId) return { period, scores: null, kpis: [] };

    const branchScope = { ...scope, branchIds: [branchId] };
    const scores = await branchPerformanceEngineService.compute(actor, branchScope, period, branchId);
    const [leadKpis, appKpis, revKpis] = await Promise.all([
      branchMetricEngineService.computeLeadKpis(branchScope, period, branchId),
      branchMetricEngineService.computeApplicationKpis(branchScope, period, branchId),
      branchMetricEngineService.computeRevenueKpis(branchScope, period, branchId),
    ]);

    return {
      period,
      branchId,
      scores,
      kpis: [...leadKpis, ...appKpis, ...revKpis],
      trends: {
        growth: await trendPoints(branchId, 'leads', period),
        revenue: await trendPoints(branchId, 'revenue', period),
      },
    };
  },

  async revenue(actor: AuthenticatedUser, rawQuery: BranchRevenueQuery) {
    const { query, scope } = await resolveBranchScope(actor, rawQuery);
    const period = scopedBranchQuery(query);
    const branchId = query.branchId ?? scope.branchIds[0] ?? actor.branchId;
    if (!branchId) return { period, kpis: [], trends: [] };

    const branchScope = { ...scope, branchIds: [branchId] };
    const kpis = await branchMetricEngineService.computeRevenueKpis(branchScope, period, branchId);
    const dateFilter = { gte: period.fromDate, lte: period.toDate };

    let trends: Array<Record<string, unknown>> = [];
    if (rawQuery.groupBy === 'product') {
      const byProduct = await prisma.disbursement.groupBy({
        by: ['applicationId'],
        where: { application: { branchId }, disbursementDate: dateFilter },
        _sum: { disbursementAmount: true },
      });
      const appIds = byProduct.map((r) => r.applicationId);
      const apps = appIds.length
        ? await prisma.application.findMany({ where: { id: { in: appIds } }, select: { id: true, productId: true } })
        : [];
      const appProductMap = new Map(apps.map((a) => [a.id, a.productId]));
      const productTotals = new Map<string, number>();
      for (const row of byProduct) {
        const productId = appProductMap.get(row.applicationId) ?? 'unknown';
        productTotals.set(productId, (productTotals.get(productId) ?? 0) + Number(row._sum.disbursementAmount ?? 0));
      }
      trends = [...productTotals.entries()].map(([productId, value]) => ({ productId, value }));
    } else if (rawQuery.groupBy === 'executive') {
      const byExec = await prisma.disbursement.groupBy({
        by: ['applicationId'],
        where: { application: { branchId }, disbursementDate: dateFilter },
        _sum: { disbursementAmount: true },
      });
      const appIds = byExec.map((r) => r.applicationId);
      const apps = appIds.length
        ? await prisma.application.findMany({
            where: { id: { in: appIds } },
            select: { id: true, assignedSalesId: true, assignedSales: { select: { firstName: true, lastName: true } } },
          })
        : [];
      const appExecMap = new Map(apps.map((a) => [a.id, a]));
      const execTotals = new Map<string, { name: string; value: number }>();
      for (const row of byExec) {
        const app = appExecMap.get(row.applicationId);
        const execId = app?.assignedSalesId ?? 'unassigned';
        const name = app?.assignedSales ? `${app.assignedSales.firstName} ${app.assignedSales.lastName}` : 'Unassigned';
        const current = execTotals.get(execId) ?? { name, value: 0 };
        current.value += Number(row._sum.disbursementAmount ?? 0);
        execTotals.set(execId, current);
      }
      trends = [...execTotals.values()];
    } else {
      trends = await trendPoints(branchId, 'revenue', period);
    }

    return { period, branchId, kpis, trends, monthlyTrends: await trendPoints(branchId, 'revenue', period) };
  },

  async leads(actor: AuthenticatedUser, rawQuery: BranchLeadsQuery) {
    const { query, scope } = await resolveBranchScope(actor, rawQuery);
    const period = scopedBranchQuery(query);
    const branchId = query.branchId ?? scope.branchIds[0] ?? actor.branchId;
    if (!branchId) return { period, kpis: [], sources: [] };

    const branchScope = { ...scope, branchIds: [branchId] };
    const kpis = await branchMetricEngineService.computeLeadKpis(branchScope, period, branchId);
    const summary = await leadAnalyticsService.getSummary({
      ...branchWhere(branchScope, branchId),
      fromDate: period.fromDate,
      toDate: period.toDate,
    } as never);

    return {
      period,
      branchId,
      kpis,
      sources: summary.bySource ?? [],
      partnerSources: await branchMetricEngineService.computePartnerPerformance(branchScope, period, branchId),
      trends: await trendPoints(branchId, 'leads', period),
    };
  },

  async applications(actor: AuthenticatedUser, rawQuery: BranchApplicationsQuery) {
    const { query, scope } = await resolveBranchScope(actor, rawQuery);
    const period = scopedBranchQuery(query);
    const branchId = query.branchId ?? scope.branchIds[0] ?? actor.branchId;
    if (!branchId) return { period, kpis: [], productMix: [] };

    const branchScope = { ...scope, branchIds: [branchId] };
    const kpis = await branchMetricEngineService.computeApplicationKpis(branchScope, period, branchId);
    const productMix = await branchMetricEngineService.computeProductMix(branchScope, period, branchId);

    return {
      period,
      branchId,
      kpis,
      productMix,
      trends: await trendPoints(branchId, 'applications', period),
    };
  },

  async partners(actor: AuthenticatedUser, rawQuery: BranchPartnersQuery) {
    const { query, scope } = await resolveBranchScope(actor, rawQuery);
    const period = scopedBranchQuery(query);
    const branchId = query.branchId ?? scope.branchIds[0] ?? actor.branchId;
    if (!branchId) return { period, partners: [] };

    const branchScope = { ...scope, branchIds: [branchId] };
    const partners = await branchMetricEngineService.computePartnerPerformance(branchScope, period, branchId);
    const dateFilter = { gte: period.fromDate, lte: period.toDate };

    const enriched = await Promise.all(
      partners.map(async (p) => {
        const converted = await prisma.lead.count({
          where: { branchId, partnerId: p.partnerId, status: { in: [...CONVERTED_STATUSES] }, createdAt: dateFilter },
        });
        const revenueAgg = await prisma.disbursement.aggregate({
          where: {
            application: { branchId, lead: { partnerId: p.partnerId } },
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

    const byType = enriched.reduce<Record<string, typeof enriched>>((acc, p) => {
      const key = p.partnerType || 'Other';
      acc[key] = acc[key] ?? [];
      acc[key].push(p);
      return acc;
    }, {});

    return { period, branchId, partners: enriched, byType, trends: enriched };
  },

  async forecast(actor: AuthenticatedUser, rawQuery: BranchForecastQuery) {
    const { query, scope } = await resolveBranchScope(actor, rawQuery);
    const period = scopedBranchQuery(query);
    const branchId = query.branchId ?? scope.branchIds[0] ?? actor.branchId;
    if (!branchId) return { period, forecasts: [] };
    return branchForecastEngineService.get(actor, { ...scope, branchIds: [branchId] }, period, branchId, rawQuery);
  },

  async rankings(actor: AuthenticatedUser, rawQuery: BranchRankingsQuery) {
    const { query, scope } = await resolveBranchScope(actor, rawQuery);
    const period = scopedBranchQuery(query);
    return branchRankingEngineService.get(actor, scope, period, rawQuery);
  },

  targets: (actor: AuthenticatedUser, query: BranchTargetsQuery & { page?: number; limit?: number }) =>
    branchTargetEngineService.list(actor, query),

  createTarget: (actor: AuthenticatedUser, data: CreateBranchTarget) => branchTargetEngineService.create(actor, data),

  export: (actor: AuthenticatedUser, query: BranchExportQuery) => branchExportEngineService.buildExport(actor, query),
};
