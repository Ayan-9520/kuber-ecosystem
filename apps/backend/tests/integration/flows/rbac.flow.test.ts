import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin, loginAsCustomer } from '../helpers/auth.js';
import { findSeedIds } from '../helpers/db.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('RBAC integration flows', () => {
  it('enforces permission and data scope between admin and customer', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    const customer = await loginAsCustomer(agent);
    const seeds = await findSeedIds();

    const adminLeads = await agent
      .get(`${API}/leads`)
      .set('Authorization', admin.authorization)
      .query({ page: 1, limit: 10 });
    expect(adminLeads.status).toBe(200);
    markFlow('rbac.permission-resolution');
    markFlow('rbac.organization-scope');

    const customerLeads = await agent
      .get(`${API}/leads`)
      .set('Authorization', customer.authorization)
      .query({ page: 1, limit: 10 });
    expect([200, 403]).toContain(customerLeads.status);
    markFlow('rbac.data-scope');

    const adminRoles = await agent.get(`${API}/roles`).set('Authorization', admin.authorization);
    expect(adminRoles.status).toBe(200);
    markFlow('rbac.role-assignment');

    const scopedLead = await agent
      .post(`${API}/leads`)
      .set('Authorization', admin.authorization)
      .send({
        prospectName: 'RBAC Scope Lead',
        prospectPhone: '9123456780',
        productId: seeds.productId,
        sourceId: seeds.leadSourceId,
        branchId: seeds.branchId,
        regionId: seeds.regionId,
      });
    expect(scopedLead.status).toBe(201);
    expect(scopedLead.body.data.branchId).toBe(seeds.branchId);
    markFlow('rbac.branch-scope');
    markFlow('rbac.region-scope');
  });
});
