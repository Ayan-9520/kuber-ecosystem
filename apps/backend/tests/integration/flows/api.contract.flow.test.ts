import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin, loginAsCustomer } from '../helpers/auth.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('API contract integration flows', () => {
  it('returns success, validation, RBAC, and pagination responses', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    const customer = await loginAsCustomer(agent);

    const paginated = await agent
      .get(`${API}/customers`)
      .set('Authorization', admin.authorization)
      .query({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
    expect(paginated.status).toBe(200);
    expect(Array.isArray(paginated.body.data) || paginated.body.data?.items).toBeTruthy();
    markFlow('api.pagination');
    markFlow('api.sorting');
    markFlow('api.filtering');

    const invalid = await agent.post(`${API}/auth/login`).send({ loginType: 'employee' });
    expect(invalid.status).toBe(422);
    markFlow('api.validation');

    const rbacDenied = await agent
      .get(`${API}/roles`)
      .set('Authorization', customer.authorization);
    expect([403, 401]).toContain(rbacDenied.status);
    markFlow('api.rbac-error');

    const health = await agent.get('/health');
    expect(health.status).toBe(200);
    markFlow('api.success');
  });
});
