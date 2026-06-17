import { DataScope, UserType } from '@kuberone/shared-types';

import {
  applyApplicationScope,
  applyCommissionScope,
  applyDocumentScope,
  applyLeadScope,
  applyTicketScope,
} from '../../../src/shared/utils/data-scope.js';
import { buildUser } from '@kuberone/test-utils';

describe('data scope filters', () => {
  it('admin sees all leads', () => {
    const actor = buildUser({ roles: ['ADMIN'], dataScope: DataScope.ORGANIZATION });
    expect(applyLeadScope(actor, {})).toEqual({});
  });

  it('partner scoped to partnerId', () => {
    const actor = buildUser({
      userType: UserType.PARTNER,
      partnerId: 'partner-1',
      roles: ['PARTNER'],
      dataScope: DataScope.OWN,
    });
    expect(applyLeadScope(actor, {})).toEqual({ partnerId: 'partner-1' });
  });

  it('branch scope filters leads by branchId', () => {
    const actor = buildUser({ dataScope: DataScope.BRANCH, branchId: 'branch-2', roles: ['SALES'] });
    expect(applyLeadScope(actor, {})).toEqual({ branchId: 'branch-2' });
  });

  it('region scope filters applications', () => {
    const actor = buildUser({ dataScope: DataScope.REGION, regionId: 'region-3', roles: ['RM'] });
    expect(applyApplicationScope(actor, {})).toEqual({ regionId: 'region-3' });
  });

  it('customer scoped to own applications', () => {
    const actor = buildUser({
      userType: UserType.CUSTOMER,
      customerId: 'cust-1',
      roles: ['CUSTOMER'],
      dataScope: DataScope.OWN,
    });
    expect(applyApplicationScope(actor, {})).toEqual({ customerId: 'cust-1' });
  });

  it('assigned scope uses employee id for leads', () => {
    const actor = buildUser({
      dataScope: DataScope.ASSIGNED,
      employeeId: 'emp-9',
      roles: ['SALES'],
    });
    expect(applyLeadScope(actor, {})).toEqual({ assignedToId: { in: ['emp-9'] } });
  });

  it('partner commission scope', () => {
    const actor = buildUser({
      userType: UserType.PARTNER,
      partnerId: 'p-1',
      roles: ['PARTNER'],
      dataScope: DataScope.OWN,
    });
    expect(applyCommissionScope(actor, {})).toEqual({ partnerId: 'p-1' });
  });

  it('customer document scope', () => {
    const actor = buildUser({
      userType: UserType.CUSTOMER,
      customerId: 'cust-1',
      roles: ['CUSTOMER'],
      dataScope: DataScope.OWN,
    });
    expect(applyDocumentScope(actor, {})).toEqual({ customerId: 'cust-1' });
  });

  it('ticket branch scope', () => {
    const actor = buildUser({ dataScope: DataScope.BRANCH, branchId: 'b-5', roles: ['OPS'] });
    expect(applyTicketScope(actor, {})).toEqual({ branchId: 'b-5' });
  });
});
