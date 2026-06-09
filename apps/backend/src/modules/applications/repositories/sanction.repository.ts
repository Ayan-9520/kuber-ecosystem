import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const include = {
  application: { select: { id: true, applicationNumber: true, status: true } },
  lender: { select: { id: true, code: true, name: true } },
} satisfies Prisma.SanctionInclude;

export const sanctionRepository = {
  findById: (id: string) => prisma.sanction.findUnique({ where: { id }, include }),

  findByApplicationId: (applicationId: string) =>
    prisma.sanction.findUnique({ where: { applicationId }, include }),

  list: (
    where: Prisma.SanctionWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.SanctionOrderByWithRelationInput,
  ) => prisma.sanction.findMany({ where, skip, take, orderBy, include }),

  count: (where: Prisma.SanctionWhereInput) => prisma.sanction.count({ where }),

  create: (data: Prisma.SanctionUncheckedCreateInput) => prisma.sanction.create({ data, include }),

  update: (id: string, data: Prisma.SanctionUncheckedUpdateInput) =>
    prisma.sanction.update({ where: { id }, data, include }),
};
