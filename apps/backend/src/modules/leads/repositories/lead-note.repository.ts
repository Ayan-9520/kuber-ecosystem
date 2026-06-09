import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const leadNoteRepository = {
  findById: (id: string) =>
    prisma.leadNote.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, email: true, phone: true } },
      },
    }),

  list: (
    where: Prisma.LeadNoteWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.LeadNoteOrderByWithRelationInput,
  ) =>
    prisma.leadNote.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        author: { select: { id: true, email: true, phone: true } },
      },
    }),

  count: (where: Prisma.LeadNoteWhereInput) => prisma.leadNote.count({ where }),

  create: (data: Prisma.LeadNoteUncheckedCreateInput) => prisma.leadNote.create({ data }),

  update: (id: string, data: Prisma.LeadNoteUncheckedUpdateInput) =>
    prisma.leadNote.update({ where: { id }, data }),

  delete: (id: string) => prisma.leadNote.delete({ where: { id } }),
};
