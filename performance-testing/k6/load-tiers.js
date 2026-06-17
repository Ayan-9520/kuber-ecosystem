import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, THRESHOLDS } from './lib/common.js';

const TIER = Number(__ENV.VUS || 100);

export const options = {
  stages: [
    { duration: '1m', target: TIER },
    { duration: '3m', target: TIER },
    { duration: '30s', target: 0 },
  ],
  thresholds: THRESHOLDS,
  tags: { tier: String(TIER) },
};

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { [`tier-${TIER} health`]: (r) => r.status === 200 });
  http.get(`${BASE_URL}/api/v1/analytics/dashboard`);
  sleep(0.2);
}
