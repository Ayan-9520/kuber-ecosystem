import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, enduranceDuration } from './lib/common.js';

/**
 * Endurance — memory/connection leak detection over long runs.
 * Full: ENDURANCE_DURATION=4h|8h|12h|24h
 */
export const options = {
  vus: Number(__ENV.VUS || 50),
  duration: enduranceDuration(),
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'avg<300'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'endurance health stable': (r) => r.status === 200,
    'no latency drift': (r) => r.timings.duration < 2000,
  });
  http.get(`${BASE_URL}/api/v1/leads`);
  sleep(1);
}
