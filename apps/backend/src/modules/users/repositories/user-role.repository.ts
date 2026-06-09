import type { Prisma } from '@kuberone/database';
import type { AssignUserRoleInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';

const userRoleInclude = {
  role: true,
  user: {
    select: {
      id: true,
      email: true,
      phone: true,
      userType: true,
      status: true,
    },
  },
} satisfies Prisma.UserRoleInclude;

export const userRoleRepository = {
  findById: (id: string) =>
    prisma.userRole.findUnique({
      where: { id },
      include: userRoleInclude,
    }),

  findByUserAndRole: (userId: string, roleId: string, branchId?: string | null) =>
    prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
        branchId: branchId ?? null,
      },
      include: userRoleInclude,
    }),

  listByUser: (userId: string) =>
    prisma.userRole.findMany({
      where: { userId },
      include: userRoleInclude,
      orderBy: { createdAt: 'desc' },
    }),

  list: (where: Prisma.UserRoleWhereInput, skip: number, take: number) =>
    prisma.userRole.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: userRoleInclude,
    }),

  count: (where: Prisma.UserRoleWhereInput) => prisma.userRole.count({ where }),

  assign: (input: AssignUserRoleInput) =>
    prisma.userRole.create({
      data: {
        userId: input.userId,
        roleId: input.roleId,
        branchId: input.branchId,
        regionId: input.regionId,
        isPrimary: input.isPrimary,
      },
      include: userRoleInclude,
    }),

  remove: (id: string) => prisma.userRole.delete({ where: { id } }),

  clearPrimary: (userId: string) =>
    prisma.userRole.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    }),
};
