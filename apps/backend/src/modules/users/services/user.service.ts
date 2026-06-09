import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { AssignUserRoleInput, CreateUserInput, ListUserRolesQuery, ListUsersQuery, UpdateUserInput } from '@kuberone/shared-validation';

import { RBAC_PERMISSIONS, SUPER_ADMIN_ROLE } from '../../../shared/constants/rbac.constants.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../shared/errors/app-error.js';
import { hashSecret } from '../../../shared/utils/crypto.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { roleRepository } from '../../roles/repositories/role.repository.js';
import { toUserDetail, toUserListItem } from '../dtos/user.dto.js';
import { userRoleRepository } from '../repositories/user-role.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import {
  buildUserListWhere,
  canAccessUser,
  type RequestContext,
  type UserDetail,
} from '../types/users.types.js';

export const userService = {
  async list(actor: AuthenticatedUser, query: ListUsersQuery) {
    const where = buildUserListWhere(actor, query);
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      userRepository.list(where, skip, query.limit, orderBy),
      userRepository.count(where),
    ]);

    return {
      items: items.map(toUserListItem),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  async getById(actor: AuthenticatedUser, id: string): Promise<UserDetail> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }

    const scope = await userRepository.getPrimaryScope(user.id);
    if (!canAccessUser(actor, { id: user.id, ...scope })) {
      throw new ForbiddenError('Insufficient data scope to access this user');
    }

    return toUserDetail(user, scope);
  },

  async create(input: CreateUserInput, ctx: RequestContext): Promise<UserDetail> {
    if (input.email) {
      const existingEmail = await userRepository.findByEmail(input.email);
      if (existingEmail) {
        throw new ConflictError('Email already registered');
      }
    }

    if (input.phone) {
      const existingPhone = await userRepository.findByPhone(input.phone);
      if (existingPhone) {
        throw new ConflictError('Phone already registered');
      }
    }

    const passwordHash = input.password ? await hashSecret(input.password) : undefined;
    const user = await userRepository.create({
      email: input.email,
      phone: input.phone,
      passwordHash,
      userType: input.userType,
      status: input.status,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'USER_CREATED',
      entityType: 'user',
      entityId: user.id,
      newValues: {
        userType: user.userType,
        email: user.email,
        phone: user.phone,
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    const scope = await userRepository.getPrimaryScope(user.id);
    return toUserDetail(user, scope);
  },

  async update(
    actor: AuthenticatedUser,
    id: string,
    input: UpdateUserInput,
    ctx: RequestContext,
  ): Promise<UserDetail> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }

    const scope = await userRepository.getPrimaryScope(user.id);
    if (!canAccessUser(actor, { id: user.id, ...scope })) {
      throw new ForbiddenError('Insufficient data scope to update this user');
    }

    if (input.email && input.email !== user.email) {
      const existingEmail = await userRepository.findByEmail(input.email, id);
      if (existingEmail) {
        throw new ConflictError('Email already registered');
      }
    }

    if (input.phone && input.phone !== user.phone) {
      const existingPhone = await userRepository.findByPhone(input.phone, id);
      if (existingPhone) {
        throw new ConflictError('Phone already registered');
      }
    }

    const passwordHash = input.password ? await hashSecret(input.password) : undefined;
    const updated = await userRepository.update(id, {
      ...input,
      passwordHash,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'USER_UPDATED',
      entityType: 'user',
      entityId: id,
      oldValues: {
        email: user.email,
        phone: user.phone,
        status: user.status,
      },
      newValues: input,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return toUserDetail(updated, scope);
  },

  async remove(actor: AuthenticatedUser, id: string, ctx: RequestContext): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }

    if (user.id === actor.id) {
      throw new ValidationError({ id: ['Cannot delete your own account'] });
    }

    const scope = await userRepository.getPrimaryScope(user.id);
    if (!canAccessUser(actor, { id: user.id, ...scope })) {
      throw new ForbiddenError('Insufficient data scope to delete this user');
    }

    await userRepository.softDelete(id);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'USER_DELETED',
      entityType: 'user',
      entityId: id,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  },

  async listUserRoles(actor: AuthenticatedUser, userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const scope = await userRepository.getPrimaryScope(user.id);
    if (!canAccessUser(actor, { id: user.id, ...scope })) {
      throw new ForbiddenError('Insufficient data scope to access user roles');
    }

    const roles = await userRoleRepository.listByUser(userId);
    return roles.map((item) => ({
      id: item.id,
      userId: item.userId,
      roleId: item.roleId,
      roleCode: item.role.code,
      roleName: item.role.name,
      branchId: item.branchId,
      regionId: item.regionId,
      isPrimary: item.isPrimary,
      createdAt: item.createdAt,
    }));
  },
};

