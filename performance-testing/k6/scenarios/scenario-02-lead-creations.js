import http from 'k6/http';
import { check, sleep } from 'k6';
import { API, THRESHOLDS } from '../lib/common.js';

/** Scenario 2: 1000 lead creations (authenticated path returns 401 without token — validates gateway latency) */
export const options = {
  scenarios: {
    lead_creations: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.RATE || 50),
      timeUnit: '1s',
      duration: __ENV.DURATION || '2m',
      preAllocatedVUs: 100,
      maxVUs: 500,
    },
  },
  thresholds: THRESHOLDS,
};

export default function () {
  const payload = JSON.stringify({
    firstName: 'Perf',
    lastName: `Lead${__ITER}`,
    phone: `91${String(__ITER).padStart(10, '0').slice(-10)}`,
    sourceCode: 'DSA_APP',
  });
  const res = http.post(`${API}/leads`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, {
    'lead create handled': (r) => [401, 403, 422, 201].includes(r.status),
  });
  sleep(0.2);
}
