import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const analyticsRepository = {
  getClient() {
    return prisma;
  },

  async upsertMetricValue(data: Prisma.MetricValueUncheckedCreateInput) {
    const existing = await prisma.metricValue.findFirst({
      where: {
        metricDefinitionId: data.metricDefinitionId,
        snapshotDate: data.snapshotDate,
        branchId: data.branchId ?? null,
        regionId: data.regionId ?? null,
        partnerId: data.partnerId ?? null,
        employeeId: data.employeeId ?? null,
      },
    });
    if (existing) {
      return prisma.metricValue.update({
        where: { id: existing.id },
        data: { value: data.value, dimensions: data.dimensions },
      });
    }
    return prisma.metricValue.create({ data });
  },

  async findMetricByCode(code: string) {
    return prisma.metricDefinition.findUnique({ where: { code } });
  },

  async listMetricDefinitions() {
    return prisma.metricDefinition.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  },

  async upsertSnapshot(data: Prisma.AnalyticsSnapshotUncheckedCreateInput) {
    const existing = await prisma.analyticsSnapshot.findFirst({
      where: {
        snapshotDate: data.snapshotDate,
        dashboardType: data.dashboardType ?? null,
        branchId: data.branchId ?? null,
        regionId: data.regionId ?? null,
        partnerId: data.partnerId ?? null,
      },
    });
    if (existing) {
      return prisma.analyticsSnapshot.update({
        where: { id: existing.id },
        data: { payload: data.payload },
      });
    }
    return prisma.analyticsSnapshot.create({ data });
  },

  async getSnapshot(snapshotDate: Date, dashboardType?: string | null, scope?: { branchId?: string | null; regionId?: string | null; partnerId?: string | null }) {
    return prisma.analyticsSnapshot.findFirst({
      where: {
        snapshotDate,
        dashboardType: (dashboardType as never) ?? null,
        branchId: scope?.branchId ?? null,
        regionId: scope?.regionId ?? null,
        partnerId: scope?.partnerId ?? null,
      },
    });
  },

  async listReports(params: { skip: number; take: number; reportType?: string; isActive?: boolean }) {
    const where: Prisma.AnalyticsReportWhereInput = {
      ...(params.reportType ? { reportType: params.reportType } : {}),
      ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.analyticsReport.findMany({ where, skip: params.skip, take: params.take, orderBy: { name: 'asc' } }),
      prisma.analyticsReport.count({ where }),
    ]);
    return { items, total };
  },

  async findReportByCode(code: string) {
    return prisma.analyticsReport.findUnique({ where: { code } });
  },

  async createReport(data: Prisma.AnalyticsReportUncheckedCreateInput) {
    return prisma.analyticsReport.create({ data });
  },

  async createExecution(data: Prisma.ReportExecutionUncheckedCreateInput) {
    return prisma.reportExecution.create({ data });
  },

  async updateExecution(id: string, data: Prisma.ReportExecutionUpdateInput) {
    return prisma.reportExecution.update({ where: { id }, data });
  },

  async listExecutions(reportId: string, limit = 20) {
    return prisma.reportExecution.findMany({
      where: { reportId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  async listDueSchedules(now: Date) {
    return prisma.analyticsSchedule.findMany({
      where: { isActive: true, nextRunAt: { lte: now } },
      include: { report: true },
      take: 20,
    });
  },

  async updateSchedule(id: string, data: Prisma.AnalyticsScheduleUpdateInput) {
    return prisma.analyticsSchedule.update({ where: { id }, data });
  },

  async createSchedule(data: Prisma.AnalyticsScheduleUncheckedCreateInput) {
    return prisma.analyticsSchedule.create({ data });
  },

  async createAudit(data: Prisma.AnalyticsAuditUncheckedCreateInput) {
    return prisma.analyticsAudit.create({ data });
  },

  async listDashboards(params: { skip: number; take: number; dashboardType?: string }) {
    const where: Prisma.DashboardWhereInput = {
      isActive: true,
      ...(params.dashboardType ? { dashboardType: params.dashboardType as never } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.dashboard.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: { widgets: { where: { isActive: true }, orderBy: { position: 'asc' } }, filters: true },
        orderBy: { name: 'asc' },
      }),
      prisma.dashboard.count({ where }),
    ]);
    return { items, total };
  },
};