export const userRoleService = {
  async list(actor: AuthenticatedUser, query: ListUserRolesQuery) {
    const where = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.roleId ? { roleId: query.roleId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.regionId ? { regionId: query.regionId } : {}),
    };

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      userRoleRepository.list(where, skip, query.limit),
      userRoleRepository.count(where),
    ]);

    if (query.userId) {
      const user = await userRepository.findById(query.userId);
      if (!user) throw new NotFoundError('User', query.userId);
      const scope = await userRepository.getPrimaryScope(user.id);
      if (!canAccessUser(actor, { id: user.id, ...scope })) {
        throw new ForbiddenError('Insufficient data scope');
      }
    }

    return {
      items: items.map((item) => ({
        id: item.id,
        userId: item.userId,
        roleId: item.roleId,
        roleCode: item.role.code,
        roleName: item.role.name,
        branchId: item.branchId,
        regionId: item.regionId,
        isPrimary: item.isPrimary,
        user: item.user,
        createdAt: item.createdAt,
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  async assign(actor: AuthenticatedUser, input: AssignUserRoleInput, ctx: RequestContext) {
    const user = await userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User', input.userId);
    }

    const role = await roleRepository.findById(input.roleId);
    if (!role) {
      throw new NotFoundError('Role', input.roleId);
    }

    assertRoleAssignmentAllowed(actor, role.code);

    const existing = await userRoleRepository.findByUserAndRole(
      input.userId,
      input.roleId,
      input.branchId,
    );
    if (existing) {
      throw new ConflictError('Role already assigned to user for this scope');
    }

    if (input.isPrimary) {
      await userRoleRepository.clearPrimary(input.userId);
    }

    const assignment = await userRoleRepository.assign(input);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'USER_ROLE_ASSIGNED',
      entityType: 'user_role',
      entityId: assignment.id,
      newValues: {
        userId: input.userId,
        roleId: input.roleId,
        roleCode: role.code,
        branchId: input.branchId,
        regionId: input.regionId,
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return {
      id: assignment.id,
      userId: assignment.userId,
      roleId: assignment.roleId,
      roleCode: assignment.role.code,
      roleName: assignment.role.name,
      branchId: assignment.branchId,
      regionId: assignment.regionId,
      isPrimary: assignment.isPrimary,
      createdAt: assignment.createdAt,
    };
  },

  async remove(actor: AuthenticatedUser, id: string, ctx: RequestContext): Promise<void> {
    const assignment = await userRoleRepository.findById(id);
    if (!assignment) {
      throw new NotFoundError('UserRole', id);
    }

    assertRoleAssignmentAllowed(actor, assignment.role.code);

    await userRoleRepository.remove(id);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'USER_ROLE_REMOVED',
      entityType: 'user_role',
      entityId: id,
      oldValues: {
        userId: assignment.userId,
        roleId: assignment.roleId,
        roleCode: assignment.role.code,
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  },

  async removeByUserAndRole(
    actor: AuthenticatedUser,
    userId: string,
    roleId: string,
    ctx: RequestContext,
  ): Promise<void> {
    const assignment = await userRoleRepository.findByUserAndRole(userId, roleId);
    if (!assignment) {
      throw new NotFoundError('UserRole');
    }

    await userRoleService.remove(actor, assignment.id, ctx);
  },
};

function assertRoleAssignmentAllowed(actor: AuthenticatedUser, roleCode: string): void {
  if (roleCode === SUPER_ADMIN_ROLE && !actor.roles.includes(SUPER_ADMIN_ROLE)) {
    throw new ForbiddenError('Only Super Admin can assign or remove Super Admin role');
  }

  if (actor.roles.includes(SUPER_ADMIN_ROLE)) {
    return;
  }

  if (!actor.permissions?.includes(RBAC_PERMISSIONS.USERS_WRITE)) {
    throw new ForbiddenError('Insufficient permissions to manage user roles');
  }
}
