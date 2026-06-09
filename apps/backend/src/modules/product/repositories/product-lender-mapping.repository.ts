import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const mappingInclude = {
  product: true,
  variant: true,
  lender: true,
  lenderPolicy: true,
} satisfies Prisma.ProductLenderMappingInclude;

export const productLenderMappingRepository = {
  findById: (id: string) =>
    prisma.productLenderMapping.findFirst({
      where: { id, deletedAt: null },
      include: mappingInclude,
    }),

  list: (where: Prisma.ProductLenderMappingWhereInput, skip: number, take: number, orderBy: Prisma.ProductLenderMappingOrderByWithRelationInput) =>
    prisma.productLenderMapping.findMany({
      where: { ...where, deletedAt: null },
      skip,
      take,
      orderBy,
      include: mappingInclude,
    }),

  count: (where: Prisma.ProductLenderMappingWhereInput) =>
    prisma.productLenderMapping.count({ where: { ...where, deletedAt: null } }),

  create: (data: Prisma.ProductLenderMappingUncheckedCreateInput) =>
    prisma.productLenderMapping.create({ data, include: mappingInclude }),

  update: (id: string, data: Prisma.ProductLenderMappingUncheckedUpdateInput) =>
    prisma.productLenderMapping.update({ where: { id }, data, include: mappingInclude }),

  softDelete: (id: string, deletedById: string) =>
    prisma.productLenderMapping.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById, isActive: false },
    }),
};
