import type { Prisma } from '@kuberone/database';
import type { CreateRoleInput, ListRolesQuery, UpdateRoleInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';

const roleWithPermissionsInclude = {
  rolePermissions: {
    include: { permission: true },
  },
} satisfies Prisma.RoleInclude;

export const roleRepository = {
  findById: (id: string) =>
    prisma.role.findUnique({
      where: { id },
      include: roleWithPermissionsInclude,
    }),

  findByCode: (code: string) =>
    prisma.role.findUnique({
      where: { code },
      include: roleWithPermissionsInclude,
    }),

  list: (where: Prisma.RoleWhereInput, skip: number, take: number) =>
    prisma.role.findMany({
      where,
      skip,
      take,
      orderBy: { code: 'asc' },
      include: {
        _count: { select: { rolePermissions: true } },
      },
    }),

  count: (where: Prisma.RoleWhereInput) => prisma.role.count({ where }),

  create: (input: CreateRoleInput) =>
    prisma.role.create({
      data: {
        code: input.code,
        name: input.name,
        description: input.description,
        isSystem: input.isSystem,
      },
      include: roleWithPermissionsInclude,
    }),

  update: (id: string, input: UpdateRoleInput) =>
    prisma.role.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
      },
      include: roleWithPermissionsInclude,
    }),

  delete: (id: string) => prisma.role.delete({ where: { id } }),
};

export type RoleWithPermissions = NonNullable<Awaited<ReturnType<typeof roleRepository.findById>>>;

export type ListRolesRepositoryQuery = ListRolesQuery;
