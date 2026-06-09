import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const panVerificationRepository = {
  create: (data: Prisma.PanVerificationUncheckedCreateInput) =>
    prisma.panVerification.create({ data }),

  listByProfile: (kycProfileId: string) =>
    prisma.panVerification.findMany({
      where: { kycProfileId },
      orderBy: { createdAt: 'desc' },
    }),
};
