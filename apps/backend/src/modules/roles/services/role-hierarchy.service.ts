import { ROLE_HIERARCHY } from '../constants/roles.constants.js';
import { rolePermissionRepository } from '../repositories/role-permission.repository.js';
import { roleRepository } from '../repositories/role.repository.js';

export interface ResolvedPermission {
  id: string;
  code: string;
  name: string;
  module: string;
  source: 'direct' | 'inherited';
  inheritedFrom?: string;
}

export const roleHierarchyService = {
  getHierarchy(roleCode: string) {
    return ROLE_HIERARCHY[roleCode] ?? { level: 0, dataScope: 'ASSIGNED' };
  },

  getInheritedRoleCodes(roleCode: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    function walk(code: string) {
      const node = ROLE_HIERARCHY[code];
      if (!node?.inherits) return;
      for (const parent of node.inherits) {
        if (visited.has(parent)) continue;
        visited.add(parent);
        result.push(parent);
        walk(parent);
      }
    }

    walk(roleCode);
    return result;
  },

  compareRoles(roleCodeA: string, roleCodeB: string): number {
    const levelA = ROLE_HIERARCHY[roleCodeA]?.level ?? 0;
    const levelB = ROLE_HIERARCHY[roleCodeB]?.level ?? 0;
    return levelA - levelB;
  },

  canManageRole(actorRoleCodes: string[], targetRoleCode: string): boolean {
    if (actorRoleCodes.includes('SUPER_ADMIN')) return true;
    const actorMax = Math.max(...actorRoleCodes.map((code) => ROLE_HIERARCHY[code]?.level ?? 0));
    const targetLevel = ROLE_HIERARCHY[targetRoleCode]?.level ?? 0;
    return actorMax > targetLevel;
  },
};

export const permissionResolutionService = {
  async resolveForRoleCode(roleCode: string): Promise<ResolvedPermission[]> {
    const role = await roleRepository.findByCode(roleCode);
    if (!role) return [];

    const direct = role.rolePermissions.map((item) => ({
      id: item.permission.id,
      code: item.permission.code,
      name: item.permission.name,
      module: item.permission.module,
      source: 'direct' as const,
    }));

    const inheritedCodes = roleHierarchyService.getInheritedRoleCodes(roleCode);
    const inherited: ResolvedPermission[] = [];

    for (const parentCode of inheritedCodes) {
      const parentRole = await roleRepository.findByCode(parentCode);
      if (!parentRole) continue;

      for (const item of parentRole.rolePermissions) {
        if (direct.some((permission) => permission.code === item.permission.code)) continue;
        if (inherited.some((permission) => permission.code === item.permission.code)) continue;

        inherited.push({
          id: item.permission.id,
          code: item.permission.code,
          name: item.permission.name,
          module: item.permission.module,
          source: 'inherited',
          inheritedFrom: parentCode,
        });
      }
    }

    return [...direct, ...inherited];
  },

  async resolveForRoleId(roleId: string): Promise<ResolvedPermission[]> {
    const role = await roleRepository.findById(roleId);
    if (!role) return [];
    return permissionResolutionService.resolveForRoleCode(role.code);
  },

  async resolvePermissionCodesForRoleId(roleId: string): Promise<string[]> {
    const permissions = await permissionResolutionService.resolveForRoleId(roleId);
    return permissions.map((permission) => permission.code);
  },

  async listDirectPermissions(roleId: string) {
    const items = await rolePermissionRepository.listByRoleId(roleId);
    return items.map((item) => ({
      roleId: item.roleId,
      permissionId: item.permissionId,
      roleCode: item.role.code,
      permissionCode: item.permission.code,
      permissionName: item.permission.name,
      module: item.permission.module,
    }));
  },
};
