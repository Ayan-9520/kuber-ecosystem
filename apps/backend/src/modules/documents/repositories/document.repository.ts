import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

const documentInclude = {
  documentType: true,
  customer: { select: { id: true, customerCode: true, fullName: true } },
  lead: { select: { id: true, leadNumber: true } },
  application: { select: { id: true, applicationNumber: true } },
  partner: { select: { id: true, partnerCode: true } },
  uploadedBy: { select: { id: true, email: true } },
} satisfies Prisma.DocumentInclude;

export const documentRepository = {
  findById: (id: string) =>
    prisma.document.findFirst({ where: { id, deletedAt: null }, include: documentInclude }),

  getLastDocumentCode: () =>
    prisma.document.findFirst({ orderBy: { createdAt: 'desc' }, select: { documentCode: true } }),

  list: (
    where: Prisma.DocumentWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.DocumentOrderByWithRelationInput,
  ) => prisma.document.findMany({ where, skip, take, orderBy, include: documentInclude }),

  count: (where: Prisma.DocumentWhereInput) => prisma.document.count({ where }),

  create: (data: Prisma.DocumentUncheckedCreateInput) =>
    prisma.document.create({ data, include: documentInclude }),

  update: (id: string, data: Prisma.DocumentUncheckedUpdateInput) =>
    prisma.document.update({ where: { id }, data, include: documentInclude }),

  softDelete: (id: string, deletedById: string) =>
    prisma.document.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById, status: 'REJECTED' },
    }),
};
