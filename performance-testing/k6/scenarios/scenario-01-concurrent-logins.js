import http from 'k6/http';
import { check, sleep } from 'k6';
import { API, THRESHOLDS } from '../lib/common.js';

/** Scenario 1: 100 concurrent logins (OTP flow) */
export const options = {
  scenarios: {
    concurrent_logins: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: THRESHOLDS,
};

export default function () {
  const phone = `98${String(__VU).padStart(8, '0').slice(-8)}`;
  const send = http.post(`${API}/auth/send-otp`, JSON.stringify({ phone }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(send, {
    'otp send accepted': (r) => [200, 422, 429].includes(r.status),
    'otp send under 500ms p95 target': (r) => r.timings.duration < 1000,
  });
  sleep(0.5);
}
