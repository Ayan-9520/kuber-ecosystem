import type { Prisma } from '@kuberone/database';
import type { AssignRolePermissionInput, ListRolePermissionsQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';

const rolePermissionInclude = {
  role: true,
  permission: true,
} satisfies Prisma.RolePermissionInclude;

export const rolePermissionRepository = {
  find: (roleId: string, permissionId: string) =>
    prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
      include: rolePermissionInclude,
    }),

  list: (where: Prisma.RolePermissionWhereInput, skip: number, take: number) =>
    prisma.rolePermission.findMany({
      where,
      skip,
      take,
      include: rolePermissionInclude,
      orderBy: { roleId: 'asc' },
    }),

  count: (where: Prisma.RolePermissionWhereInput) => prisma.rolePermission.count({ where }),

  listByRoleId: (roleId: string) =>
    prisma.rolePermission.findMany({
      where: { roleId },
      include: rolePermissionInclude,
    }),

  assign: (input: AssignRolePermissionInput) =>
    prisma.rolePermission.create({
      data: {
        roleId: input.roleId,
        permissionId: input.permissionId,
      },
      include: rolePermissionInclude,
    }),

  remove: (roleId: string, permissionId: string) =>
    prisma.rolePermission.delete({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    }),

  removeAllForRole: (roleId: string) =>
    prisma.rolePermission.deleteMany({
      where: { roleId },
    }),

  replaceForRole: async (roleId: string, permissionIds: string[]) => {
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
        skipDuplicates: true,
      }),
    ]);
  },
};

export type ListRolePermissionsRepositoryQuery = ListRolePermissionsQuery;
