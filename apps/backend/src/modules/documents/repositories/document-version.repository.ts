import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const documentVersionRepository = {
  findById: (id: string) =>
    prisma.documentVersion.findUnique({
      where: { id },
      include: { uploadedBy: { select: { id: true, email: true } } },
    }),

  list: (
    where: Prisma.DocumentVersionWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.DocumentVersionOrderByWithRelationInput,
  ) =>
    prisma.documentVersion.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { uploadedBy: { select: { id: true, email: true } } },
    }),

  count: (where: Prisma.DocumentVersionWhereInput) => prisma.documentVersion.count({ where }),

  create: (data: Prisma.DocumentVersionUncheckedCreateInput) => prisma.documentVersion.create({ data }),

  getLatestVersionNumber: (documentId: string) =>
    prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    }),
};
