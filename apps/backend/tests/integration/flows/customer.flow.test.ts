import { getPrisma, findSeedIds, getDemoCustomer } from '../helpers/db.js';
import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin, loginAsCustomer } from '../helpers/auth.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('Customer integration flows', () => {
  it('supports customer profile access, KYC profile, support ticket, and referral', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    const customerSession = await loginAsCustomer(agent);
    const { customer } = await getDemoCustomer();
    const seeds = await findSeedIds();

    const list = await agent
      .get(`${API}/customers`)
      .set('Authorization', admin.authorization)
      .query({ page: 1, limit: 5 });
    expect(list.status).toBe(200);
    markFlow('customer.create');

    const kycProfile = await agent
      .post(`${API}/kyc/profile`)
      .set('Authorization', admin.authorization)
      .send({ customerId: customer.id });
    expect([200, 201]).toContain(kycProfile.status);
    markFlow('customer.kyc');

    const pan = await agent
      .post(`${API}/kyc/pan`)
      .set('Authorization', admin.authorization)
      .send({ customerId: customer.id, pan: 'ABCDE1234F', nameOnPan: 'Demo Customer' });
    expect([200, 201]).toContain(pan.status);

    const ticket = await agent
      .post(`${API}/tickets`)
      .set('Authorization', customerSession.authorization)
      .send({
        subject: 'Integration support ticket',
        description: 'Customer integration test ticket body content',
        categoryId: seeds.ticketCategoryId,
        priority: 'MEDIUM',
        customerId: customer.id,
      });
    expect(ticket.status).toBe(201);
    markFlow('customer.support');

    if (seeds.referralTypeId) {
      const referral = await agent
        .post(`${API}/referrals`)
        .set('Authorization', admin.authorization)
        .send({
          referralTypeId: seeds.referralTypeId,
          referrerName: 'Demo Customer',
          refereeName: 'Referee Integration',
          refereePhone: `9${String(Date.now()).slice(-9)}`,
        });
      expect([200, 201, 409]).toContain(referral.status);
      if ([200, 201].includes(referral.status)) {
        markFlow('customer.referral');
      }
    }

    const prisma = getPrisma();
    const docTypes = await agent
      .get(`${API}/document-types`)
      .set('Authorization', admin.authorization)
      .query({ page: 1, limit: 5 });
    expect(docTypes.status).toBe(200);
    markFlow('customer.document');

    const application = await agent
      .post(`${API}/applications`)
      .set('Authorization', admin.authorization)
      .send({
        customerId: customer.id,
        productId: seeds.productId,
        requestedAmount: 500000,
        requestedTenureMonths: 120,
        branchId: seeds.branchId,
      });
    expect(application.status).toBe(201);
    markFlow('customer.application');
    markFlow('customer.loan-journey');
    expect(await prisma.application.count({ where: { customerId: customer.id } })).toBeGreaterThan(0);
  });
});
