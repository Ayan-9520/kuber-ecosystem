import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const include = {
  documentType: true,
  application: { select: { id: true, applicationNumber: true } },
  customer: { select: { id: true, customerCode: true, fullName: true } },
  requestedBy: { select: { id: true, email: true } },
  fulfilledDocument: { select: { id: true, documentCode: true, status: true } },
} satisfies Prisma.DocumentRequestInclude;

export const documentRequestRepository = {
  findById: (id: string) => prisma.documentRequest.findUnique({ where: { id }, include }),

  list: (
    where: Prisma.DocumentRequestWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.DocumentRequestOrderByWithRelationInput,
  ) => prisma.documentRequest.findMany({ where, skip, take, orderBy, include }),

  count: (where: Prisma.DocumentRequestWhereInput) => prisma.documentRequest.count({ where }),

  create: (data: Prisma.DocumentRequestUncheckedCreateInput) =>
    prisma.documentRequest.create({ data, include }),

  update: (id: string, data: Prisma.DocumentRequestUncheckedUpdateInput) =>
    prisma.documentRequest.update({ where: { id }, data, include }),
};
