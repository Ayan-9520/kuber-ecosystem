import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { BranchRankingsQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { analyticsCacheService } from '../../analytics/services/analytics-cache.service.js';
import { BRANCH_CACHE_TTL_MS } from '../constants/branch-analytics.constants.js';
import { branchAnalyticsRepository } from '../repositories/branch-analytics.repository.js';
import type { BranchRankingType, BranchScope, ResolvedBranchPeriod } from '../types/branch-analytics.types.js';

import { branchPerformanceEngineService } from './branch-performance-engine.service.js';

async function rankBranches(
  actor: AuthenticatedUser,
  scope: BranchScope,
  period: ResolvedBranchPeriod,
  branchIds: string[],
) {
  const scored = await Promise.all(
    branchIds.map(async (branchId) => {
      const branch = await branchAnalyticsRepository.getBranch(branchId);
      const scores = await branchPerformanceEngineService.compute(actor, { ...scope, branchIds: [branchId] }, period, branchId);
      const revenueAgg = await prisma.disbursement.aggregate({
        where: {
          application: { branchId },
          disbursementDate: { gte: period.fromDate, lte: period.toDate },
        },
        _sum: { disbursementAmount: true },
      });
      return {
        branchId,
        branch,
        score: scores.overallScore,
        revenue: Number(revenueAgg._sum.disbursementAmount ?? 0),
        metrics: scores,
      };
    }),
  );
  return scored;
}

export const branchRankingEngineService = {
  async get(actor: AuthenticatedUser, scope: BranchScope, period: ResolvedBranchPeriod, rawQuery: BranchRankingsQuery) {
    const rankingType = (rawQuery.rankingType ?? 'BRANCH') as BranchRankingType;
    const limit = rawQuery.limit ?? 20;

    const cacheKey = `branch:rankings:${rankingType}:${period.periodType}:${period.fromDate.toISOString()}:${scope.regionId ?? ''}`;
    const cached = analyticsCacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const persisted = await branchAnalyticsRepository.listRankings({
      rankingType,
      periodType: period.periodType,
      periodStart: period.fromDate,
      regionId: scope.regionId,
      limit,
    });

    if (persisted.length) {
      const result = { period, rankingType, entries: persisted };
      analyticsCacheService.set(cacheKey, result, BRANCH_CACHE_TTL_MS);
      return result;
    }

    let entries: Array<Record<string, unknown>> = [];

    if (rankingType === 'BRANCH' || rankingType === 'REVENUE') {
      const branchIds =
        scope.branchIds.length > 0
          ? scope.branchIds
          : (
              await prisma.branch.findMany({
                where: { isActive: true, ...(scope.regionId ? { regionId: scope.regionId } : {}) },
                select: { id: true },
                take: 50,
              })
            ).map((b) => b.id);

      const scored = await rankBranches(actor, scope, period, branchIds);
      scored.sort((a, b) => (rankingType === 'REVENUE' ? b.revenue - a.revenue : b.score - a.score));
      entries = scored.slice(0, limit).map((entry, idx) => ({
        rank: idx + 1,
        score: rankingType === 'REVENUE' ? entry.revenue : entry.score,
        branchId: entry.branchId,
        branch: entry.branch,
        metrics: entry.metrics,
      }));
    } else if (rankingType === 'REGIONAL') {
      const regions = await prisma.region.findMany({
        where: scope.regionId ? { id: scope.regionId } : { isActive: true },
        select: { id: true, name: true, code: true },
        take: 20,
      });
      const regional = await Promise.all(
        regions.map(async (region) => {
          const branches = await prisma.branch.findMany({
            where: { regionId: region.id, isActive: true },
            select: { id: true },
          });
          const branchIds = branches.map((b) => b.id);
          const scored = await rankBranches(actor, scope, period, branchIds);
          const avgScore = scored.length
            ? scored.reduce((s, e) => s + e.score, 0) / scored.length
            : 0;
          const totalRevenue = scored.reduce((s, e) => s + e.revenue, 0);
          return { region, score: avgScore, revenue: totalRevenue, branchCount: branchIds.length };
        }),
      );
      regional.sort((a, b) => b.score - a.score);
      entries = regional.slice(0, limit).map((entry, idx) => ({
        rank: idx + 1,
        score: entry.score,
        regionId: entry.region.id,
        region: entry.region,
        metrics: { revenue: entry.revenue, branchCount: entry.branchCount },
      }));
    } else if (rankingType === 'PRODUCT') {
      const byProduct = await prisma.application.groupBy({
        by: ['productId'],
        where: {
          deletedAt: null,
          createdAt: { gte: period.fromDate, lte: period.toDate },
          ...(scope.branchIds.length ? { branchId: { in: scope.branchIds } } : {}),
          ...(scope.regionId ? { branch: { regionId: scope.regionId } } : {}),
        },
        _count: true,
        _sum: { requestedAmount: true },
      });
      byProduct.sort((a, b) => b._count - a._count);
      const topProducts = byProduct.slice(0, limit);
      const productIds = topProducts.map((p) => p.productId);
      const products = productIds.length
        ? await prisma.product.findMany({ where: { id: { in: productIds } }, include: { family: true } })
        : [];
      const productMap = new Map(products.map((p) => [p.id, p]));
      entries = topProducts.map((row, idx) => {
        const product = productMap.get(row.productId);
        return {
          rank: idx + 1,
          score: row._count,
          productId: row.productId,
          product,
          metrics: { volume: row._count, amount: Number(row._sum.requestedAmount ?? 0) },
        };
      });
    }

    const result = { period, rankingType, entries };
    analyticsCacheService.set(cacheKey, result, BRANCH_CACHE_TTL_MS);
    return result;
  },

  async rebuild(periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY', periodStart: Date, periodEnd: Date): Promise<number> {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, regionId: true },
      take: 50,
    });

    const actor = { id: 'system', roles: ['SUPER_ADMIN'] } as never;
    const period = { fromDate: periodStart, toDate: periodEnd, periodType };
    let written = 0;

    const scored = await Promise.all(
      branches.map(async (branch) => {
        const scores = await branchPerformanceEngineService.compute(
          actor,
          { branchIds: [branch.id], canViewRegion: true, canViewAll: true },
          period as never,
          branch.id,
        );
        const revenueAgg = await prisma.disbursement.aggregate({
          where: {
            application: { branchId: branch.id },
            disbursementDate: { gte: periodStart, lte: periodEnd },
          },
          _sum: { disbursementAmount: true },
        });
        return {
          branchId: branch.id,
          regionId: branch.regionId,
          score: scores.overallScore,
          revenue: Number(revenueAgg._sum.disbursementAmount ?? 0),
          metrics: scores,
        };
      }),
    );

    const byScore = [...scored].sort((a, b) => b.score - a.score);
    for (let i = 0; i < byScore.length; i++) {
      const entry = byScore[i]!;
      await branchAnalyticsRepository.upsertRanking({
        rankingType: 'BRANCH',
        periodType,
        periodStart,
        periodEnd,
        branchId: entry.branchId,
        regionId: entry.regionId,
        rank: i + 1,
        score: entry.score,
        metrics: entry.metrics as never,
      });
      written++;
    }

    const byRevenue = [...scored].sort((a, b) => b.revenue - a.revenue);
    for (let i = 0; i < byRevenue.length; i++) {
      const entry = byRevenue[i]!;
      await branchAnalyticsRepository.upsertRanking({
        rankingType: 'REVENUE',
        periodType,
        periodStart,
        periodEnd,
        branchId: entry.branchId,
        regionId: entry.regionId,
        rank: i + 1,
        score: entry.revenue,
        metrics: { revenue: entry.revenue } as never,
      });
      written++;
    }

    return written;
  },
};
