import type { AuthenticatedUser } from '@kuberone/shared-types';
import { DataScope, UserType } from '@kuberone/shared-types';
import type { AnalyticsBaseQuery } from '@kuberone/shared-validation';

export function applyAnalyticsScope(actor: AuthenticatedUser, query: AnalyticsBaseQuery): AnalyticsBaseQuery {
  if (actor.roles.includes('SUPER_ADMIN') || actor.roles.includes('ADMIN')) {
    return query;
  }

  if (actor.userType === UserType.PARTNER && actor.partnerId) {
    return { ...query, partnerId: actor.partnerId };
  }

  switch (actor.dataScope) {
    case DataScope.ORGANIZATION:
      return query;
    case DataScope.REGION:
      return actor.regionId ? { ...query, regionId: actor.regionId } : query;
    case DataScope.BRANCH:
      return actor.branchId ? { ...query, branchId: actor.branchId } : query;
    case DataScope.ASSIGNED:
      return actor.employeeId ? { ...query, employeeId: actor.employeeId } : query;
    case DataScope.OWN:
      return { ...query, employeeId: actor.employeeId ?? undefined };
    default:
      return query;
  }
}
