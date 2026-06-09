import { ROLE_HIERARCHY } from '../constants/roles.constants.js';
import type { RoleWithPermissions } from '../repositories/role.repository.js';
import type { RoleDetail, RoleListItem } from '../types/roles.types.js';

export function toRoleListItem(role: RoleWithPermissions & { _count?: { rolePermissions: number } }): RoleListItem {
  const hierarchy = ROLE_HIERARCHY[role.code];
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    hierarchyLevel: hierarchy?.level,
    dataScope: hierarchy?.dataScope,
    parentRoleCodes: hierarchy?.inherits,
    permissionCount: role._count?.rolePermissions ?? role.rolePermissions.length,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

export type RoleDetailDto = RoleDetail;
