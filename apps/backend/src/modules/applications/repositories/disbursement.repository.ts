import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const include = {
  application: { select: { id: true, applicationNumber: true, status: true } },
  lender: { select: { id: true, code: true, name: true } },
} satisfies Prisma.DisbursementInclude;

export const disbursementRepository = {
  findById: (id: string) => prisma.disbursement.findUnique({ where: { id }, include }),

  list: (
    where: Prisma.DisbursementWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.DisbursementOrderByWithRelationInput,
  ) => prisma.disbursement.findMany({ where, skip, take, orderBy, include }),

  count: (where: Prisma.DisbursementWhereInput) => prisma.disbursement.count({ where }),

  create: (data: Prisma.DisbursementUncheckedCreateInput) =>
    prisma.disbursement.create({ data, include }),

  update: (id: string, data: Prisma.DisbursementUncheckedUpdateInput) =>
    prisma.disbursement.update({ where: { id }, data, include }),

  sumByApplication: (applicationId: string) =>
    prisma.disbursement.aggregate({
      where: { applicationId, status: 'COMPLETED' },
      _sum: { disbursementAmount: true },
    }),
};
