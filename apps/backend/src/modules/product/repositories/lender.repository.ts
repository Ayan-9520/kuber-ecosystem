import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const lenderRepository = {
  findById: (id: string) =>
    prisma.lender.findUnique({
      where: { id },
      include: { _count: { select: { policies: true, mappings: true } } },
    }),

  findByCode: (code: string) => prisma.lender.findUnique({ where: { code } }),

  list: (where: Prisma.LenderWhereInput, skip: number, take: number, orderBy: Prisma.LenderOrderByWithRelationInput) =>
    prisma.lender.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { _count: { select: { policies: true, mappings: true } } },
    }),

  count: (where: Prisma.LenderWhereInput) => prisma.lender.count({ where }),

  create: (data: Prisma.LenderUncheckedCreateInput) => prisma.lender.create({ data }),

  update: (id: string, data: Prisma.LenderUncheckedUpdateInput) =>
    prisma.lender.update({ where: { id }, data }),
};
