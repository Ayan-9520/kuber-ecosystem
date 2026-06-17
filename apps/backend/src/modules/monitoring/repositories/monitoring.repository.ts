import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const monitoringRepository = {
  alertRule: {
    findMany: (args: Prisma.MonitoringAlertRuleFindManyArgs) => prisma.monitoringAlertRule.findMany(args),
    count: (where: Prisma.MonitoringAlertRuleWhereInput) => prisma.monitoringAlertRule.count({ where }),
    findByCode: (code: string) => prisma.monitoringAlertRule.findUnique({ where: { code } }),
    create: (data: Prisma.MonitoringAlertRuleCreateInput) => prisma.monitoringAlertRule.create({ data }),
  },

  alert: {
    findMany: (args: Prisma.MonitoringAlertFindManyArgs) => prisma.monitoringAlert.findMany(args),
    count: (where: Prisma.MonitoringAlertWhereInput) => prisma.monitoringAlert.count({ where }),
    findById: (id: string) =>
      prisma.monitoringAlert.findUnique({
        where: { id },
        include: {
          rule: { select: { id: true, code: true, name: true } },
          acknowledgedBy: { select: { id: true, email: true } },
          resolvedBy: { select: { id: true, email: true } },
        },
      }),
    findByCode: (code: string) => prisma.monitoringAlert.findUnique({ where: { code } }),
    create: (data: Prisma.MonitoringAlertCreateInput) => prisma.monitoringAlert.create({ data }),
    update: (id: string, data: Prisma.MonitoringAlertUpdateInput) => prisma.monitoringAlert.update({ where: { id }, data }),
  },

  slaSnapshot: {
    findMany: (args: Prisma.MonitoringSlaSnapshotFindManyArgs) => prisma.monitoringSlaSnapshot.findMany(args),
    create: (data: Prisma.MonitoringSlaSnapshotCreateInput) => prisma.monitoringSlaSnapshot.create({ data }),
  },

  metricSnapshot: {
    createMany: (data: Prisma.MonitoringMetricSnapshotCreateManyInput[]) =>
      prisma.monitoringMetricSnapshot.createMany({ data }),
    findRecent: (component: string, limit: number) =>
      prisma.monitoringMetricSnapshot.findMany({
        where: { component: component as never },
        orderBy: { sampledAt: 'desc' },
        take: limit,
      }),
  },
};
