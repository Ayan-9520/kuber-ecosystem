import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const leadSourceRepository = {
  findById: (id: string) => prisma.leadSource.findUnique({ where: { id } }),

  findByCode: (code: string) => prisma.leadSource.findUnique({ where: { code } }),

  list: (
    where: Prisma.LeadSourceWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.LeadSourceOrderByWithRelationInput,
  ) => prisma.leadSource.findMany({ where, skip, take, orderBy }),

  count: (where: Prisma.LeadSourceWhereInput) => prisma.leadSource.count({ where }),

  create: (data: Prisma.LeadSourceUncheckedCreateInput) => prisma.leadSource.create({ data }),

  update: (id: string, data: Prisma.LeadSourceUncheckedUpdateInput) =>
    prisma.leadSource.update({ where: { id }, data }),
};
