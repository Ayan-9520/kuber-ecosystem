import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { getDemoCustomer } from '../helpers/db.js';
import { getDocumentTypeId, tinyPngBase64 } from '../helpers/fixtures.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('Document integration flows', () => {
  it('uploads, runs OCR, verifies, approves, rejects, and downloads documents', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    const { customer } = await getDemoCustomer();
    const documentTypeId = await getDocumentTypeId('PAN');

    const uploadRes = await agent
      .post(`${API}/documents/upload`)
      .set('Authorization', admin.authorization)
      .send({
        ownerType: 'CUSTOMER',
        customerId: customer.id,
        documentTypeId,
        fileName: 'pan-integration.png',
        mimeType: 'image/png',
        contentBase64: tinyPngBase64(),
        runOcr: true,
        autoVerify: false,
      });
    expect([200, 201]).toContain(uploadRes.status);
    const documentId = uploadRes.body.data.id as string;
    markFlow('document.upload');

    const ocrRes = await agent
      .post(`${API}/ocr-results/run`)
      .set('Authorization', admin.authorization)
      .send({ documentId });
    expect([200, 201]).toContain(ocrRes.status);
    markFlow('document.ocr');

    const verifyRes = await agent
      .post(`${API}/documents/${documentId}/verify`)
      .set('Authorization', admin.authorization)
      .send({ mode: 'MANUAL', result: 'APPROVED', notes: 'Integration verify' });
    expect([200, 201]).toContain(verifyRes.status);
    markFlow('document.verify');

    const approveRes = await agent
      .post(`${API}/documents/${documentId}/approve`)
      .set('Authorization', admin.authorization);
    expect([200, 201]).toContain(approveRes.status);
    markFlow('document.approval');

    const downloadRes = await agent
      .get(`${API}/documents/${documentId}/download-url`)
      .set('Authorization', admin.authorization);
    expect(downloadRes.status).toBe(200);
    markFlow('document.download');

    const rejectUpload = await agent
      .post(`${API}/documents/upload`)
      .set('Authorization', admin.authorization)
      .send({
        ownerType: 'CUSTOMER',
        customerId: customer.id,
        documentTypeId,
        fileName: 'pan-reject.png',
        mimeType: 'image/png',
        contentBase64: tinyPngBase64(),
        runOcr: false,
      });
    expect([200, 201]).toContain(rejectUpload.status);
    const rejectDocId = rejectUpload.body.data.id as string;

    const rejectRes = await agent
      .post(`${API}/documents/${rejectDocId}/reject`)
      .set('Authorization', admin.authorization)
      .send({ reason: 'Illegible scan for integration test' });
    expect([200, 201]).toContain(rejectRes.status);
    markFlow('document.rejection');
  });
});
