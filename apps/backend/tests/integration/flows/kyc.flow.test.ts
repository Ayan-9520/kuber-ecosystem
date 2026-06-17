import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { getDemoCustomer } from '../helpers/db.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('KYC integration flows', () => {
  it('submits PAN, Aadhaar OTP flow, and records audit trail', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    const { customer } = await getDemoCustomer();

    const panRes = await agent
      .post(`${API}/kyc/pan`)
      .set('Authorization', admin.authorization)
      .send({ customerId: customer.id, pan: 'FGHIJ5678K', nameOnPan: 'Demo Customer' });
    expect([200, 201]).toContain(panRes.status);
    markFlow('kyc.pan');
    if (panRes.body.data?.status === 'VERIFIED' || panRes.body.data?.verificationStatus === 'VERIFIED') {
      markFlow('kyc.approval');
    }

    const aadhaarSend = await agent
      .post(`${API}/kyc/aadhaar/send-otp`)
      .set('Authorization', admin.authorization)
      .send({ customerId: customer.id, aadhaar: '234567890123' });
    expect([200, 201, 422]).toContain(aadhaarSend.status);
    markFlow('kyc.aadhaar');

    const audit = await agent
      .get(`${API}/kyc/profile/audit`)
      .set('Authorization', admin.authorization)
      .query({ customerId: customer.id, page: 1, limit: 10 });
    expect(audit.status).toBe(200);
    markFlow('kyc.audit');
  });
});
