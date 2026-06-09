import { randomInt } from 'crypto';

import type { Prisma } from '@kuberone/database';
import type { CreateCustomerInput, ListCustomersQuery, UpdateCustomerInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';

const customerInclude = {
  profile: true,
  preferences: true,
  branch: { select: { id: true, code: true, name: true } },
  rmEmployee: {
    select: { id: true, employeeCode: true, firstName: true, lastName: true },
  },
} satisfies Prisma.CustomerInclude;

export function generateCustomerCode(): string {
  return `KFC${randomInt(100000, 999999)}`;
}

export const customerRepository = {
  findById: (id: string) =>
    prisma.customer.findFirst({
      where: { id, deletedAt: null },
      include: customerInclude,
    }),

  findByUserId: (userId: string) =>
    prisma.customer.findFirst({
      where: { userId, deletedAt: null },
      include: customerInclude,
    }),

  list: (
    where: Prisma.CustomerWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.CustomerOrderByWithRelationInput,
  ) =>
    prisma.customer.findMany({
      where,
      skip,
      take,
      orderBy,
      include: customerInclude,
    }),

  count: (where: Prisma.CustomerWhereInput) => prisma.customer.count({ where }),

  create: (input: CreateCustomerInput & { customerCode: string; fullName: string; createdById: string }) =>
    prisma.customer.create({
      data: {
        userId: input.userId,
        customerCode: input.customerCode,
        firstName: input.firstName,
        lastName: input.lastName,
        fullName: input.fullName,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        maritalStatus: input.maritalStatus,
        branchId: input.branchId,
        rmEmployeeId: input.rmEmployeeId,
        source: input.source,
        metadata: input.metadata as Prisma.InputJsonValue,
        createdById: input.createdById,
        updatedById: input.createdById,
      },
      include: customerInclude,
    }),

  update: (id: string, input: UpdateCustomerInput & { fullName?: string; updatedById: string }) =>
    prisma.customer.update({
      where: { id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        fullName: input.fullName,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        maritalStatus: input.maritalStatus,
        branchId: input.branchId,
        rmEmployeeId: input.rmEmployeeId,
        source: input.source,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
        updatedById: input.updatedById,
        version: { increment: 1 },
      },
      include: customerInclude,
    }),

  softDelete: (id: string, deletedById: string) =>
    prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById },
    }),

  updateKycStatus: (id: string, kycStatus: string) =>
    prisma.customer.update({
      where: { id },
      data: { kycStatus: kycStatus as never },
    }),

  updateProfileCompletion: (id: string, profileCompletionPct: number) =>
    prisma.customer.update({
      where: { id },
      data: { profileCompletionPct },
    }),
};

export type CustomerRecord = NonNullable<Awaited<ReturnType<typeof customerRepository.findById>>>;

export type ListCustomersRepositoryQuery = ListCustomersQuery;
