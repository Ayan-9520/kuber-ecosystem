import type { AuthenticatedUser, JwtPayload } from '@kuberone/shared-types';
import { DataScope, UserType, UserStatus } from '@kuberone/shared-types';

let seq = 1;

export function buildUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  const id = overrides.id ?? `user-${seq++}`;
  return {
    id,
    sub: id,
    sessionId: 'session-test-1',
    userType: UserType.EMPLOYEE,
    email: 'employee@kuberone.com',
    phone: '9876543210',
    roles: ['SALES_EXECUTIVE'],
    permissions: ['leads.read', 'leads.write'],
    dataScope: DataScope.BRANCH,
    branchId: 'branch-1',
    regionId: 'region-1',
    employeeId: 'emp-1',
    ...overrides,
  };
}

export function buildJwtPayload(overrides: Partial<JwtPayload> = {}): JwtPayload {
  const user = buildUser();
  return {
    sub: user.id,
    userType: user.userType,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
    permissions: user.permissions,
    dataScope: user.dataScope,
    sessionId: 'session-1',
    branchId: user.branchId,
    regionId: user.regionId,
    employeeId: user.employeeId,
    ...overrides,
  };
}

export function buildDbUser(overrides: Record<string, unknown> = {}) {
  return {
    id: `user-${seq++}`,
    email: 'admin@kuberone.com',
    phone: '9876543210',
    passwordHash: '$2a$10$mockhashmockhashmockhashmockhashmock',
    userType: UserType.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
