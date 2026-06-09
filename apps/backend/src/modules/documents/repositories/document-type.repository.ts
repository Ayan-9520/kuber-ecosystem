import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const documentTypeRepository = {
  findById: (id: string) => prisma.documentType.findUnique({ where: { id } }),

  findByCode: (code: string) => prisma.documentType.findUnique({ where: { code } }),

  list: (
    where: Prisma.DocumentTypeWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.DocumentTypeOrderByWithRelationInput,
  ) => prisma.documentType.findMany({ where, skip, take, orderBy }),

  count: (where: Prisma.DocumentTypeWhereInput) => prisma.documentType.count({ where }),

  create: (data: Prisma.DocumentTypeUncheckedCreateInput) => prisma.documentType.create({ data }),

  update: (id: string, data: Prisma.DocumentTypeUncheckedUpdateInput) =>
    prisma.documentType.update({ where: { id }, data }),
};
