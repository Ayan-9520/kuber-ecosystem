import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const kycProfileRepository = {
  findByEntity: (entityType: string, entityId: string) =>
    prisma.kycProfile.findFirst({
      where: { entityType: entityType as never, entityId, deletedAt: null },
      include: {
        panVerifications: { orderBy: { createdAt: 'desc' }, take: 5 },
        aadhaarVerifications: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    }),

  findById: (id: string) =>
    prisma.kycProfile.findFirst({
      where: { id, deletedAt: null },
      include: {
        panVerifications: { orderBy: { createdAt: 'desc' }, take: 5 },
        aadhaarVerifications: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    }),

  create: (data: Prisma.KycProfileUncheckedCreateInput) =>
    prisma.kycProfile.create({
      data,
      include: {
        panVerifications: true,
        aadhaarVerifications: true,
      },
    }),

  update: (id: string, data: Prisma.KycProfileUncheckedUpdateInput) =>
    prisma.kycProfile.update({
      where: { id },
      data,
      include: {
        panVerifications: { orderBy: { createdAt: 'desc' }, take: 5 },
        aadhaarVerifications: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    }),
};
