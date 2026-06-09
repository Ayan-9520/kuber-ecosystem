import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const customerEmploymentRepository = {
  findById: (id: string) =>
    prisma.customerEmployment.findFirst({
      where: { id, deletedAt: null },
      include: { industry: true, occupation: true, officeAddress: true },
    }),

  listByCustomer: (customerId: string, isCurrent?: boolean) =>
    prisma.customerEmployment.findMany({
      where: {
        customerId,
        deletedAt: null,
        ...(isCurrent !== undefined ? { isCurrent } : {}),
      },
      include: { industry: true, occupation: true, officeAddress: true },
      orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
    }),

  create: (data: Prisma.CustomerEmploymentUncheckedCreateInput) =>
    prisma.customerEmployment.create({
      data,
      include: { industry: true, occupation: true, officeAddress: true },
    }),

  update: (id: string, data: Prisma.CustomerEmploymentUncheckedUpdateInput) =>
    prisma.customerEmployment.update({
      where: { id },
      data,
      include: { industry: true, occupation: true, officeAddress: true },
    }),

  softDelete: (id: string, deletedById: string) =>
    prisma.customerEmployment.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById },
    }),

  clearCurrent: (customerId: string) =>
    prisma.customerEmployment.updateMany({
      where: { customerId, isCurrent: true, deletedAt: null },
      data: { isCurrent: false },
    }),
};
