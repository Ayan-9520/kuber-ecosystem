import type { Prisma } from '@kuberone/database';
import { prisma } from '@kuberone/database';

export const drRepository = {
  listScenarios() {
    return prisma.disasterScenario.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } });
  },

  listRunbooks() {
    return prisma.recoveryRunbook.findMany({
      where: { isActive: true },
      include: { scenarioRef: true },
      orderBy: { code: 'asc' },
    });
  },

  findRunbookByCode(code: string) {
    return prisma.recoveryRunbook.findUnique({ where: { code } });
  },

  listDrills(where: Prisma.DRDrillWhereInput, skip: number, take: number) {
    return Promise.all([
      prisma.dRDrill.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { executedBy: { select: { id: true, email: true } } },
      }),
      prisma.dRDrill.count({ where }),
    ]);
  },

  createDrill(data: Prisma.DRDrillCreateInput) {
    return prisma.dRDrill.create({ data });
  },

  updateDrill(id: string, data: Prisma.DRDrillUpdateInput) {
    return prisma.dRDrill.update({ where: { id }, data });
  },

  listFailovers(skip: number, take: number) {
    return Promise.all([
      prisma.failoverExecution.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { executedBy: { select: { id: true, email: true } } },
      }),
      prisma.failoverExecution.count(),
    ]);
  },

  createFailover(data: Prisma.FailoverExecutionCreateInput) {
    return prisma.failoverExecution.create({ data });
  },

  listRecoveries(where: Prisma.RecoveryExecutionWhereInput, skip: number, take: number) {
    return Promise.all([
      prisma.recoveryExecution.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { runbook: true, executedBy: { select: { id: true, email: true } } },
      }),
      prisma.recoveryExecution.count({ where }),
    ]);
  },

  createRecovery(data: Prisma.RecoveryExecutionCreateInput) {
    return prisma.recoveryExecution.create({ data });
  },

  updateRecovery(id: string, data: Prisma.RecoveryExecutionUpdateInput) {
    return prisma.recoveryExecution.update({ where: { id }, data });
  },

  createAuditLog(data: Prisma.RecoveryAuditLogCreateInput) {
    return prisma.recoveryAuditLog.create({ data });
  },

  listReports(limit = 10) {
    return prisma.dRReport.findMany({ orderBy: { generatedAt: 'desc' }, take: limit });
  },

  createReport(data: Prisma.DRReportCreateInput) {
    return prisma.dRReport.create({ data });
  },

  countScenarios() {
    return prisma.disasterScenario.count({ where: { isActive: true } });
  },

  latestPassedDrill() {
    return prisma.dRDrill.findFirst({
      where: { passed: true },
      orderBy: { completedAt: 'desc' },
    });
  },
};
