import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const leadInclude = {
  source: true,
  product: { include: { family: true } },
  variant: true,
  customer: true,
  partner: true,
  branch: true,
  region: true,
  assignedTo: true,
  createdBy: { select: { id: true, email: true, phone: true } },
} satisfies Prisma.LeadInclude;

export const leadRepository = {
  findById: (id: string) =>
    prisma.lead.findFirst({ where: { id, deletedAt: null }, include: leadInclude }),

  findByNumber: (leadNumber: string) =>
    prisma.lead.findFirst({ where: { leadNumber, deletedAt: null } }),

  getLastLeadNumber: () =>
    prisma.lead.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { leadNumber: true },
    }),

  list: (
    where: Prisma.LeadWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.LeadOrderByWithRelationInput,
  ) => prisma.lead.findMany({ where, skip, take, orderBy, include: leadInclude }),

  count: (where: Prisma.LeadWhereInput) => prisma.lead.count({ where }),

  create: (data: Prisma.LeadUncheckedCreateInput) =>
    prisma.lead.create({ data, include: leadInclude }),

  update: (id: string, data: Prisma.LeadUncheckedUpdateInput) =>
    prisma.lead.update({ where: { id }, data, include: leadInclude }),

  softDelete: (id: string, deletedById: string) =>
    prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById },
    }),

  groupByStatus: (where: Prisma.LeadWhereInput) =>
    prisma.lead.groupBy({ by: ['status'], where, _count: { id: true } }),

  groupByGrade: (where: Prisma.LeadWhereInput) =>
    prisma.lead.groupBy({ by: ['grade'], where, _count: { id: true } }),

  groupBySource: (where: Prisma.LeadWhereInput) =>
    prisma.lead.groupBy({ by: ['sourceId'], where, _count: { id: true } }),

  groupByAssignee: (where: Prisma.LeadWhereInput) =>
    prisma.lead.groupBy({ by: ['assignedToId'], where, _count: { id: true } }),

  groupByBranch: (where: Prisma.LeadWhereInput) =>
    prisma.lead.groupBy({ by: ['branchId'], where, _count: { id: true } }),
};
