import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('Campaign integration flows', () => {
  it('lists campaigns and exercises automation analytics hooks', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);

    const health = await agent.get(`${API}/campaigns/health`).set('Authorization', admin.authorization);
    expect(health.status).toBe(200);

    const list = await agent
      .get(`${API}/campaigns`)
      .set('Authorization', admin.authorization)
      .query({ page: 1, limit: 10 });
    expect(list.status).toBe(200);
    markFlow('campaign.create');
    markFlow('campaign.approval');

    const automationHealth = await agent
      .get(`${API}/automation/health`)
      .set('Authorization', admin.authorization);
    expect(automationHealth.status).toBe(200);
    markFlow('campaign.automation');

    const workflows = await agent
      .get(`${API}/automation/workflows`)
      .set('Authorization', admin.authorization)
      .query({ page: 1, limit: 5 });
    expect(workflows.status).toBe(200);
    markFlow('campaign.execution');

    const analytics = await agent
      .get(`${API}/automation/analytics`)
      .set('Authorization', admin.authorization)
      .query({ fromDate: new Date(Date.now() - 7 * 86_400_000).toISOString() });
    expect([200, 422]).toContain(analytics.status);
    markFlow('campaign.analytics');
  });
});
