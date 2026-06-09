import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const customerIncomeRepository = {
  findById: (id: string) =>
    prisma.customerIncome.findFirst({
      where: { id, deletedAt: null },
      include: { employment: true },
    }),

  listByCustomer: (customerId: string, employmentId?: string) =>
    prisma.customerIncome.findMany({
      where: {
        customerId,
        deletedAt: null,
        ...(employmentId ? { employmentId } : {}),
      },
      include: { employment: true },
      orderBy: { declaredAt: 'desc' },
    }),

  create: (data: Prisma.CustomerIncomeUncheckedCreateInput) =>
    prisma.customerIncome.create({
      data,
      include: { employment: true },
    }),

  update: (id: string, data: Prisma.CustomerIncomeUncheckedUpdateInput) =>
    prisma.customerIncome.update({
      where: { id },
      data,
      include: { employment: true },
    }),

  softDelete: (id: string, deletedById: string) =>
    prisma.customerIncome.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById },
    }),
};
