import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const applicationTimelineRepository = {
  list: (
    where: Prisma.ApplicationTimelineWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.ApplicationTimelineOrderByWithRelationInput,
  ) =>
    prisma.applicationTimeline.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        performedBy: { select: { id: true, email: true, phone: true } },
      },
    }),

  count: (where: Prisma.ApplicationTimelineWhereInput) => prisma.applicationTimeline.count({ where }),

  create: (data: Prisma.ApplicationTimelineUncheckedCreateInput) =>
    prisma.applicationTimeline.create({ data }),
};
