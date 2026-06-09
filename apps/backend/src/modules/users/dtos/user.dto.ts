import type { UserWithRoles } from '../repositories/user.repository.js';
import type { UserDetail, UserListItem } from '../types/users.types.js';

export function toUserListItem(user: UserWithRoles): UserListItem {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    userType: user.userType,
    status: user.status,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles: user.userRoles.map((userRole) => ({
      id: userRole.id,
      roleId: userRole.roleId,
      roleCode: userRole.role.code,
      roleName: userRole.role.name,
      branchId: userRole.branchId,
      regionId: userRole.regionId,
      isPrimary: userRole.isPrimary,
    })),
  };
}

export function toUserDetail(
  user: UserWithRoles,
  scope?: { branchId?: string | null; regionId?: string | null },
): UserDetail {
  return {
    ...toUserListItem(user),
    branchId: scope?.branchId ?? undefined,
    regionId: scope?.regionId ?? undefined,
  };
}
