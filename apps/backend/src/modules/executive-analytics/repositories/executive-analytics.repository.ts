import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import type { ExecutivePeriodType, ExecutiveRoleType } from '../types/executive-analytics.types.js';

export const executiveAnalyticsRepository = {
  createAudit(data: Prisma.ExecutiveAnalyticsAuditCreateInput) {
    return prisma.executiveAnalyticsAudit.create({ data });
  },

  async upsertMetric(data: {
    employeeId: string;
    executiveRole: ExecutiveRoleType;
    metricCode: string;
    metricName: string;
    periodType: ExecutivePeriodType;
    periodStart: Date;
    periodEnd: Date;
    value: number;
    targetValue?: number;
    unit?: string;
    branchId?: string | null;
    regionId?: string | null;
    productId?: string | null;
    dimensions?: Prisma.InputJsonValue;
  }) {
    const existing = await prisma.executiveMetric.findFirst({
      where: {
        employeeId: data.employeeId,
        metricCode: data.metricCode,
        periodType: data.periodType,
        periodStart: data.periodStart,
        branchId: data.branchId ?? null,
        regionId: data.regionId ?? null,
        productId: data.productId ?? null,
      },
    });

    const payload = {
      executiveRole: data.executiveRole,
      metricName: data.metricName,
      periodEnd: data.periodEnd,
      value: data.value,
      targetValue: data.targetValue,
      unit: data.unit,
      dimensions: data.dimensions,
    };

    if (existing) {
      return prisma.executiveMetric.update({ where: { id: existing.id }, data: payload });
    }
    return prisma.executiveMetric.create({ data: { ...data, ...payload } });
  },

  async upsertPerformance(data: {
    employeeId: string;
    executiveRole: ExecutiveRoleType;
    periodType: ExecutivePeriodType;
    periodStart: Date;
    periodEnd: Date;
    performanceScore: number;
    productivityScore: number;
    qualityScore: number;
    complianceScore: number;
    overallRating: number;
    branchId?: string | null;
    regionId?: string | null;
    breakdown?: Prisma.InputJsonValue;
  }) {
    const existing = await prisma.executivePerformance.findFirst({
      where: {
        employeeId: data.employeeId,
        executiveRole: data.executiveRole,
        periodType: data.periodType,
        periodStart: data.periodStart,
      },
    });

    if (existing) {
      return prisma.executivePerformance.update({
        where: { id: existing.id },
        data: {
          periodEnd: data.periodEnd,
          performanceScore: data.performanceScore,
          productivityScore: data.productivityScore,
          qualityScore: data.qualityScore,
          complianceScore: data.complianceScore,
          overallRating: data.overallRating,
          breakdown: data.breakdown,
        },
      });
    }
    return prisma.executivePerformance.create({ data });
  },

  async upsertLeaderboardEntry(data: {
    executiveRole: ExecutiveRoleType;
    periodType: ExecutivePeriodType;
    periodStart: Date;
    periodEnd: Date;
    employeeId: string;
    rank: number;
    score: number;
    metrics?: Prisma.InputJsonValue;
    branchId?: string | null;
    regionId?: string | null;
  }) {
    const existing = await prisma.executiveLeaderboard.findFirst({
      where: {
        executiveRole: data.executiveRole,
        periodType: data.periodType,
        periodStart: data.periodStart,
        employeeId: data.employeeId,
        branchId: data.branchId ?? null,
        regionId: data.regionId ?? null,
      },
    });

    if (existing) {
      return prisma.executiveLeaderboard.update({
        where: { id: existing.id },
        data: { rank: data.rank, score: data.score, metrics: data.metrics, periodEnd: data.periodEnd },
      });
    }
    return prisma.executiveLeaderboard.create({ data });
  },

  upsertSnapshot(data: {
    employeeId?: string | null;
    executiveRole?: ExecutiveRoleType | null;
    snapshotDate: Date;
    periodType: ExecutivePeriodType;
    branchId?: string | null;
    regionId?: string | null;
    payload: Prisma.InputJsonValue;
  }) {
    return prisma.executiveAnalyticsSnapshot.create({ data });
  },

  listTargets(params: {
    employeeIds?: string[];
    executiveRole?: ExecutiveRoleType;
    periodType?: ExecutivePeriodType;
    isActive?: boolean;
    page: number;
    limit: number;
  }) {
    const where: Prisma.ExecutiveTargetWhereInput = {
      ...(params.employeeIds?.length ? { employeeId: { in: params.employeeIds } } : {}),
      ...(params.executiveRole ? { executiveRole: params.executiveRole } : {}),
      ...(params.periodType ? { periodType: params.periodType } : {}),
      ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
    };
    return Promise.all([
      prisma.executiveTarget.findMany({
        where,
        orderBy: { periodStart: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
      }),
      prisma.executiveTarget.count({ where }),
    ]);
  },

  createTarget(data: Prisma.ExecutiveTargetCreateInput) {
    return prisma.executiveTarget.create({ data });
  },

  listLeaderboard(params: {
    executiveRole: ExecutiveRoleType;
    periodType: ExecutivePeriodType;
    periodStart: Date;
    branchId?: string;
    regionId?: string;
    limit?: number;
  }) {
    return prisma.executiveLeaderboard.findMany({
      where: {
        executiveRole: params.executiveRole,
        periodType: params.periodType,
        periodStart: params.periodStart,
        ...(params.branchId ? { branchId: params.branchId } : {}),
        ...(params.regionId ? { regionId: params.regionId } : {}),
      },
      orderBy: { rank: 'asc' },
      take: params.limit ?? 20,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, designation: true } },
      },
    });
  },

  listForecasts(params: { employeeId: string; periodType?: ExecutivePeriodType; limit?: number }) {
    return prisma.executiveForecast.findMany({
      where: {
        employeeId: params.employeeId,
        ...(params.periodType ? { periodType: params.periodType } : {}),
      },
      orderBy: { forecastDate: 'desc' },
      take: params.limit ?? 50,
    });
  },

  getEmployee(employeeId: string) {
    return prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        designation: true,
        department: true,
        branchId: true,
        branch: { select: { regionId: true } },
      },
    });
  },
};
