import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const variantInclude = {
  product: { include: { family: true } },
  _count: { select: { eligibilityRules: true, documentRules: true, lenderMappings: true } },
} satisfies Prisma.ProductVariantInclude;

export const productVariantRepository = {
  findById: (id: string) => prisma.productVariant.findUnique({ where: { id }, include: variantInclude }),

  list: (where: Prisma.ProductVariantWhereInput, skip: number, take: number, orderBy: Prisma.ProductVariantOrderByWithRelationInput) =>
    prisma.productVariant.findMany({ where, skip, take, orderBy, include: variantInclude }),

  count: (where: Prisma.ProductVariantWhereInput) => prisma.productVariant.count({ where }),

  create: (data: Prisma.ProductVariantUncheckedCreateInput) =>
    prisma.productVariant.create({ data, include: variantInclude }),

  update: (id: string, data: Prisma.ProductVariantUncheckedUpdateInput) =>
    prisma.productVariant.update({ where: { id }, data, include: variantInclude }),
};
