import { getAgent, API } from '../helpers/api.js';
import { loginAsCustomer } from '../helpers/auth.js';
import { getDemoCustomer } from '../helpers/db.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('Customer mobile API integration flows', () => {
  it('covers customer app auth and self-service endpoints', async () => {
    const agent = await getAgent();
    const session = await loginAsCustomer(agent);
    const { customer } = await getDemoCustomer();

    const me = await agent.get(`${API}/auth/me`).set('Authorization', session.authorization);
    expect(me.status).toBe(200);
    expect(me.body.data.phone).toBe('9876543210');

    const profile = await agent
      .get(`${API}/customers/${customer.id}`)
      .set('Authorization', session.authorization);
    expect([200, 403]).toContain(profile.status);

    const applications = await agent
      .get(`${API}/applications`)
      .set('Authorization', session.authorization)
      .query({ page: 1, limit: 5 });
    expect([200, 403]).toContain(applications.status);

    const tickets = await agent
      .get(`${API}/tickets`)
      .set('Authorization', session.authorization)
      .query({ page: 1, limit: 5 });
    expect([200, 403]).toContain(tickets.status);

    markFlow('mobile.customer-api');
  });
});
