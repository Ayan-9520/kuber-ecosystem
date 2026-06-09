import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { BranchAnalyticsBaseQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { MANAGEMENT_ROLES, REGIONAL_ROLES } from '../constants/branch-analytics.constants.js';
import type { BranchScope } from '../types/branch-analytics.types.js';

function isManagement(actor: AuthenticatedUser): boolean {
  return actor.roles.some((r) => (MANAGEMENT_ROLES as readonly string[]).includes(r));
}

function canViewRegion(actor: AuthenticatedUser): boolean {
  return (
    isManagement(actor) ||
    actor.roles.some((r) => (REGIONAL_ROLES as readonly string[]).includes(r)) ||
    actor.permissions.includes('branch_analytics.region') ||
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

export async function resolveBranchScope(
  actor: AuthenticatedUser,
  query: BranchAnalyticsBaseQuery,
): Promise<{ query: BranchAnalyticsBaseQuery; scope: BranchScope }> {
  if (isManagement(actor)) {
    const branchIds = query.branchId ? [query.branchId] : [];
    return {
      query,
      scope: {
        branchIds,
        regionId: query.regionId,
        canViewRegion: true,
        canViewAll: true,
      },
    };
  }

  if (canViewRegion(actor) && actor.regionId) {
    const regionBranchIds = await getRegionBranchIds(actor.regionId);
    if (query.branchId) {
      if (!regionBranchIds.includes(query.branchId)) {
        return {
          query: { ...query, branchId: actor.branchId },
          scope: { branchIds: actor.branchId ? [actor.branchId] : [], canViewRegion: false, canViewAll: false },
        };
      }
      return {
        query,
        scope: { branchIds: [query.branchId], regionId: actor.regionId, canViewRegion: true, canViewAll: false },
      };
    }
    return {
      query: { ...query, regionId: actor.regionId },
      scope: { branchIds: regionBranchIds, regionId: actor.regionId, canViewRegion: true, canViewAll: false },
    };
  }

  const ownBranch = actor.branchId ?? query.branchId;
  return {
    query: { ...query, branchId: ownBranch },
    scope: {
      branchIds: ownBranch ? [ownBranch] : [],
      regionId: actor.regionId,
      canViewRegion: false,
      canViewAll: false,
    },
  };
}

export function branchWhere(scope: BranchScope, branchId?: string) {
  const ids = branchId ? [branchId] : scope.branchIds;
  if (ids.length === 1) return { branchId: ids[0] };
  if (ids.length > 1) return { branchId: { in: ids } };
  if (scope.regionId) return { regionId: scope.regionId };
  return {};
}
