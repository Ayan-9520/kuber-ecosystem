import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { RegionalAnalyticsBaseQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { MANAGEMENT_ROLES } from '../constants/regional-analytics.constants.js';
import type { RegionalScope } from '../types/regional-analytics.types.js';

function isManagement(actor: AuthenticatedUser): boolean {
  return (
    actor.roles.some((r) => (MANAGEMENT_ROLES as readonly string[]).includes(r)) ||
    actor.permissions.includes('regional_analytics.all') ||
    actor.permissions.includes('*')
  );
}

async function getRegionBranchIds(regionId: string): Promise<string[]> {
  const branches = await prisma.branch.findMany({
    where: { regionId, isActive: true },
    select: { id: true },
  });
  return branches.map((b) => b.id);
}

export async function resolveRegionalScope(
  actor: AuthenticatedUser,
  query: RegionalAnalyticsBaseQuery,
): Promise<{ query: RegionalAnalyticsBaseQuery; scope: RegionalScope }> {
  if (isManagement(actor)) {
    const regionId = query.regionId;
    const branchIds = regionId
      ? query.branchId
        ? [query.branchId]
        : await getRegionBranchIds(regionId)
      : [];
    return {
      query,
      scope: { regionId, branchIds, canViewAll: true },
    };
  }

  const regionId = actor.regionId ?? query.regionId;
  if (!regionId) {
    return { query, scope: { branchIds: [], canViewAll: false } };
  }

  const regionBranchIds = await getRegionBranchIds(regionId);
  if (query.branchId && !regionBranchIds.includes(query.branchId)) {
    return {
      query: { ...query, branchId: undefined },
      scope: { regionId, branchIds: regionBranchIds, canViewAll: false },
    };
  }

  return {
    query: { ...query, regionId },
    scope: {
      regionId,
      branchIds: query.branchId ? [query.branchId] : regionBranchIds,
      canViewAll: false,
    },
  };
}

export function regionWhere(scope: RegionalScope, branchId?: string) {
  const ids = branchId ? [branchId] : scope.branchIds;
  if (ids.length === 1) return { branchId: ids[0] };
  if (ids.length > 1) return { branchId: { in: ids } };
  if (scope.regionId) return { regionId: scope.regionId };
  return {};
}

export function branchFilter(scope: RegionalScope, branchId?: string) {
  const ids = branchId ? [branchId] : scope.branchIds;
  if (ids.length === 1) return { branchId: ids[0] };
  if (ids.length > 1) return { branchId: { in: ids } };
  return {};
}
