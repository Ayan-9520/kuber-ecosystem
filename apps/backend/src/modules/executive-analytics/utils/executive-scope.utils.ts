import type { AuthenticatedUser } from '@kuberone/shared-types';
import { DataScope } from '@kuberone/shared-types';
import type { ExecutiveAnalyticsBaseQuery } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { MANAGER_ROLES, ROLE_TO_EXECUTIVE } from '../constants/executive-analytics.constants.js';
import type { ExecutiveRoleType, ExecutiveScope } from '../types/executive-analytics.types.js';

function isManager(actor: AuthenticatedUser): boolean {
  return actor.roles.some((r) => (MANAGER_ROLES as readonly string[]).includes(r));
}

function canViewTeam(actor: AuthenticatedUser): boolean {
  return (
    isManager(actor) ||
    actor.permissions.includes('executive_analytics.team') ||
    actor.permissions.includes('*')
  );
}

function detectExecutiveRole(actor: AuthenticatedUser, override?: ExecutiveRoleType): ExecutiveRoleType | undefined {
  if (override) return override;
  for (const role of actor.roles) {
    const mapped = ROLE_TO_EXECUTIVE[role];
    if (mapped) return mapped;
  }
  return undefined;
}

async function getSubordinateIds(managerEmployeeId: string): Promise<string[]> {
  const direct = await prisma.employee.findMany({
    where: { reportsToId: managerEmployeeId, isActive: true, deletedAt: null },
    select: { id: true },
  });
  const ids = direct.map((e) => e.id);
  if (!ids.length) return [];
  const indirect = await prisma.employee.findMany({
    where: { reportsToId: { in: ids }, isActive: true, deletedAt: null },
    select: { id: true },
  });
  return [...ids, ...indirect.map((e) => e.id)];
}

export async function resolveExecutiveScope(
  actor: AuthenticatedUser,
  query: ExecutiveAnalyticsBaseQuery,
): Promise<{ query: ExecutiveAnalyticsBaseQuery; scope: ExecutiveScope }> {
  const executiveRole = detectExecutiveRole(actor, query.executiveRole as ExecutiveRoleType | undefined);
  const teamAccess = canViewTeam(actor);

  if (actor.roles.includes('SUPER_ADMIN') || actor.roles.includes('ADMIN') || actor.roles.includes('MANAGEMENT')) {
    const employeeIds = query.employeeId ? [query.employeeId] : [];
    return {
      query,
      scope: {
        employeeIds,
        branchId: query.branchId,
        regionId: query.regionId,
        canViewTeam: true,
        executiveRole,
      },
    };
  }

  if (teamAccess && actor.employeeId) {
    const subordinates = await getSubordinateIds(actor.employeeId);
    const allowedIds = [actor.employeeId, ...subordinates];

    if (query.employeeId) {
      if (!allowedIds.includes(query.employeeId)) {
        return {
          query: { ...query, employeeId: actor.employeeId },
          scope: { employeeIds: [actor.employeeId], canViewTeam: false, executiveRole },
        };
      }
      return {
        query,
        scope: { employeeIds: [query.employeeId], canViewTeam: true, executiveRole, branchId: query.branchId, regionId: query.regionId },
      };
    }

    let branchId = query.branchId;
    let regionId = query.regionId;
    if (actor.dataScope === DataScope.BRANCH && actor.branchId) branchId = actor.branchId;
    if (actor.dataScope === DataScope.REGION && actor.regionId) regionId = actor.regionId;

    return {
      query: { ...query, branchId, regionId },
      scope: { employeeIds: allowedIds, branchId, regionId, canViewTeam: true, executiveRole },
    };
  }

  const ownId = actor.employeeId;
  return {
    query: { ...query, employeeId: ownId ?? query.employeeId },
    scope: {
      employeeIds: ownId ? [ownId] : [],
      branchId: actor.branchId,
      regionId: actor.regionId,
      canViewTeam: false,
      executiveRole,
    },
  };
}
