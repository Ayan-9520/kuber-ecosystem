import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { CreatePermissionInput, ListPermissionsQuery, UpdatePermissionInput } from '@kuberone/shared-validation';

import { RBAC_PERMISSIONS, SUPER_ADMIN_ROLE } from '../../../shared/constants/rbac.constants.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { permissionRepository } from '../repositories/permission.repository.js';
import type { PermissionDetail, PermissionListItem, RequestContext } from '../types/permissions.types.js';

export const permissionService = {
  async list(query: ListPermissionsQuery) {
    const where = {
      ...(query.module ? { module: query.module } : {}),
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
      permissionRepository.list(where, skip, query.limit),
      permissionRepository.count(where),
    ]);

    return {
      items: items.map(toPermissionListItem),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  async getById(id: string): Promise<PermissionDetail> {
    const permission = await permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundError('Permission', id);
    }

    return {
      ...toPermissionListItem(permission),
      roles: permission.rolePermissions.map((item) => ({
        roleId: item.roleId,
        roleCode: item.role.code,
        roleName: item.role.name,
      })),
    };
  },

  async create(actor: AuthenticatedUser, input: CreatePermissionInput, ctx: RequestContext) {
    assertPermissionManagementAllowed(actor);

    const existing = await permissionRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictError('Permission code already exists');
    }

    const permission = await permissionRepository.create(input);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'PERMISSION_CREATED',
      entityType: 'permission',
      entityId: permission.id,
      newValues: { code: permission.code, module: permission.module },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return toPermissionListItem(permission);
  },

  async update(
    actor: AuthenticatedUser,
    id: string,
    input: UpdatePermissionInput,
    ctx: RequestContext,
  ) {
    assertPermissionManagementAllowed(actor);

    const permission = await permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundError('Permission', id);
    }

    const updated = await permissionRepository.update(id, input);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'PERMISSION_UPDATED',
      entityType: 'permission',
      entityId: id,
      newValues: input,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return toPermissionListItem(updated);
  },

  async remove(actor: AuthenticatedUser, id: string, ctx: RequestContext): Promise<void> {
    assertPermissionManagementAllowed(actor);

    const permission = await permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundError('Permission', id);
    }

    await permissionRepository.delete(id);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'PERMISSION_DELETED',
      entityType: 'permission',
      entityId: id,
      oldValues: { code: permission.code },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  },
};

function toPermissionListItem(permission: {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string | null;
  createdAt: Date;
}): PermissionListItem {
  return {
    id: permission.id,
    code: permission.code,
    name: permission.name,
    module: permission.module,
    description: permission.description,
    createdAt: permission.createdAt,
  };
}

function assertPermissionManagementAllowed(actor: AuthenticatedUser): void {
  if (actor.roles.includes(SUPER_ADMIN_ROLE)) return;
  const allowed = [
    RBAC_PERMISSIONS.PERMISSIONS_WRITE,
    RBAC_PERMISSIONS.RBAC_CONFIGURE,
    'rbac.configure:all',
  ];
  if (!allowed.some((permission) => actor.permissions?.includes(permission))) {
    throw new ForbiddenError('Insufficient permissions to manage permissions');
  }
}
