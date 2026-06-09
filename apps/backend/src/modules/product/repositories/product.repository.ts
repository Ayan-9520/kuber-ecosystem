import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const productInclude = {
  family: true,
  variants: { where: { isActive: true } },
  _count: { select: { eligibilityRules: true, documentRules: true, lenderPolicies: true } },
} satisfies Prisma.ProductInclude;

export const productRepository = {
  findById: (id: string) =>
    prisma.product.findFirst({ where: { id, deletedAt: null }, include: productInclude }),

  findByCode: (code: string) =>
    prisma.product.findFirst({ where: { code, deletedAt: null } }),

  list: (where: Prisma.ProductWhereInput, skip: number, take: number, orderBy: Prisma.ProductOrderByWithRelationInput) =>
    prisma.product.findMany({ where, skip, take, orderBy, include: productInclude }),

  count: (where: Prisma.ProductWhereInput) => prisma.product.count({ where }),

  create: (data: Prisma.ProductUncheckedCreateInput) =>
    prisma.product.create({ data, include: productInclude }),

  update: (id: string, data: Prisma.ProductUncheckedUpdateInput) =>
    prisma.product.update({ where: { id }, data, include: productInclude }),

  softDelete: (id: string, deletedById: string) =>
    prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById, isActive: false },
    }),
};
