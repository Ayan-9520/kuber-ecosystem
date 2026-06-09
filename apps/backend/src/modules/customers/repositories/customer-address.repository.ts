import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const customerAddressRepository = {
  findById: (id: string) =>
    prisma.customerAddress.findFirst({
      where: { id, deletedAt: null },
    }),

  listByCustomer: (customerId: string, addressType?: string) =>
    prisma.customerAddress.findMany({
      where: {
        customerId,
        deletedAt: null,
        ...(addressType ? { addressType: addressType as never } : {}),
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    }),

  create: (data: Prisma.CustomerAddressUncheckedCreateInput) =>
    prisma.customerAddress.create({ data }),

  update: (id: string, data: Prisma.CustomerAddressUncheckedUpdateInput) =>
    prisma.customerAddress.update({ where: { id }, data }),

  softDelete: (id: string, deletedById: string) =>
    prisma.customerAddress.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById },
    }),

  clearPrimary: (customerId: string) =>
    prisma.customerAddress.updateMany({
      where: { customerId, isPrimary: true, deletedAt: null },
      data: { isPrimary: false },
    }),
};
