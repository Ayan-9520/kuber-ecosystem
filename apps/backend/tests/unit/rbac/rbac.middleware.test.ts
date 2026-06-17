import { DataScope, UserType } from '@kuberone/shared-types';

import { ForbiddenError } from '../../../src/shared/errors/app-error.js';
import { requireAnyPermission, requirePermissions } from '../../../src/shared/middleware/rbac.middleware.js';
import { createMockNext, createMockRequest, createMockResponse, withUser } from '../../helpers/mock-request.js';

describe('rbac middleware', () => {
  const res = createMockResponse();
  const next = createMockNext();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requirePermissions', () => {
    it('allows super admin bypass', () => {
      const req = withUser({
        id: '1',
        userType: UserType.ADMIN,
        roles: ['SUPER_ADMIN'],
        permissions: [],
        dataScope: DataScope.ORGANIZATION,
      });
      requirePermissions('leads.write')(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('denies without required permission', () => {
      const req = withUser({
        id: '1',
        userType: UserType.EMPLOYEE,
        roles: ['SALES'],
        permissions: ['leads.read'],
        dataScope: DataScope.BRANCH,
        branchId: 'b1',
      });
      requirePermissions('leads.write')(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('allows with required permission', () => {
      const req = withUser({
        id: '1',
        userType: UserType.EMPLOYEE,
        roles: ['SALES'],
        permissions: ['leads.read', 'leads.write'],
        dataScope: DataScope.BRANCH,
        branchId: 'b1',
      });
      requirePermissions('leads.write')(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('requireAnyPermission', () => {
    it('requires authentication', () => {
      requireAnyPermission('leads.read')(createMockRequest(), res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('allows any matching permission', () => {
      const req = withUser({
        id: '1',
        userType: UserType.EMPLOYEE,
        roles: ['SALES'],
        permissions: ['analytics.read'],
        dataScope: DataScope.REGION,
        regionId: 'r1',
      });
      requireAnyPermission('analytics.read', 'analytics.export')(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });
  });
});
