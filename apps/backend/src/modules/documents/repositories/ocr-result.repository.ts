import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const ocrResultRepository = {
  findById: (id: string) => prisma.ocrResult.findUnique({ where: { id } }),

  list: (
    where: Prisma.OcrResultWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.OcrResultOrderByWithRelationInput,
  ) => prisma.ocrResult.findMany({ where, skip, take, orderBy }),

  count: (where: Prisma.OcrResultWhereInput) => prisma.ocrResult.count({ where }),

  create: (data: Prisma.OcrResultUncheckedCreateInput) => prisma.ocrResult.create({ data }),

  findLatestByDocumentId: (documentId: string) =>
    prisma.ocrResult.findFirst({
      where: { documentId },
      orderBy: { processedAt: 'desc' },
    }),
};
