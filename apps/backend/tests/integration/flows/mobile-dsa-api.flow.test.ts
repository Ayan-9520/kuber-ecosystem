import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { findSeedIds } from '../helpers/db.js';
import { ensureIntegrationPartner } from '../helpers/fixtures.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('DSA mobile API integration flows', () => {
  it('covers partner lead and commission endpoints used by DSA app', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    const seeds = await findSeedIds();
    const { partnerId } = await ensureIntegrationPartner('INT-DSA-MOBILE');

    const partners = await agent
      .get(`${API}/partners`)
      .set('Authorization', admin.authorization)
      .query({ page: 1, limit: 5 });
    expect(partners.status).toBe(200);

    const lead = await agent
      .post(`${API}/leads`)
      .set('Authorization', admin.authorization)
      .send({
        prospectName: 'DSA Mobile Lead',
        prospectPhone: '9333444555',
        productId: seeds.productId,
        sourceId: seeds.leadSourceId,
        branchId: seeds.branchId,
        partnerId,
      });
    expect(lead.status).toBe(201);

    const commissions = await agent
      .get(`${API}/commission-ledger`)
      .set('Authorization', admin.authorization)
      .query({ partnerId, page: 1, limit: 5 });
    expect(commissions.status).toBe(200);

    markFlow('mobile.dsa-api');
  });
});
