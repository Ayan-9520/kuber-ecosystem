import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { findSeedIds, getDemoCustomer } from '../helpers/db.js';
import { getAdminEmployee } from '../helpers/fixtures.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('Support integration flows', () => {
  it('creates, assigns, escalates, resolves, and closes a ticket', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    const seeds = await findSeedIds();
    const { customer } = await getDemoCustomer();
    const { employee } = await getAdminEmployee();

    const createRes = await agent
      .post(`${API}/tickets`)
      .set('Authorization', admin.authorization)
      .send({
        subject: 'Integration support escalation ticket',
        description: 'Detailed integration support ticket for workflow validation',
        categoryId: seeds.ticketCategoryId,
        priority: 'HIGH',
        customerId: customer.id,
      });
    expect(createRes.status).toBe(201);
    const ticketId = createRes.body.data.id as string;
    markFlow('support.ticket-create');

    const assignRes = await agent
      .post(`${API}/tickets/${ticketId}/assign`)
      .set('Authorization', admin.authorization)
      .send({ assignedToId: employee.id, reason: 'Integration assignment' });
    expect([200, 201]).toContain(assignRes.status);
    markFlow('support.ticket-assign');

    const escalateRes = await agent
      .post(`${API}/tickets/${ticketId}/escalate`)
      .set('Authorization', admin.authorization)
      .send({ toLevel: 'L2_SUPPORT', reason: 'Integration escalation' });
    expect([200, 201]).toContain(escalateRes.status);
    markFlow('support.ticket-escalate');

    const resolveRes = await agent
      .post(`${API}/tickets/${ticketId}/resolve`)
      .set('Authorization', admin.authorization)
      .send({
        resolutionNotes: 'Integration test resolved the customer issue successfully',
        resolutionType: 'FIXED',
      });
    expect([200, 201]).toContain(resolveRes.status);
    markFlow('support.ticket-resolve');

    const closeRes = await agent
      .post(`${API}/tickets/${ticketId}/close`)
      .set('Authorization', admin.authorization)
      .send({ reason: 'Integration closure' });
    expect([200, 201, 204]).toContain(closeRes.status);
    markFlow('support.ticket-close');
  });
});
