import { DataScope, UserType } from '@kuberone/shared-types';

import { ForbiddenError } from '../../../src/shared/errors/app-error.js';
import {
  dataScopeMiddleware,
  permissionMiddleware,
  roleMiddleware,
} from '../../../src/shared/middleware/authorize.middleware.js';
import { createMockNext, createMockRequest, createMockResponse, withUser } from '../../helpers/mock-request.js';

describe('authorize middleware', () => {
  const res = createMockResponse();
  const next = createMockNext();

  beforeEach(() => jest.clearAllMocks());

  it('permissionMiddleware requires auth', () => {
    permissionMiddleware('users.read')(createMockRequest(), res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('roleMiddleware allows matching role', () => {
    const req = withUser({
      id: '1',
      userType: UserType.ADMIN,
      roles: ['ADMIN', 'SALES'],
      permissions: [],
      dataScope: DataScope.ORGANIZATION,
    });
    roleMiddleware('ADMIN')(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('roleMiddleware rejects missing role', () => {
    const req = withUser({
      id: '1',
      userType: UserType.EMPLOYEE,
      roles: ['SALES'],
      permissions: [],
      dataScope: DataScope.BRANCH,
      branchId: 'b1',
    });
    roleMiddleware('ADMIN')(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('dataScopeMiddleware sets scope and validates minimum', () => {
    const req = withUser({
      id: '1',
      userType: UserType.EMPLOYEE,
      roles: ['RM'],
      permissions: [],
      dataScope: DataScope.BRANCH,
      branchId: 'b1',
    });
    dataScopeMiddleware('BRANCH')(req, res, next);
    expect(req.dataScope).toBe(DataScope.BRANCH);
    expect(next).toHaveBeenCalledWith();
  });

  it('dataScopeMiddleware rejects insufficient scope', () => {
    const req = withUser({
      id: '1',
      userType: UserType.EMPLOYEE,
      roles: ['RM'],
      permissions: [],
      dataScope: DataScope.OWN,
    });
    dataScopeMiddleware('ORGANIZATION')(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });
});
