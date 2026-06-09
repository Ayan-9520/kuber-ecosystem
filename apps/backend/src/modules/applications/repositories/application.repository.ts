import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const applicationInclude = {
  customer: { select: { id: true, customerCode: true, fullName: true } },
  product: { include: { family: true } },
  variant: true,
  lead: { select: { id: true, leadNumber: true } },
  partner: { select: { id: true, partnerCode: true, businessName: true } },
  branch: true,
  region: true,
  assignedSales: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
  assignedCredit: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
  assignedOps: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
  selectedLender: { select: { id: true, code: true, name: true } },
  sanction: true,
  closure: true,
} satisfies Prisma.ApplicationInclude;

export const applicationRepository = {
  findById: (id: string) =>
    prisma.application.findFirst({ where: { id, deletedAt: null }, include: applicationInclude }),

  getLastApplicationNumber: () =>
    prisma.application.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { applicationNumber: true },
    }),

  list: (
    where: Prisma.ApplicationWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.ApplicationOrderByWithRelationInput,
  ) => prisma.application.findMany({ where, skip, take, orderBy, include: applicationInclude }),

  count: (where: Prisma.ApplicationWhereInput) => prisma.application.count({ where }),

  create: (data: Prisma.ApplicationUncheckedCreateInput) =>
    prisma.application.create({ data, include: applicationInclude }),

  update: (id: string, data: Prisma.ApplicationUncheckedUpdateInput) =>
    prisma.application.update({ where: { id }, data, include: applicationInclude }),

  softDelete: (id: string, deletedById: string) =>
    prisma.application.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById },
    }),

  groupByStatus: (where: Prisma.ApplicationWhereInput) =>
    prisma.application.groupBy({ by: ['status'], where, _count: { id: true } }),

  groupByAssignee: (where: Prisma.ApplicationWhereInput) =>
    prisma.application.groupBy({ by: ['assignedSalesId'], where, _count: { id: true } }),

  groupByBranch: (where: Prisma.ApplicationWhereInput) =>
    prisma.application.groupBy({ by: ['branchId'], where, _count: { id: true } }),

  avgTatDays: async (where: Prisma.ApplicationWhereInput): Promise<number> => {
    const apps = await prisma.application.findMany({
      where: { ...where, disbursedAt: { not: null }, submittedAt: { not: null } },
      select: { submittedAt: true, disbursedAt: true },
      take: 500,
    });
    if (apps.length === 0) return 0;
    const total = apps.reduce((sum, a) => {
      const days = (a.disbursedAt!.getTime() - a.submittedAt!.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    return Math.round((total / apps.length) * 10) / 10;
  },
};
