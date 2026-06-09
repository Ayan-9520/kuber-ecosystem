import type { Prisma } from '@kuberone/database';
import type { CreatePermissionInput, UpdatePermissionInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';

const permissionWithRolesInclude = {
  rolePermissions: {
    include: { role: true },
  },
} satisfies Prisma.PermissionInclude;

export const permissionRepository = {
  findById: (id: string) =>
    prisma.permission.findUnique({
      where: { id },
      include: permissionWithRolesInclude,
    }),

  findByCode: (code: string) =>
    prisma.permission.findUnique({
      where: { code },
      include: permissionWithRolesInclude,
    }),

  list: (where: Prisma.PermissionWhereInput, skip: number, take: number) =>
    prisma.permission.findMany({
      where,
      skip,
      take,
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    }),

  count: (where: Prisma.PermissionWhereInput) => prisma.permission.count({ where }),

  create: (input: CreatePermissionInput) =>
    prisma.permission.create({
      data: input,
    }),

  update: (id: string, input: UpdatePermissionInput) =>
    prisma.permission.update({
      where: { id },
      data: input,
    }),

  delete: (id: string) => prisma.permission.delete({ where: { id } }),
};

export type PermissionRecord = NonNullable<Awaited<ReturnType<typeof permissionRepository.findById>>>;
