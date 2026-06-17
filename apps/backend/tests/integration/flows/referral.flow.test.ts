import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { findSeedIds } from '../helpers/db.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('Referral integration flows', () => {
  it('creates, validates, converts, and processes referral rewards', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    const seeds = await findSeedIds();
    if (!seeds.referralTypeId) {
      throw new Error('Referral type seed missing');
    }

    const createRes = await agent
      .post(`${API}/referrals`)
      .set('Authorization', admin.authorization)
      .send({
        referralTypeId: seeds.referralTypeId,
        referrerName: 'Integration Referrer',
        referrerPhone: '9000011111',
        refereeName: 'Integration Referee',
        refereePhone: '9000022222',
        productId: seeds.productId,
        branchId: seeds.branchId,
      });
    expect(createRes.status).toBe(201);
    const referralId = createRes.body.data.id as string;
    const referralCode = createRes.body.data.referralCode as string;
    markFlow('referral.create');

    const validateRes = await agent
      .post(`${API}/referrals/validate-code`)
      .set('Authorization', admin.authorization)
      .send({ referralCode });
    expect(validateRes.status).toBe(200);
    markFlow('referral.validate');

    const convertRes = await agent
      .post(`${API}/referrals/${referralId}/convert`)
      .set('Authorization', admin.authorization)
      .send({});
    expect([200, 201]).toContain(convertRes.status);
    markFlow('referral.conversion');

    const approveReward = await agent
      .post(`${API}/referrals/${referralId}/approve-reward`)
      .set('Authorization', admin.authorization);
    expect([200, 201]).toContain(approveReward.status);
    markFlow('referral.reward-approval');

    const markPaid = await agent
      .post(`${API}/referrals/${referralId}/mark-paid`)
      .set('Authorization', admin.authorization);
    expect([200, 201]).toContain(markPaid.status);
    markFlow('referral.reward-payment');
  });
});
