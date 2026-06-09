import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const kycAuditRepository = {
  create: (data: Prisma.KycAuditLogUncheckedCreateInput) =>
    prisma.kycAuditLog.create({ data }),

  listByProfile: (kycProfileId: string, skip: number, take: number) =>
    prisma.kycAuditLog.findMany({
      where: { kycProfileId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        performedBy: { select: { id: true, email: true, phone: true } },
      },
    }),

  countByProfile: (kycProfileId: string) =>
    prisma.kycAuditLog.count({ where: { kycProfileId } }),
};
