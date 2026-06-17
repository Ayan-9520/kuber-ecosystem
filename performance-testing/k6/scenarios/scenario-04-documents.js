import http from 'k6/http';
import { check, sleep } from 'k6';
import { API, THRESHOLDS } from '../lib/common.js';

/** Scenario 4: Bulk document upload metadata API */
export const options = {
  vus: Number(__ENV.VUS || 100),
  duration: __ENV.DURATION || '90s',
  thresholds: THRESHOLDS,
};

export default function () {
  const list = http.get(`${API}/documents`);
  check(list, { 'documents list': (r) => [200, 401].includes(r.status) });
  const upload = http.post(
    `${API}/documents`,
    JSON.stringify({
      documentTypeId: '00000000-0000-0000-0000-000000000001',
      mimeType: 'application/pdf',
      fileName: `perf-${__ITER}.pdf`,
      fileSizeBytes: 102400,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(upload, { 'document upload path': (r) => [401, 422, 201].includes(r.status) });
  sleep(0.6);
}
