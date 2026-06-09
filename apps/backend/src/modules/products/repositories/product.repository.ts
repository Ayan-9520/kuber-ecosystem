import type { Prisma } from '@kuberone/database';
import type { CreateProductInput, UpdateProductInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';

const productInclude = {
  family: { select: { id: true, code: true, name: true } },
  _count: { select: { variants: true, eligibilityRules: true, documentRules: true } },
} satisfies Prisma.ProductInclude;

export const productRepository = {
  findById: (id: string) =>
    prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: productInclude,
    }),

  findByCode: (code: string) =>
    prisma.product.findFirst({ where: { code, deletedAt: null } }),

  list: (
    where: Prisma.ProductWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.ProductOrderByWithRelationInput,
  ) =>
    prisma.product.findMany({
      where: { ...where, deletedAt: null },
      skip,
      take,
      orderBy,
      include: productInclude,
    }),

  count: (where: Prisma.ProductWhereInput) =>
    prisma.product.count({ where: { ...where, deletedAt: null } }),

  create: (input: CreateProductInput, actorId: string) =>
    prisma.product.create({
      data: {
        familyId: input.familyId,
        code: input.code,
        name: input.name,
        description: input.description,
        minAmount: input.minAmount,
        maxAmount: input.maxAmount,
        minTenureMonths: input.minTenureMonths,
        maxTenureMonths: input.maxTenureMonths,
        minInterestRate: input.minInterestRate,
        maxInterestRate: input.maxInterestRate,
        priority: input.priority as never,
        launchDate: input.launchDate,
        createdById: actorId,
        updatedById: actorId,
      },
      include: productInclude,
    }),

  update: (id: string, input: UpdateProductInput, actorId: string) =>
    prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        minAmount: input.minAmount,
        maxAmount: input.maxAmount,
        minTenureMonths: input.minTenureMonths,
        maxTenureMonths: input.maxTenureMonths,
        minInterestRate: input.minInterestRate,
        maxInterestRate: input.maxInterestRate,
        priority: input.priority as never,
        isActive: input.isActive,
        launchDate: input.launchDate,
        updatedById: actorId,
      },
      include: productInclude,
    }),

  updateStatus: (id: string, isActive: boolean, actorId: string) =>
    prisma.product.update({
      where: { id },
      data: { isActive, updatedById: actorId },
    }),

  softDelete: (id: string, actorId: string) =>
    prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: actorId, isActive: false },
    }),
};
