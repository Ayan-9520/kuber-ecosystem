import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const aadhaarVerificationRepository = {
  create: (data: Prisma.AadhaarVerificationUncheckedCreateInput) =>
    prisma.aadhaarVerification.create({ data }),

  listByProfile: (kycProfileId: string) =>
    prisma.aadhaarVerification.findMany({
      where: { kycProfileId },
      orderBy: { createdAt: 'desc' },
    }),
};
