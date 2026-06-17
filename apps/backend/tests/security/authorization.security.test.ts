import { DataScope, UserType } from '@kuberone/shared-types';

import { ForbiddenError } from '../../src/shared/errors/app-error.js';
import {
  dataScopeMiddleware,
  permissionMiddleware,
  roleMiddleware,
} from '../../src/shared/middleware/authorize.middleware.js';
import { createMockNext, createMockRequest, createMockResponse, withUser } from '../helpers/mock-request.js';

describe('Security — Authorization', () => {
  const res = createMockResponse();
  const next = createMockNext();

  beforeEach(() => jest.clearAllMocks());

  it('blocks unauthenticated permission escalation', () => {
    permissionMiddleware('users.write')(createMockRequest(), res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('blocks horizontal privilege escalation (missing permission)', () => {
    const req = withUser({
      id: 'sales-user',
      userType: UserType.EMPLOYEE,
      roles: ['SALES'],
      permissions: ['leads.read'],
      dataScope: DataScope.BRANCH,
      branchId: 'b1',
    });
    permissionMiddleware('users.write')(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('blocks vertical privilege escalation (role mismatch)', () => {
    const req = withUser({
      id: 'rm-user',
      userType: UserType.EMPLOYEE,
      roles: ['RM'],
      permissions: ['leads.read'],
      dataScope: DataScope.BRANCH,
      branchId: 'b1',
    });
    roleMiddleware('ADMIN')(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('blocks branch scope bypass (requires ORGANIZATION, user has BRANCH)', () => {
    const req = withUser({
      id: 'branch-user',
      userType: UserType.EMPLOYEE,
      roles: ['RM'],
      permissions: ['leads.read'],
      dataScope: DataScope.BRANCH,
      branchId: 'b1',
    });
    dataScopeMiddleware('ORGANIZATION')(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('blocks region scope bypass', () => {
    const req = withUser({
      id: 'branch-only',
      userType: UserType.EMPLOYEE,
      roles: ['RM'],
      permissions: ['analytics.read'],
      dataScope: DataScope.BRANCH,
      branchId: 'b1',
      regionId: 'r1',
    });
    dataScopeMiddleware('REGION')(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('allows management scope when user has ORGANIZATION data scope', () => {
    const req = withUser({
      id: 'admin',
      userType: UserType.ADMIN,
      roles: ['ADMIN'],
      permissions: ['users.read'],
      dataScope: DataScope.ORGANIZATION,
    });
    dataScopeMiddleware('ORGANIZATION')(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('grants access when permission matches (no escalation)', () => {
    const req = withUser({
      id: 'reader',
      userType: UserType.EMPLOYEE,
      roles: ['SALES'],
      permissions: ['leads.read', 'leads.write'],
      dataScope: DataScope.BRANCH,
      branchId: 'b1',
    });
    permissionMiddleware('leads.read')(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
