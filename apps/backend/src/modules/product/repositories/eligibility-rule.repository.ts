import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const eligibilityRuleRepository = {
  findById: (id: string) =>
    prisma.eligibilityRule.findFirst({
      where: { id, deletedAt: null },
      include: { product: true, variant: true },
    }),

  list: (where: Prisma.EligibilityRuleWhereInput, skip: number, take: number, orderBy: Prisma.EligibilityRuleOrderByWithRelationInput) =>
    prisma.eligibilityRule.findMany({
      where: { ...where, deletedAt: null },
      skip,
      take,
      orderBy,
      include: { product: true, variant: true },
    }),

  count: (where: Prisma.EligibilityRuleWhereInput) =>
    prisma.eligibilityRule.count({ where: { ...where, deletedAt: null } }),

  listActiveForProduct: (productId: string, variantId?: string) =>
    prisma.eligibilityRule.findMany({
      where: {
        productId,
        deletedAt: null,
        isActive: true,
        effectiveFrom: { lte: new Date() },
        AND: [
          { OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }] },
          variantId
            ? { OR: [{ variantId }, { variantId: null }] }
            : { variantId: null },
        ],
      },
      orderBy: { priority: 'desc' },
    }),

  create: (data: Prisma.EligibilityRuleUncheckedCreateInput) =>
    prisma.eligibilityRule.create({ data, include: { product: true, variant: true } }),

  update: (id: string, data: Prisma.EligibilityRuleUncheckedUpdateInput) =>
    prisma.eligibilityRule.update({ where: { id }, data, include: { product: true, variant: true } }),

  softDelete: (id: string, deletedById: string) =>
    prisma.eligibilityRule.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById, isActive: false },
    }),
};
