import { DataScope, UserType } from '@kuberone/shared-types';

import { ForbiddenError } from '../../../src/shared/errors/app-error.js';
import { assertCustomerAccess } from '../../../src/shared/utils/customer-scope.js';
import { buildUser } from '@kuberone/test-utils';

describe('customer scope', () => {
  const customer = { id: 'cust-1', userId: 'user-cust', branchId: 'branch-1', rmEmployeeId: 'emp-1' };

  it('allows customer to access own record', () => {
    const actor = buildUser({
      userType: UserType.CUSTOMER,
      customerId: 'cust-1',
      id: 'user-cust',
      roles: ['CUSTOMER'],
      dataScope: DataScope.OWN,
    });
    expect(() => assertCustomerAccess(actor, customer)).not.toThrow();
  });

  it('denies customer access to other records', () => {
    const actor = buildUser({
      userType: UserType.CUSTOMER,
      customerId: 'cust-2',
      id: 'user-other',
      roles: ['CUSTOMER'],
      dataScope: DataScope.OWN,
    });
    expect(() => assertCustomerAccess(actor, customer)).toThrow(ForbiddenError);
  });

  it('allows org-wide employee access', () => {
    const actor = buildUser({ dataScope: DataScope.ORGANIZATION, roles: ['ADMIN'] });
    expect(() => assertCustomerAccess(actor, customer)).not.toThrow();
  });

  it('denies branch mismatch', () => {
    const actor = buildUser({
      dataScope: DataScope.BRANCH,
      branchId: 'branch-99',
      roles: ['RM'],
    });
    expect(() => assertCustomerAccess(actor, customer)).toThrow(ForbiddenError);
  });
});
