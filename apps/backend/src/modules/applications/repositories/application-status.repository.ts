import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const applicationStatusRepository = {
  list: (
    where: Prisma.ApplicationStatusHistoryWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.ApplicationStatusHistoryOrderByWithRelationInput,
  ) =>
    prisma.applicationStatusHistory.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        changedBy: { select: { id: true, email: true, phone: true } },
        application: { select: { id: true, applicationNumber: true } },
      },
    }),

  count: (where: Prisma.ApplicationStatusHistoryWhereInput) =>
    prisma.applicationStatusHistory.count({ where }),

  create: (data: Prisma.ApplicationStatusHistoryUncheckedCreateInput) =>
    prisma.applicationStatusHistory.create({ data }),
};
