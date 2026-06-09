import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import { DataScope } from '@kuberone/shared-types';
import type { ListUsersQuery } from '@kuberone/shared-validation';

export interface UserListItem {
  id: string;
  email: string | null;
  phone: string | null;
  userType: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  roles: Array<{
    id: string;
    roleId: string;
    roleCode: string;
    roleName: string;
    branchId: string | null;
    regionId: string | null;
    isPrimary: boolean;
  }>;
}

export interface UserDetail extends UserListItem {
  branchId?: string;
  regionId?: string;
}

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  actorId: string;
}

export function buildUserListWhere(
  actor: AuthenticatedUser,
  query: ListUsersQuery,
): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(query.userType ? { userType: query.userType } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { email: { contains: query.search } },
            { phone: { contains: query.search } },
          ],
        }
      : {}),
  };

  switch (actor.dataScope) {
    case DataScope.ORGANIZATION:
      break;
    case DataScope.REGION:
      if (actor.regionId) {
        where.userRoles = { some: { regionId: actor.regionId } };
      } else {
        where.id = actor.id;
      }
      break;
    case DataScope.BRANCH:
      if (actor.branchId) {
        where.userRoles = { some: { branchId: actor.branchId } };
      } else {
        where.id = actor.id;
      }
      break;
    case DataScope.ASSIGNED:
    case DataScope.OWN:
      where.id = actor.id;
      break;
    default:
      where.id = actor.id;
  }

  if (query.branchId) {
    where.userRoles = {
      ...(typeof where.userRoles === 'object' ? where.userRoles : {}),
      some: {
        branchId: query.branchId,
      },
    };
  }

  if (query.regionId) {
    where.userRoles = {
      ...(typeof where.userRoles === 'object' ? where.userRoles : {}),
      some: {
        regionId: query.regionId,
      },
    };
  }

  return where;
}

export function canAccessUser(
  actor: AuthenticatedUser,
  target: { id: string; branchId?: string | null; regionId?: string | null },
): boolean {
  switch (actor.dataScope) {
    case DataScope.ORGANIZATION:
      return true;
    case DataScope.REGION:
      return !target.regionId || target.regionId === actor.regionId;
    case DataScope.BRANCH:
      return !target.branchId || target.branchId === actor.branchId;
    case DataScope.ASSIGNED:
    case DataScope.OWN:
      return target.id === actor.id;
    default:
      return false;
  }
}
