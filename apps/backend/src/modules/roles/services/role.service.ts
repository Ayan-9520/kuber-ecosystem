import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  AssignRolePermissionInput,
  CreateRoleInput,
  ListRolePermissionsQuery,
  ListRolesQuery,
  RemoveRolePermissionInput,
  UpdateRoleInput,
} from '@kuberone/shared-validation';

import { RBAC_PERMISSIONS, SUPER_ADMIN_ROLE } from '../../../shared/constants/rbac.constants.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { permissionRepository } from '../../permissions/repositories/permission.repository.js';
import { PROTECTED_SYSTEM_ROLES, ROLE_HIERARCHY } from '../constants/roles.constants.js';
import { rolePermissionRepository } from '../repositories/role-permission.repository.js';
import { roleRepository } from '../repositories/role.repository.js';
import type { RequestContext, RoleDetail, RoleListItem } from '../types/roles.types.js';

import {
  permissionResolutionService,
  roleHierarchyService,
} from './role-hierarchy.service.js';

export const roleService = {
  async list(query: ListRolesQuery) {
    const where = {
      ...(query.isSystem !== undefined ? { isSystem: query.isSystem } : {}),
      ...(query.search
        ? {
            OR: [
              { code: { contains: query.search } },
              { name: { contains: query.search } },
            ],
          }
        : {}),
    };

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      roleRepository.list(where, skip, query.limit),
      roleRepository.count(where),
    ]);

    return {
      items: items.map(toRoleListItem),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  async getById(id: string): Promise<RoleDetail> {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError('Role', id);
    }

    const effectivePermissions = await permissionResolutionService.resolveForRoleCode(role.code);

    return {
      ...toRoleListItem(role),
      permissions: role.rolePermissions.map((item) => ({
        id: item.permission.id,
        code: item.permission.code,
        name: item.permission.name,
        module: item.permission.module,
      })),
      effectivePermissions,
    };
  },

  async create(actor: AuthenticatedUser, input: CreateRoleInput, ctx: RequestContext): Promise<RoleDetail> {
    assertRoleManagementAllowed(actor);

    const existing = await roleRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictError('Role code already exists');
    }

    if (input.parentRoleCode && !ROLE_HIERARCHY[input.parentRoleCode]) {
      throw new ValidationError({ parentRoleCode: ['Unknown parent role code'] });
    }

    const role = await roleRepository.create(input);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'ROLE_CREATED',
      entityType: 'role',
      entityId: role.id,
      newValues: { code: role.code, name: role.name },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return roleService.getById(role.id);
  },

  async update(
    actor: AuthenticatedUser,
    id: string,
    input: UpdateRoleInput,
    ctx: RequestContext,
  ): Promise<RoleDetail> {
    assertRoleManagementAllowed(actor);

    const role = await roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError('Role', id);
    }

    if (role.isSystem && PROTECTED_SYSTEM_ROLES.has(role.code) && !actor.roles.includes(SUPER_ADMIN_ROLE)) {
      throw new ForbiddenError('System roles can only be modified by Super Admin');
    }

    await roleRepository.update(id, input);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'ROLE_UPDATED',
      entityType: 'role',
      entityId: id,
      newValues: input,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return roleService.getById(id);
  },

  async remove(actor: AuthenticatedUser, id: string, ctx: RequestContext): Promise<void> {
    assertRoleManagementAllowed(actor);

    const role = await roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError('Role', id);
    }

    if (role.isSystem) {
      throw new ForbiddenError('System roles cannot be deleted');
    }

    await roleRepository.delete(id);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'ROLE_DELETED',
      entityType: 'role',
      entityId: id,
      oldValues: { code: role.code, name: role.name },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  },
};

