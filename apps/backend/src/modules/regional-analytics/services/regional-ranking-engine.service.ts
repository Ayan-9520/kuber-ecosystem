import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { RegionalRankingsQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { analyticsCacheService } from '../../analytics/services/analytics-cache.service.js';
import { REGIONAL_CACHE_TTL_MS } from '../constants/regional-analytics.constants.js';
import { regionalAnalyticsRepository } from '../repositories/regional-analytics.repository.js';
import type { RegionalRankingType, RegionalScope, ResolvedRegionalPeriod } from '../types/regional-analytics.types.js';

import { regionalMetricEngineService } from './regional-metric-engine.service.js';
import { regionalPerformanceEngineService } from './regional-performance-engine.service.js';

export const regionalRankingEngineService = {
  async get(actor: AuthenticatedUser, scope: RegionalScope, period: ResolvedRegionalPeriod, rawQuery: RegionalRankingsQuery) {
    const rankingType = (rawQuery.rankingType ?? 'BRANCH') as RegionalRankingType;
    const limit = rawQuery.limit ?? 20;
    const regionId = scope.regionId;

    const cacheKey = `regional:rankings:${rankingType}:${period.periodType}:${period.fromDate.toISOString()}:${regionId ?? 'all'}`;
    const cached = analyticsCacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const persisted = await regionalAnalyticsRepository.listRankings({
      rankingType,
      periodType: period.periodType,
      periodStart: period.fromDate,
      regionId,
      limit,
    });

    if (persisted.length) {
      const result = { period, rankingType, entries: persisted };
      analyticsCacheService.set(cacheKey, result, REGIONAL_CACHE_TTL_MS);
      return result;
    }

    let entries: Array<Record<string, unknown>> = [];

    if (rankingType === 'BRANCH' && regionId) {
      const comparison = await regionalMetricEngineService.computeBranchComparison(scope, period);
      entries = comparison.revenueRanking.slice(0, limit).map((b, idx) => ({
        rank: idx + 1,
        score: b.revenue,
        branchId: b.branch.id,
        branch: b.branch,
        metrics: { leads: b.leads, apps: b.apps, revenue: b.revenue, conversionRate: b.conversionRate },
      }));
    } else if (rankingType === 'REGION' && scope.canViewAll) {
      const regions = await prisma.region.findMany({ where: { isActive: true }, take: 20 });
      const scored = await Promise.all(
        regions.map(async (region) => {
          const branchIds = (
            await prisma.branch.findMany({ where: { regionId: region.id, isActive: true }, select: { id: true } })
          ).map((b) => b.id);
          const regionScope = { regionId: region.id, branchIds, canViewAll: true };
          const scores = await regionalPerformanceEngineService.compute(actor, regionScope, period, region.id);
          const revenueAgg = await prisma.disbursement.aggregate({
            where: {
              application: { branchId: { in: branchIds } },
              disbursementDate: { gte: period.fromDate, lte: period.toDate },
            },
            _sum: { disbursementAmount: true },
          });
          return { region, score: scores.overallScore, revenue: Number(revenueAgg._sum.disbursementAmount ?? 0), metrics: scores };
        }),
      );
      scored.sort((a, b) => b.score - a.score);
      entries = scored.slice(0, limit).map((e, idx) => ({
        rank: idx + 1,
        score: e.score,
        regionId: e.region.id,
        region: e.region,
        metrics: { revenue: e.revenue, ...e.metrics },
      }));
    } else if (rankingType === 'PRODUCT') {
      const mix = await regionalMetricEngineService.computeProductMix(scope, period);
      mix.sort((a, b) => b.count - a.count);
      entries = mix.slice(0, limit).map((p, idx) => ({
        rank: idx + 1,
        score: p.count,
        productId: p.productId,
        product: { name: p.productName, familyCode: p.familyCode },
        metrics: { count: p.count },
      }));
    } else if (rankingType === 'PARTNER') {
      const partners = await regionalMetricEngineService.computePartnerPerformance(scope, period);
      partners.sort((a, b) => b.leads - a.leads);
      entries = partners.slice(0, limit).map((p, idx) => ({
        rank: idx + 1,
        score: p.leads,
        partnerId: p.partnerId,
        partner: { name: p.partnerName, type: p.partnerType },
        metrics: { leads: p.leads },
      }));
    } else if (rankingType === 'EXECUTIVE') {
      const execs = await regionalMetricEngineService.computeExecutiveSummary(scope, period);
      entries = execs.topPerformers.slice(0, limit).map((e, idx) => ({
        rank: idx + 1,
        score: e.score,
        employeeId: e.employee.id,
        employee: e.employee,
        metrics: { leads: e.leads, apps: e.apps, revenue: e.revenue, conversionRate: e.conversionRate },
      }));
    }

    const result = { period, rankingType, entries };
    analyticsCacheService.set(cacheKey, result, REGIONAL_CACHE_TTL_MS);
    return result;
  },

  async rebuild(periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY', periodStart: Date, periodEnd: Date): Promise<number> {
    const regions = await prisma.region.findMany({ where: { isActive: true }, take: 20 });
    let written = 0;

    for (const region of regions) {
      const branchIds = (
        await prisma.branch.findMany({ where: { regionId: region.id, isActive: true }, select: { id: true } })
      ).map((b) => b.id);
      const scope = { regionId: region.id, branchIds, canViewAll: true };
      const period = { fromDate: periodStart, toDate: periodEnd, periodType } as never;

      const comparison = await regionalMetricEngineService.computeBranchComparison(scope, period);
      for (let i = 0; i < comparison.revenueRanking.length; i++) {
        const entry = comparison.revenueRanking[i]!;
        await regionalAnalyticsRepository.upsertRanking({
          rankingType: 'BRANCH',
          periodType,
          periodStart,
          periodEnd,
          regionId: region.id,
          branchId: entry.branch.id,
          rank: i + 1,
          score: entry.revenue,
          metrics: entry as never,
        });
        written++;
      }
    }

    return written;
  },
};
