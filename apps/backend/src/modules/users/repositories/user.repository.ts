import type { Prisma } from '@kuberone/database';
import type { CreateUserInput, UpdateUserInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';

const userWithRolesInclude = {
  userRoles: {
    include: {
      role: true,
    },
  },
} satisfies Prisma.UserInclude;

export const userRepository = {
  findById: (id: string) =>
    prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: userWithRolesInclude,
    }),

  findByEmail: (email: string, excludeId?: string) =>
    prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    }),

  findByPhone: (phone: string, excludeId?: string) =>
    prisma.user.findFirst({
      where: {
        phone,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    }),

  list: (where: Prisma.UserWhereInput, skip: number, take: number, orderBy: Prisma.UserOrderByWithRelationInput) =>
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      include: userWithRolesInclude,
    }),

  count: (where: Prisma.UserWhereInput) => prisma.user.count({ where }),

  create: (data: {
    email?: string;
    phone?: string;
    passwordHash?: string;
    userType: string;
    status: string;
  }) =>
    prisma.user.create({
      data,
      include: userWithRolesInclude,
    }),

  update: (id: string, data: UpdateUserInput & { passwordHash?: string }) =>
    prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        status: data.status,
        emailVerified: data.emailVerified,
        phoneVerified: data.phoneVerified,
      },
      include: userWithRolesInclude,
    }),

  softDelete: (id: string) =>
    prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    }),

  getEmployeeScope: (userId: string) =>
    prisma.employee.findUnique({
      where: { userId },
      select: {
        branchId: true,
        branch: { select: { regionId: true } },
      },
    }),

  getPrimaryScope: async (userId: string) => {
    const userRole = await prisma.userRole.findFirst({
      where: { userId, isPrimary: true },
      select: { branchId: true, regionId: true },
    });
    if (userRole) return userRole;

    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: {
        branchId: true,
        branch: { select: { regionId: true } },
      },
    });

    return {
      branchId: employee?.branchId ?? null,
      regionId: employee?.branch.regionId ?? null,
    };
  },
};

export type UserWithRoles = NonNullable<Awaited<ReturnType<typeof userRepository.findById>>>;

export type CreateUserRepositoryInput = CreateUserInput;
