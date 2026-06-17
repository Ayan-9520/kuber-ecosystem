import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, THRESHOLDS } from './lib/common.js';

export const options = {
  vus: Number(__ENV.VUS || 5),
  duration: __ENV.DURATION || '30s',
  thresholds: THRESHOLDS,
};

export default function () {
  const health = http.get(`${BASE_URL}/health`);
  check(health, {
    'health status 200': (r) => r.status === 200,
    'health p95 under 500ms': (r) => r.timings.duration < 500,
  });

  const leads = http.get(`${BASE_URL}/api/v1/leads`);
  check(leads, {
    'leads requires auth': (r) => r.status === 401,
  });

  sleep(0.3);
}
