import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { findSeedIds, getDemoCustomer } from '../helpers/db.js';
import { getAdminEmployee, uniquePhone } from '../helpers/fixtures.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('LMS integration flows', () => {
  it('creates, assigns, scores, follows up, converts a lead, and creates application', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    const seeds = await findSeedIds();
    const { employee } = await getAdminEmployee();
    const { customer } = await getDemoCustomer();

    const createRes = await agent
      .post(`${API}/leads`)
      .set('Authorization', admin.authorization)
      .send({
        prospectName: 'Integration Lead',
        prospectPhone: uniquePhone(),
        productId: seeds.productId,
        sourceId: seeds.leadSourceId,
        branchId: seeds.branchId,
        requestedAmount: 750000,
      });
    expect(createRes.status).toBe(201);
    const leadId = createRes.body.data.id as string;
    markFlow('lms.lead-create');

    const assignRes = await agent
      .post(`${API}/leads/${leadId}/assign`)
      .set('Authorization', admin.authorization)
      .send({ assignedToId: employee.id, assignmentType: 'MANUAL' });
    expect([200, 201]).toContain(assignRes.status);
    markFlow('lms.lead-assign');

    const scoreRes = await agent
      .post(`${API}/leads/score`)
      .set('Authorization', admin.authorization)
      .send({ leadId, aiScore: 72, scoringProfile: { loanAmount: 750000, creditScore: 740 } });
    expect([200, 201]).toContain(scoreRes.status);
    markFlow('lms.lead-score');

    const followUpRes = await agent
      .post(`${API}/lead-followups`)
      .set('Authorization', admin.authorization)
      .send({
        leadId,
        assignedToId: employee.id,
        followUpType: 'CALL',
        scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
        notes: 'Integration follow-up',
      });
    expect([200, 201]).toContain(followUpRes.status);
    markFlow('lms.lead-followup');

    const convertRes = await agent
      .patch(`${API}/leads/${leadId}`)
      .set('Authorization', admin.authorization)
      .send({ status: 'APPLICATION_CREATED', customerId: customer.id });
    expect(convertRes.status).toBe(200);
    markFlow('lms.lead-convert');

    const applicationRes = await agent
      .post(`${API}/applications`)
      .set('Authorization', admin.authorization)
      .send({
        customerId: customer.id,
        leadId,
        productId: seeds.productId,
        requestedAmount: 750000,
        requestedTenureMonths: 180,
        branchId: seeds.branchId,
        runEligibility: false,
      });
    expect(applicationRes.status).toBe(201);
    markFlow('lms.application-create');
  });
});
