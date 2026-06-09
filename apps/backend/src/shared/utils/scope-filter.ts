import { DataScope } from '@kuberone/shared-types';
import type { AuthenticatedUser } from '@kuberone/shared-types';

export interface ScopeFilter {
  scope: DataScope;
  userId: string;
  branchId?: string;
  regionId?: string;
  employeeId?: string;
  customerId?: string;
  partnerId?: string;
}

export function buildScopeFilter(user: AuthenticatedUser): ScopeFilter {
  return {
    scope: user.dataScope,
    userId: user.id,
    branchId: user.branchId,
    regionId: user.regionId,
    employeeId: user.employeeId,
    customerId: user.customerId,
    partnerId: user.partnerId,
  };
}

export function canAccessRecord(
  filter: ScopeFilter,
  record: {
    ownerId?: string;
    assignedToId?: string;
    branchId?: string;
    regionId?: string;
    customerId?: string;
    partnerId?: string;
  },
): boolean {
  switch (filter.scope) {
    case DataScope.ORGANIZATION:
      return true;
    case DataScope.REGION:
      return !record.regionId || record.regionId === filter.regionId;
    case DataScope.BRANCH:
      return !record.branchId || record.branchId === filter.branchId;
    case DataScope.ASSIGNED:
      return record.assignedToId === filter.employeeId || record.assignedToId === filter.userId;
    case DataScope.OWN:
      return (
        record.ownerId === filter.userId ||
        record.customerId === filter.customerId ||
        record.partnerId === filter.partnerId
      );
    default:
      return false;
  }
}
