import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const leadScoreRepository = {
  findById: (id: string) =>
    prisma.leadScore.findUnique({
      where: { id },
      include: { lead: { select: { id: true, leadNumber: true, prospectName: true } } },
    }),

  findLatestByLeadId: (leadId: string) =>
    prisma.leadScore.findFirst({
      where: { leadId },
      orderBy: { calculatedAt: 'desc' },
    }),

  list: (
    where: Prisma.LeadScoreWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.LeadScoreOrderByWithRelationInput,
  ) =>
    prisma.leadScore.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { lead: { select: { id: true, leadNumber: true, prospectName: true } } },
    }),

  count: (where: Prisma.LeadScoreWhereInput) => prisma.leadScore.count({ where }),

  create: (data: Prisma.LeadScoreUncheckedCreateInput) => prisma.leadScore.create({ data }),
};
