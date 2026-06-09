import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const leadActivityRepository = {
  findById: (id: string) =>
    prisma.leadActivity.findUnique({
      where: { id },
      include: {
        lead: { select: { id: true, leadNumber: true } },
        performedBy: { select: { id: true, email: true, phone: true } },
      },
    }),

  list: (
    where: Prisma.LeadActivityWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.LeadActivityOrderByWithRelationInput,
  ) =>
    prisma.leadActivity.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        performedBy: { select: { id: true, email: true, phone: true } },
      },
    }),

  count: (where: Prisma.LeadActivityWhereInput) => prisma.leadActivity.count({ where }),

  create: (data: Prisma.LeadActivityUncheckedCreateInput) => prisma.leadActivity.create({ data }),
};
