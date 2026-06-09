import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const documentRuleRepository = {
  findById: (id: string) =>
    prisma.documentRule.findUnique({
      where: { id },
      include: { product: true, variant: true, documentType: true },
    }),

  list: (where: Prisma.DocumentRuleWhereInput, skip: number, take: number, orderBy: Prisma.DocumentRuleOrderByWithRelationInput) =>
    prisma.documentRule.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { product: true, variant: true, documentType: true },
    }),

  count: (where: Prisma.DocumentRuleWhereInput) => prisma.documentRule.count({ where }),

  listForProduct: (productId: string, variantId?: string, employmentType?: string) =>
    prisma.documentRule.findMany({
      where: {
        productId,
        ...(variantId ? { OR: [{ variantId }, { variantId: null }] } : {}),
        ...(employmentType ? { OR: [{ employmentType: employmentType as never }, { employmentType: null }] } : {}),
      },
      include: { documentType: true },
      orderBy: { stage: 'asc' },
    }),

  create: (data: Prisma.DocumentRuleUncheckedCreateInput) =>
    prisma.documentRule.create({
      data,
      include: { product: true, variant: true, documentType: true },
    }),

  update: (id: string, data: Prisma.DocumentRuleUncheckedUpdateInput) =>
    prisma.documentRule.update({
      where: { id },
      data,
      include: { product: true, variant: true, documentType: true },
    }),

  delete: (id: string) => prisma.documentRule.delete({ where: { id } }),
};
