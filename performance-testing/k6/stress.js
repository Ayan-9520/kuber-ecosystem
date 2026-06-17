import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, stressStages } from './lib/common.js';

/**
 * Stress test — find breaking point, failure point, recovery point.
 * Breaking: error rate > 1% | Failure: p99 > 3000ms | Recovery: final stage ramp-down
 */
export const options = {
  stages: stressStages(),
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(99)<3000'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health reachable under stress': (r) => r.status === 200,
  });
  http.batch([
    ['GET', `${BASE_URL}/api/v1/leads`],
    ['GET', `${BASE_URL}/api/v1/customers`],
    ['GET', `${BASE_URL}/api/v1/tickets`],
  ]);
}
