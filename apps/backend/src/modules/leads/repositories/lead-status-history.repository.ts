import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const leadStatusHistoryRepository = {
  list: (
    where: Prisma.LeadStatusHistoryWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.LeadStatusHistoryOrderByWithRelationInput,
  ) =>
    prisma.leadStatusHistory.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        changedBy: { select: { id: true, email: true, phone: true } },
      },
    }),

  count: (where: Prisma.LeadStatusHistoryWhereInput) => prisma.leadStatusHistory.count({ where }),

  create: (data: Prisma.LeadStatusHistoryUncheckedCreateInput) =>
    prisma.leadStatusHistory.create({ data }),
};
