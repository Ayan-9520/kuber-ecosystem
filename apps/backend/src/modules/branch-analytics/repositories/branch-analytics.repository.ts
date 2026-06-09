import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import type { BranchMetricCategory, BranchPeriodType, BranchRankingType } from '../types/branch-analytics.types.js';

export const branchAnalyticsRepository = {
  createAudit(data: Prisma.BranchAnalyticsAuditCreateInput) {
    return prisma.branchAnalyticsAudit.create({ data });
  },

  getBranch(branchId: string) {
    return prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true, name: true, code: true, regionId: true, city: true, state: true },
    });
  },

  async upsertMetric(data: {
    branchId: string;
    regionId: string;
    metricCode: string;
    metricName: string;
    category: BranchMetricCategory;
    periodType: BranchPeriodType;
    periodStart: Date;
    periodEnd: Date;
    value: number;
    targetValue?: number;
    unit?: string;
    productId?: string | null;
    partnerId?: string | null;
    lenderId?: string | null;
    employeeId?: string | null;
    dimensions?: Prisma.InputJsonValue;
  }) {
    const existing = await prisma.branchMetric.findFirst({
      where: {
        branchId: data.branchId,
        metricCode: data.metricCode,
        periodType: data.periodType,
        periodStart: data.periodStart,
        productId: data.productId ?? null,
        partnerId: data.partnerId ?? null,
      },
    });
    const payload = {
      metricName: data.metricName,
      category: data.category,
      periodEnd: data.periodEnd,
      value: data.value,
      targetValue: data.targetValue,
      unit: data.unit,
      dimensions: data.dimensions,
    };
    if (existing) {
      return prisma.branchMetric.update({ where: { id: existing.id }, data: payload });
    }
    return prisma.branchMetric.create({ data: { ...data, ...payload } });
  },

  async upsertPerformance(data: {
    branchId: string;
    regionId: string;
    periodType: BranchPeriodType;
    periodStart: Date;
    periodEnd: Date;
    growthScore: number;
    revenueScore: number;
    operationsScore: number;
    complianceScore: number;
    customerScore: number;
    overallScore: number;
    breakdown?: Prisma.InputJsonValue;
  }) {
    const existing = await prisma.branchPerformance.findFirst({
      where: { branchId: data.branchId, periodType: data.periodType, periodStart: data.periodStart },
    });
    if (existing) {
      return prisma.branchPerformance.update({
        where: { id: existing.id },
        data: {
          growthScore: data.growthScore,
          revenueScore: data.revenueScore,
          operationsScore: data.operationsScore,
          complianceScore: data.complianceScore,
          customerScore: data.customerScore,
          overallScore: data.overallScore,
          breakdown: data.breakdown,
        },
      });
    }
    return prisma.branchPerformance.create({ data });
  },

  async upsertRanking(data: {
    rankingType: BranchRankingType;
    periodType: BranchPeriodType;
    periodStart: Date;
    periodEnd: Date;
    branchId?: string | null;
    regionId?: string | null;
    productId?: string | null;
    rank: number;
    score: number;
    metrics?: Prisma.InputJsonValue;
  }) {
    const existing = await prisma.branchRanking.findFirst({
      where: {
        rankingType: data.rankingType,
        periodType: data.periodType,
        periodStart: data.periodStart,
        branchId: data.branchId ?? null,
        productId: data.productId ?? null,
      },
    });
    if (existing) {
      return prisma.branchRanking.update({
        where: { id: existing.id },
        data: { rank: data.rank, score: data.score, metrics: data.metrics, periodEnd: data.periodEnd },
      });
    }
    return prisma.branchRanking.create({ data });
  },

  upsertSnapshot(data: {
    branchId?: string | null;
    regionId?: string | null;
    snapshotDate: Date;
    periodType: BranchPeriodType;
    payload: Prisma.InputJsonValue;
  }) {
    return prisma.branchAnalyticsSnapshot.create({ data });
  },

  listTargets(params: {
    branchIds?: string[];
    periodType?: BranchPeriodType;
    isActive?: boolean;
    page: number;
    limit: number;
  }) {
    const where: Prisma.BranchTargetWhereInput = {
      ...(params.branchIds?.length ? { branchId: { in: params.branchIds } } : {}),
      ...(params.periodType ? { periodType: params.periodType } : {}),
      ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
    };
    return Promise.all([
      prisma.branchTarget.findMany({
        where,
        orderBy: { periodStart: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: { branch: { select: { name: true, code: true } } },
      }),
      prisma.branchTarget.count({ where }),
    ]);
  },

  createTarget(data: Prisma.BranchTargetCreateInput) {
    return prisma.branchTarget.create({ data });
  },

  listRankings(params: {
    rankingType: BranchRankingType;
    periodType: BranchPeriodType;
    periodStart: Date;
    regionId?: string;
    limit?: number;
  }) {
    return prisma.branchRanking.findMany({
      where: {
        rankingType: params.rankingType,
        periodType: params.periodType,
        periodStart: params.periodStart,
        ...(params.regionId ? { regionId: params.regionId } : {}),
      },
      orderBy: { rank: 'asc' },
      take: params.limit ?? 20,
      include: { branch: { select: { id: true, name: true, code: true } } },
    });
  },
};
