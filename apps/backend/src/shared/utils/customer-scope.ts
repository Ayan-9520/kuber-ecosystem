import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import { DataScope, UserType } from '@kuberone/shared-types';

import { ForbiddenError } from '../errors/app-error.js';

export interface CustomerScopeRecord {
  id: string;
  userId: string;
  branchId?: string | null;
  rmEmployeeId?: string | null;
}

export function assertCustomerAccess(
  actor: AuthenticatedUser,
  customer: CustomerScopeRecord,
): void {
  if (actor.userType === UserType.CUSTOMER) {
    if (actor.customerId !== customer.id && actor.id !== customer.userId) {
      throw new ForbiddenError('Insufficient access to customer record');
    }
    return;
  }

  switch (actor.dataScope) {
    case DataScope.ORGANIZATION:
      return;
    case DataScope.REGION:
      if (customer.branchId && actor.branchId && customer.branchId !== actor.branchId) {
        // Regional managers may access customers across branches in their region via list filter
        return;
      }
      return;
    case DataScope.BRANCH:
      if (customer.branchId && actor.branchId && customer.branchId !== actor.branchId) {
        throw new ForbiddenError('Insufficient data scope to access customer');
      }
      return;
    case DataScope.ASSIGNED:
      if (
        customer.rmEmployeeId &&
        actor.employeeId &&
        customer.rmEmployeeId !== actor.employeeId
      ) {
        throw new ForbiddenError('Customer not assigned to you');
      }
      return;
    case DataScope.OWN:
      if (actor.customerId !== customer.id) {
        throw new ForbiddenError('Insufficient access to customer record');
      }
      return;
    default:
      throw new ForbiddenError('Insufficient data scope');
  }
}

export function buildCustomerListWhere(
  actor: AuthenticatedUser,
  query: { branchId?: string; search?: string; kycStatus?: string },
): Prisma.CustomerWhereInput {
  const where: Prisma.CustomerWhereInput = {
    deletedAt: null,
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.kycStatus ? { kycStatus: query.kycStatus as never } : {}),
    ...(query.search
      ? {
          OR: [
            { fullName: { contains: query.search } },
            { customerCode: { contains: query.search } },
          ],
        }
      : {}),
  };

  if (actor.userType === UserType.CUSTOMER && actor.customerId) {
    where.id = actor.customerId;
    return where;
  }

  if (actor.userType === UserType.PARTNER && actor.partnerId) {
    where.OR = [
      { leads: { some: { partnerId: actor.partnerId, deletedAt: null } } },
      { applications: { some: { partnerId: actor.partnerId } } },
    ];
    return where;
  }

  switch (actor.dataScope) {
    case DataScope.ORGANIZATION:
      break;
    case DataScope.REGION:
      if (actor.regionId) {
        where.branch = { regionId: actor.regionId };
      }
      break;
    case DataScope.BRANCH:
      if (actor.branchId) where.branchId = actor.branchId;
      break;
    case DataScope.ASSIGNED:
      if (actor.employeeId) where.rmEmployeeId = actor.employeeId;
      break;
    case DataScope.OWN:
      if (actor.customerId) where.id = actor.customerId;
      break;
    default:
      if (actor.customerId) where.id = actor.customerId;
  }

  return where;
}

export function resolveCustomerIdForActor(
  actor: AuthenticatedUser,
  requestedCustomerId?: string,
): string | undefined {
  if (actor.userType === UserType.CUSTOMER) {
    return actor.customerId;
  }
  return requestedCustomerId;
}
