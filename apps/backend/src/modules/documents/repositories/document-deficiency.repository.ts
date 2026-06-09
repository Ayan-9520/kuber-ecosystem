import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const documentDeficiencyRepository = {
  findById: (id: string) =>
    prisma.documentDeficiency.findUnique({
      where: { id },
      include: { raisedBy: { select: { id: true, email: true } } },
    }),

  list: (
    where: Prisma.DocumentDeficiencyWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.DocumentDeficiencyOrderByWithRelationInput,
  ) =>
    prisma.documentDeficiency.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { raisedBy: { select: { id: true, email: true } } },
    }),

  count: (where: Prisma.DocumentDeficiencyWhereInput) => prisma.documentDeficiency.count({ where }),

  create: (data: Prisma.DocumentDeficiencyUncheckedCreateInput) =>
    prisma.documentDeficiency.create({ data }),

  update: (id: string, data: Prisma.DocumentDeficiencyUncheckedUpdateInput) =>
    prisma.documentDeficiency.update({ where: { id }, data }),
};
