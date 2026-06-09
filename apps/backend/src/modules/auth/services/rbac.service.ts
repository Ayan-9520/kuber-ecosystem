import { DataScope, UserType } from '@kuberone/shared-types';

import {
  ASSIGNED_SCOPE_ROLES,
  BRANCH_SCOPE_ROLES,
  ORGANIZATION_SCOPE_ROLES,
  REGION_SCOPE_ROLES,
} from '../constants/auth.constants.js';
import { rbacRepository } from '../repositories/rbac.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import type { AuthContext } from '../types/auth.types.js';

export const rbacService = {
  async resolveAuthContext(userId: string): Promise<AuthContext> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const userRoles = await rbacRepository.getUserRolesWithPermissions(userId);
    const roles = [...new Set(userRoles.map((ur) => ur.role.code))];
    const permissions = [
      ...new Set(
        userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.code),
        ),
      ),
    ];

    const primaryRole =
      userRoles.find((ur) => ur.isPrimary) ?? userRoles[0];

    let branchId = primaryRole?.branchId ?? undefined;
    let regionId = primaryRole?.regionId ?? undefined;
    let employeeId: string | undefined;
    let customerId: string | undefined;
    let partnerId: string | undefined;

    const userType = user.userType as UserType;

    if (userType === UserType.EMPLOYEE || userType === UserType.ADMIN) {
      const employee = await userRepository.findEmployeeByUserId(userId);
      if (employee) {
        employeeId = employee.id;
        branchId = branchId ?? employee.branchId;
        regionId = regionId ?? employee.branch.regionId;
      }
    }

    if (userType === UserType.CUSTOMER) {
      const customer = await userRepository.findCustomerByUserId(userId);
      customerId = customer?.id;
      branchId = branchId ?? customer?.branchId ?? undefined;
    }

    if (userType === UserType.PARTNER) {
      const partner = await userRepository.findPartnerByUserId(userId);
      partnerId = partner?.id;
    }

    const dataScope = resolveDataScope(userType, roles, { branchId, regionId });

    return {
      userId: user.id,
      userType,
      email: user.email,
      phone: user.phone,
      roles,
      permissions,
      dataScope,
      branchId: branchId ?? undefined,
      regionId: regionId ?? undefined,
      employeeId,
      customerId,
      partnerId,
    };
  },
};

function resolveDataScope(
  userType: UserType,
  roles: string[],
  scopeIds: { branchId?: string; regionId?: string },
): DataScope {
  if (userType === UserType.CUSTOMER || userType === UserType.PARTNER) {
    return DataScope.OWN;
  }

  if (roles.some((role) => ORGANIZATION_SCOPE_ROLES.has(role))) {
    return DataScope.ORGANIZATION;
  }

  if (roles.some((role) => REGION_SCOPE_ROLES.has(role)) && scopeIds.regionId) {
    return DataScope.REGION;
  }

  if (roles.some((role) => BRANCH_SCOPE_ROLES.has(role)) && scopeIds.branchId) {
    return DataScope.BRANCH;
  }

  if (roles.some((role) => ASSIGNED_SCOPE_ROLES.has(role))) {
    return DataScope.ASSIGNED;
  }

  if (scopeIds.branchId) {
    return DataScope.BRANCH;
  }

  if (scopeIds.regionId) {
    return DataScope.REGION;
  }

  return DataScope.ASSIGNED;
}
