import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const eligibilityResultRepository = {
  findById: (id: string) =>
    prisma.eligibilityResult.findUnique({
      where: { id },
      include: {
        application: { select: { id: true, applicationNumber: true } },
        product: { select: { id: true, code: true, name: true } },
      },
    }),

  findLatestByApplicationId: (applicationId: string) =>
    prisma.eligibilityResult.findFirst({
      where: { applicationId },
      orderBy: { checkedAt: 'desc' },
    }),

  list: (
    where: Prisma.EligibilityResultWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.EligibilityResultOrderByWithRelationInput,
  ) => prisma.eligibilityResult.findMany({ where, skip, take, orderBy }),

  count: (where: Prisma.EligibilityResultWhereInput) => prisma.eligibilityResult.count({ where }),

  create: (data: Prisma.EligibilityResultUncheckedCreateInput) =>
    prisma.eligibilityResult.create({ data }),
};
