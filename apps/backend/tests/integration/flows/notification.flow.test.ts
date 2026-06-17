import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { getDemoCustomer } from '../helpers/db.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('Notification integration flows', () => {
  it('sends email, SMS, WhatsApp, push, and in-app notifications via mock providers', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    const { user } = await getDemoCustomer();

    const emailRes = await agent
      .post(`${API}/email/send`)
      .set('Authorization', admin.authorization)
      .send({
        userId: user.id,
        toEmail: 'customer@integration.test',
        subject: 'Integration Email',
        body: 'Integration test email body',
        eventType: 'APPLICATION_SUBMITTED',
      });
    expect([200, 201]).toContain(emailRes.status);
    markFlow('notification.email');

    const smsRes = await agent
      .post(`${API}/sms/send`)
      .set('Authorization', admin.authorization)
      .send({
        userId: user.id,
        toPhone: user.phone!,
        body: 'Integration SMS test',
        eventType: 'APPLICATION_SUBMITTED',
      });
    expect([200, 201]).toContain(smsRes.status);
    markFlow('notification.sms');

    const waRes = await agent
      .post(`${API}/whatsapp/send`)
      .set('Authorization', admin.authorization)
      .send({
        userId: user.id,
        toPhone: user.phone!,
        body: 'Integration WhatsApp test',
        eventType: 'APPLICATION_SUBMITTED',
      });
    expect([200, 201]).toContain(waRes.status);
    markFlow('notification.whatsapp');

    const pushRes = await agent
      .post(`${API}/push/send`)
      .set('Authorization', admin.authorization)
      .send({
        userId: user.id,
        title: 'Integration Push',
        body: 'Integration push notification',
        eventType: 'APPLICATION_SUBMITTED',
      });
    expect([200, 201]).toContain(pushRes.status);
    markFlow('notification.push');

    const inAppRes = await agent
      .post(`${API}/notifications/send`)
      .set('Authorization', admin.authorization)
      .send({
        userId: user.id,
        eventType: 'APPLICATION_SUBMITTED',
        channels: ['IN_APP'],
        title: 'Integration In-App',
        body: 'Integration in-app notification',
      });
    expect([200, 201]).toContain(inAppRes.status);
    markFlow('notification.in-app');
  });
});
