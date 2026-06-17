import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { findSeedIds } from '../helpers/db.js';
import { ensureIntegrationPartner } from '../helpers/fixtures.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('Commission integration flows', () => {
  it('calculates, approves, pays, recovers, and lists ledger entries', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    const seeds = await findSeedIds();
    const { partnerId } = await ensureIntegrationPartner('INT-COMM-FLOW');

    const calculateRes = await agent
      .post(`${API}/commission-ledger/calculate`)
      .set('Authorization', admin.authorization)
      .send({
        partnerId,
        commissionType: 'LEAD_GENERATION',
        baseAmount: 50000,
        productId: seeds.productId,
        branchId: seeds.branchId,
        notes: 'Integration commission calculation',
      });
    expect([200, 201]).toContain(calculateRes.status);
    markFlow('commission.calculate');

    const ledgerRes = await agent
      .get(`${API}/commission-ledger`)
      .set('Authorization', admin.authorization)
      .query({ partnerId, page: 1, limit: 10 });
    expect(ledgerRes.status).toBe(200);
    const ledgerItems = (Array.isArray(ledgerRes.body.data)
      ? ledgerRes.body.data
      : ledgerRes.body.data?.items) as Array<{ id: string }>;
    expect(ledgerItems.length).toBeGreaterThan(0);
    markFlow('commission.ledger');

    const ledgerId = ledgerItems[0]!.id;

    const approvalReq = await agent
      .post(`${API}/commission-approvals`)
      .set('Authorization', admin.authorization)
      .send({ ledgerId, notes: 'Integration approval request' });
    expect([200, 201]).toContain(approvalReq.status);
    const approvalId = approvalReq.body.data.id as string;

    const approval = await agent
      .post(`${API}/commission-approvals/${approvalId}/approve`)
      .set('Authorization', admin.authorization)
      .send({ approvedAmount: 5000 });
    expect([200, 201]).toContain(approval.status);
    markFlow('commission.approval');

    const payment = await agent
      .post(`${API}/commission-payments`)
      .set('Authorization', admin.authorization)
      .send({ partnerId, ledgerIds: [ledgerId], paymentMethod: 'NEFT' });
    expect([200, 201]).toContain(payment.status);
    const paymentId = payment.body.data.id as string;

    const paymentApproval = await agent
      .post(`${API}/commission-payments/${paymentId}/approve`)
      .set('Authorization', admin.authorization);
    expect([200, 201]).toContain(paymentApproval.status);

    const release = await agent
      .post(`${API}/commission-payments/${paymentId}/release`)
      .set('Authorization', admin.authorization)
      .send({ paymentReference: `INT-PAY-${Date.now()}` });
    expect([200, 201]).toContain(release.status);
    markFlow('commission.payment');

    const recovery = await agent
      .post(`${API}/commission-recoveries`)
      .set('Authorization', admin.authorization)
      .send({
        partnerId,
        ledgerId,
        amount: 500,
        reason: 'Integration recovery test',
      });
    expect([200, 201, 422]).toContain(recovery.status);
    if ([200, 201].includes(recovery.status)) {
      markFlow('commission.recovery');
    }
  });
});
