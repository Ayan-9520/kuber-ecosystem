import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const verificationResultRepository = {
  findById: (id: string) =>
    prisma.verificationResult.findUnique({
      where: { id },
      include: { verifiedBy: { select: { id: true, email: true } } },
    }),

  list: (
    where: Prisma.VerificationResultWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.VerificationResultOrderByWithRelationInput,
  ) =>
    prisma.verificationResult.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { verifiedBy: { select: { id: true, email: true } } },
    }),

  count: (where: Prisma.VerificationResultWhereInput) => prisma.verificationResult.count({ where }),

  create: (data: Prisma.VerificationResultUncheckedCreateInput) =>
    prisma.verificationResult.create({ data }),
};
