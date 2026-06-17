import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin, loginAsCustomer, refreshSession } from '../helpers/auth.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('Auth integration flows', () => {
  it('runs OTP send and verify login for customer', async () => {
    const agent = await getAgent();
    const session = await loginAsCustomer(agent);
    markFlow('auth.send-otp');
    markFlow('auth.verify-otp');

    const me = await agent.get(`${API}/auth/me`).set('Authorization', session.authorization);
    expect(me.status).toBe(200);
    expect(me.body.data.phone).toBe('9876543210');
    markFlow('auth.session-validation');
  });

  it('runs employee login, refresh, logout, and logout-all', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    markFlow('auth.login');

    const refreshed = await refreshSession(agent, admin.refreshToken);
    markFlow('auth.refresh');

    const logoutRes = await agent
      .post(`${API}/auth/logout`)
      .set('Authorization', refreshed.authorization)
      .send({ refreshToken: refreshed.refreshToken });
    expect(logoutRes.status).toBe(204);
    markFlow('auth.logout');

    const admin2 = await loginAsAdmin(agent);
    const logoutAll = await agent
      .post(`${API}/auth/logout-all`)
      .set('Authorization', admin2.authorization);
    expect(logoutAll.status).toBe(204);
    markFlow('auth.logout-all');

    const meAfter = await agent.get(`${API}/auth/me`).set('Authorization', admin2.authorization);
    expect(meAfter.status).toBe(401);
  });
});
