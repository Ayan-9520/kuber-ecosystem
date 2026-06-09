import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import type { RegionalMetricCategory, RegionalPeriodType, RegionalRankingType } from '../types/regional-analytics.types.js';

export const regionalAnalyticsRepository = {
  createAudit(data: Prisma.RegionalAnalyticsAuditCreateInput) {
    return prisma.regionalAnalyticsAudit.create({ data });
  },

  getRegion(regionId: string) {
    return prisma.region.findUnique({
      where: { id: regionId },
      select: { id: true, name: true, code: true, isActive: true },
    });
  },

  async upsertMetric(data: {
    regionId: string;
    metricCode: string;
    metricName: string;
    category: RegionalMetricCategory;
    periodType: RegionalPeriodType;
    periodStart: Date;
    periodEnd: Date;
    value: number;
    targetValue?: number;
    unit?: string;
    branchId?: string | null;
    productId?: string | null;
    partnerId?: string | null;
    lenderId?: string | null;
    employeeId?: string | null;
    dimensions?: Prisma.InputJsonValue;
  }) {
    const existing = await prisma.regionalMetric.findFirst({
      where: {
        regionId: data.regionId,
        metricCode: data.metricCode,
        periodType: data.periodType,
        periodStart: data.periodStart,
        branchId: data.branchId ?? null,
        productId: data.productId ?? null,
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
      return prisma.regionalMetric.update({ where: { id: existing.id }, data: payload });
    }
    return prisma.regionalMetric.create({ data: { ...data, ...payload } });
  },

  async upsertPerformance(data: {
    regionId: string;
    periodType: RegionalPeriodType;
    periodStart: Date;
    periodEnd: Date;
    revenueScore: number;
    growthScore: number;
    operationsScore: number;
    complianceScore: number;
    customerScore: number;
    aiAdoptionScore: number;
    overallScore: number;
    breakdown?: Prisma.InputJsonValue;
  }) {
    const existing = await prisma.regionalPerformance.findFirst({
      where: { regionId: data.regionId, periodType: data.periodType, periodStart: data.periodStart },
    });
    if (existing) {
      return prisma.regionalPerformance.update({
        where: { id: existing.id },
        data: {
          revenueScore: data.revenueScore,
          growthScore: data.growthScore,
          operationsScore: data.operationsScore,
          complianceScore: data.complianceScore,
          customerScore: data.customerScore,
          aiAdoptionScore: data.aiAdoptionScore,
          overallScore: data.overallScore,
          breakdown: data.breakdown,
        },
      });
    }
    return prisma.regionalPerformance.create({ data });
  },

  async upsertRanking(data: {
    rankingType: RegionalRankingType;
    periodType: RegionalPeriodType;
    periodStart: Date;
    periodEnd: Date;
    regionId?: string | null;
    branchId?: string | null;
    productId?: string | null;
    partnerId?: string | null;
    employeeId?: string | null;
    rank: number;
    score: number;
    metrics?: Prisma.InputJsonValue;
  }) {
    const existing = await prisma.regionalRanking.findFirst({
      where: {
        rankingType: data.rankingType,
        periodType: data.periodType,
        periodStart: data.periodStart,
        branchId: data.branchId ?? null,
        productId: data.productId ?? null,
        partnerId: data.partnerId ?? null,
        employeeId: data.employeeId ?? null,
      },
    });
    if (existing) {
      return prisma.regionalRanking.update({
        where: { id: existing.id },
        data: { rank: data.rank, score: data.score, metrics: data.metrics, periodEnd: data.periodEnd },
      });
    }
    return prisma.regionalRanking.create({ data });
  },

  upsertSnapshot(data: {
    regionId?: string | null;
    snapshotDate: Date;
    periodType: RegionalPeriodType;
    payload: Prisma.InputJsonValue;
  }) {
    return prisma.regionalAnalyticsSnapshot.create({ data });
  },

  listTargets(params: {
    regionIds?: string[];
    periodType?: RegionalPeriodType;
    isActive?: boolean;
    page: number;
    limit: number;
  }) {
    const where: Prisma.RegionalTargetWhereInput = {
      ...(params.regionIds?.length ? { regionId: { in: params.regionIds } } : {}),
      ...(params.periodType ? { periodType: params.periodType } : {}),
      ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
    };
    return Promise.all([
      prisma.regionalTarget.findMany({
        where,
        orderBy: { periodStart: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: { region: { select: { name: true, code: true } } },
      }),
      prisma.regionalTarget.count({ where }),
    ]);
  },

  createTarget(data: Prisma.RegionalTargetCreateInput) {
    return prisma.regionalTarget.create({ data });
  },

  listRankings(params: {
    rankingType: RegionalRankingType;
    periodType: RegionalPeriodType;
    periodStart: Date;
    regionId?: string;
    limit?: number;
  }) {
    return prisma.regionalRanking.findMany({
      where: {
        rankingType: params.rankingType,
        periodType: params.periodType,
        periodStart: params.periodStart,
        ...(params.regionId ? { regionId: params.regionId } : {}),
      },
      orderBy: { rank: 'asc' },
      take: params.limit ?? 20,
      include: {
        branch: { select: { id: true, name: true, code: true } },
        region: { select: { id: true, name: true, code: true } },
      },
    });
  },
};
