import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const include = {
  application: { select: { id: true, applicationNumber: true } },
  reviewer: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
} satisfies Prisma.CreditReviewInclude;

export const creditReviewRepository = {
  findById: (id: string) => prisma.creditReview.findUnique({ where: { id }, include }),

  list: (
    where: Prisma.CreditReviewWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.CreditReviewOrderByWithRelationInput,
  ) => prisma.creditReview.findMany({ where, skip, take, orderBy, include }),

  count: (where: Prisma.CreditReviewWhereInput) => prisma.creditReview.count({ where }),

  create: (data: Prisma.CreditReviewUncheckedCreateInput) =>
    prisma.creditReview.create({ data, include }),

  update: (id: string, data: Prisma.CreditReviewUncheckedUpdateInput) =>
    prisma.creditReview.update({ where: { id }, data, include }),
};
