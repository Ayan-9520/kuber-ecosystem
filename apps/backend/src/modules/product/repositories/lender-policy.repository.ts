import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const lenderPolicyRepository = {
  findById: (id: string) =>
    prisma.lenderPolicy.findUnique({
      where: { id },
      include: { lender: true, product: true },
    }),

  list: (where: Prisma.LenderPolicyWhereInput, skip: number, take: number, orderBy: Prisma.LenderPolicyOrderByWithRelationInput) =>
    prisma.lenderPolicy.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { lender: true, product: true },
    }),

  count: (where: Prisma.LenderPolicyWhereInput) => prisma.lenderPolicy.count({ where }),

  listActiveForProduct: (productId: string) =>
    prisma.lenderPolicy.findMany({
      where: {
        productId,
        isActive: true,
        effectiveFrom: { lte: new Date() },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
      },
      include: { lender: true },
    }),

  create: (data: Prisma.LenderPolicyUncheckedCreateInput) =>
    prisma.lenderPolicy.create({ data, include: { lender: true, product: true } }),

  update: (id: string, data: Prisma.LenderPolicyUncheckedUpdateInput) =>
    prisma.lenderPolicy.update({ where: { id }, data, include: { lender: true, product: true } }),
};