export const rolePermissionService = {
  async list(query: ListRolePermissionsQuery) {
    const where = {
      ...(query.roleId ? { roleId: query.roleId } : {}),
      ...(query.permissionId ? { permissionId: query.permissionId } : {}),
      ...(query.module ? { permission: { module: query.module } } : {}),
    };

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      rolePermissionRepository.list(where, skip, query.limit),
      rolePermissionRepository.count(where),
    ]);

    return {
      items: items.map((item) => ({
        roleId: item.roleId,
        permissionId: item.permissionId,
        roleCode: item.role.code,
        roleName: item.role.name,
        permissionCode: item.permission.code,
        permissionName: item.permission.name,
        module: item.permission.module,
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  async assign(actor: AuthenticatedUser, input: AssignRolePermissionInput, ctx: RequestContext) {
    assertRbacConfigureAllowed(actor);

    const role = await roleRepository.findById(input.roleId);
    if (!role) throw new NotFoundError('Role', input.roleId);

    const permission = await permissionRepository.findById(input.permissionId);
    if (!permission) throw new NotFoundError('Permission', input.permissionId);

    if (role.code === SUPER_ADMIN_ROLE && !actor.roles.includes(SUPER_ADMIN_ROLE)) {
      throw new ForbiddenError('Only Super Admin can modify Super Admin permissions');
    }

    const existing = await rolePermissionRepository.find(input.roleId, input.permissionId);
    if (existing) {
      throw new ConflictError('Permission already assigned to role');
    }

    const assignment = await rolePermissionRepository.assign(input);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'ROLE_PERMISSION_ASSIGNED',
      entityType: 'role_permission',
      entityId: `${input.roleId}:${input.permissionId}`,
      newValues: {
        roleCode: role.code,
        permissionCode: permission.code,
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return {
      roleId: assignment.roleId,
      permissionId: assignment.permissionId,
      roleCode: assignment.role.code,
      permissionCode: assignment.permission.code,
    };
  },

  async remove(actor: AuthenticatedUser, input: RemoveRolePermissionInput, ctx: RequestContext): Promise<void> {
    assertRbacConfigureAllowed(actor);

    const role = await roleRepository.findById(input.roleId);
    if (!role) throw new NotFoundError('Role', input.roleId);

    if (role.code === SUPER_ADMIN_ROLE && !actor.roles.includes(SUPER_ADMIN_ROLE)) {
      throw new ForbiddenError('Only Super Admin can modify Super Admin permissions');
    }

    const existing = await rolePermissionRepository.find(input.roleId, input.permissionId);
    if (!existing) {
      throw new NotFoundError('RolePermission');
    }

    await rolePermissionRepository.remove(input.roleId, input.permissionId);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'ROLE_PERMISSION_REMOVED',
      entityType: 'role_permission',
      entityId: `${input.roleId}:${input.permissionId}`,
      oldValues: {
        roleCode: existing.role.code,
        permissionCode: existing.permission.code,
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  },

  async replacePermissions(
    actor: AuthenticatedUser,
    roleId: string,
    permissionIds: string[],
    ctx: RequestContext,
  ) {
    assertRbacConfigureAllowed(actor);

    const role = await roleRepository.findById(roleId);
    if (!role) throw new NotFoundError('Role', roleId);

    if (role.code === SUPER_ADMIN_ROLE && !actor.roles.includes(SUPER_ADMIN_ROLE)) {
      throw new ForbiddenError('Only Super Admin can modify Super Admin permissions');
    }

    await rolePermissionRepository.replaceForRole(roleId, permissionIds);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'ROLE_PERMISSIONS_REPLACED',
      entityType: 'role',
      entityId: roleId,
      newValues: { permissionIds },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return roleService.getById(roleId);
  },
};

function toRoleListItem(
  role: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    rolePermissions?: Array<unknown>;
    _count?: { rolePermissions: number };
  },
): RoleListItem {
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
    permissionCount: role._count?.rolePermissions ?? role.rolePermissions?.length ?? 0,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

function assertRoleManagementAllowed(actor: AuthenticatedUser): void {
  if (actor.roles.includes(SUPER_ADMIN_ROLE)) return;
  const allowed = [RBAC_PERMISSIONS.ROLES_WRITE, RBAC_PERMISSIONS.RBAC_CONFIGURE, 'rbac.configure:all'];
  if (!allowed.some((permission) => actor.permissions?.includes(permission))) {
    throw new ForbiddenError('Insufficient permissions to manage roles');
  }
}

function assertRbacConfigureAllowed(actor: AuthenticatedUser): void {
  if (actor.roles.includes(SUPER_ADMIN_ROLE)) return;
  const allowed = [RBAC_PERMISSIONS.RBAC_CONFIGURE, RBAC_PERMISSIONS.ROLES_WRITE, 'rbac.configure:all'];
  if (!allowed.some((permission) => actor.permissions?.includes(permission))) {
    throw new ForbiddenError('Insufficient permissions to configure RBAC');
  }
}

export { roleHierarchyService, permissionResolutionService };
