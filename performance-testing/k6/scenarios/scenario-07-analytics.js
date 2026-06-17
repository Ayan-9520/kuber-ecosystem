import http from 'k6/http';
import { check, sleep } from 'k6';
import { API, THRESHOLDS } from '../lib/common.js';

/** Scenario 7: Dashboard analytics queries */
export const options = {
  vus: Number(__ENV.VUS || 200),
  duration: __ENV.DURATION || '2m',
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const dashboards = [
    `${API}/analytics/dashboard`,
    `${API}/executive-analytics/summary`,
    `${API}/branch-analytics/summary`,
    `${API}/regional-analytics/summary`,
    `${API}/commission-analytics/summary`,
  ];
  const url = dashboards[__ITER % dashboards.length];
  const res = http.get(url);
  check(res, {
    'analytics query handled': (r) => [200, 401, 404].includes(r.status),
    'dashboard under 2s': (r) => r.timings.duration < 2000,
  });
  sleep(0.3);
}
