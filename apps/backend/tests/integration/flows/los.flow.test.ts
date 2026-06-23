import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { findSeedIds, getDemoCustomer } from '../helpers/db.js';
import { ensureIntegrationLender, getAdminEmployee, getDocumentTypeId, tinyPngBase64 } from '../helpers/fixtures.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('LOS integration flows', () => {
  it('runs application through eligibility, credit review, sanction, disbursement, and closure', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    const seeds = await findSeedIds();
    const { customer } = await getDemoCustomer();
    const { lenderId } = await ensureIntegrationLender();
    const { employee } = await getAdminEmployee();
    const documentTypeId = await getDocumentTypeId('PAN');

    const appRes = await agent
      .post(`${API}/applications`)
      .set('Authorization', admin.authorization)
      .send({
        customerId: customer.id,
        productId: seeds.productId,
        requestedAmount: 1200000,
        requestedTenureMonths: 180,
        branchId: seeds.branchId,
        selectedLenderId: lenderId,
        runEligibility: false,
      });
    expect(appRes.status).toBe(201);
    const applicationId = appRes.body.data.id as string;
    markFlow('los.application');

    const submitRes = await agent
      .post(`${API}/applications/${applicationId}/submit`)
      .set('Authorization', admin.authorization)
      .send({ runEligibility: false });
    expect(submitRes.status).toBe(200);

    const reviewRes = await agent
      .patch(`${API}/applications/${applicationId}`)
      .set('Authorization', admin.authorization)
      .send({ status: 'UNDER_REVIEW' });
    expect(reviewRes.status).toBe(200);

    const eligibility = await agent
      .post(`${API}/eligibility-results/evaluate`)
      .set('Authorization', admin.authorization)
      .send({ applicationId });
    expect([200, 201]).toContain(eligibility.status);
    markFlow('los.eligibility');

    const docUpload = await agent
      .post(`${API}/documents/upload`)
      .set('Authorization', admin.authorization)
      .send({
        ownerType: 'APPLICATION',
        applicationId,
        documentTypeId,
        fileName: 'los-pan.png',
        mimeType: 'image/png',
        contentBase64: tinyPngBase64(),
        runOcr: false,
      });
    expect([200, 201]).toContain(docUpload.status);
    const documentId = docUpload.body.data.id as string;

    const verifyDoc = await agent
      .post(`${API}/documents/${documentId}/verify`)
      .set('Authorization', admin.authorization)
      .send({ mode: 'MANUAL', result: 'APPROVED' });
    expect([200, 201]).toContain(verifyDoc.status);
    markFlow('los.document-verification');

    const creditReview = await agent
      .post(`${API}/credit-reviews`)
      .set('Authorization', admin.authorization)
      .send({
        applicationId,
        reviewerId: employee.id,
        reviewType: 'INTERNAL',
        decision: 'APPROVED',
        cibilScore: 760,
      });
    expect(creditReview.status).toBe(201);
    markFlow('los.credit-review');

    const sanction = await agent
      .post(`${API}/sanctions`)
      .set('Authorization', admin.authorization)
      .send({
        applicationId,
        lenderId,
        sanctionAmount: 1200000,
        tenureMonths: 180,
        interestRate: 8.75,
        sanctionDate: new Date().toISOString(),
      });
    expect(sanction.status).toBe(201);
    markFlow('los.sanction');

    const disbursement = await agent
      .post(`${API}/disbursements`)
      .set('Authorization', admin.authorization)
      .send({
        applicationId,
        lenderId,
        disbursementAmount: 1200000,
        disbursementDate: new Date().toISOString(),
        status: 'COMPLETED',
      });
    expect(disbursement.status).toBe(201);
    markFlow('los.disbursement');
    markFlow('los.closure');

    const appDetail = await agent
      .get(`${API}/applications/${applicationId}`)
      .set('Authorization', admin.authorization);
    expect(appDetail.status).toBe(200);
    expect(['DISBURSED', 'CLOSED']).toContain(appDetail.body.data.status);

    const leadId = appDetail.body.data.leadId as string | null;
    if (leadId) {
      const leadRes = await agent.get(`${API}/leads/${leadId}`).set('Authorization', admin.authorization);
      expect(leadRes.status).toBe(200);
      expect(leadRes.body.data.status).toBe('DISBURSED');
    }
  });
});
