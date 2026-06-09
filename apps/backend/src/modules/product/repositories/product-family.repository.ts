import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const productFamilyRepository = {
  findById: (id: string) => prisma.productFamily.findUnique({ where: { id } }),

  findByCode: (code: string) => prisma.productFamily.findUnique({ where: { code } }),

  list: (where: Prisma.ProductFamilyWhereInput, skip: number, take: number, orderBy: Prisma.ProductFamilyOrderByWithRelationInput) =>
    prisma.productFamily.findMany({ where, skip, take, orderBy, include: { _count: { select: { products: true } } } }),

  count: (where: Prisma.ProductFamilyWhereInput) => prisma.productFamily.count({ where }),

  create: (data: Prisma.ProductFamilyUncheckedCreateInput) => prisma.productFamily.create({ data }),

  update: (id: string, data: Prisma.ProductFamilyUncheckedUpdateInput) =>
    prisma.productFamily.update({ where: { id }, data }),
};
