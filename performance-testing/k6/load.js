import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, THRESHOLDS, tierStages } from './lib/common.js';

const VUS = Number(__ENV.VUS || 100);

export const options = {
  stages: tierStages(VUS),
  thresholds: THRESHOLDS,
};

export default function () {
  const endpoints = [
    `${BASE_URL}/health`,
    `${BASE_URL}/api/v1/leads`,
    `${BASE_URL}/api/v1/customers`,
    `${BASE_URL}/api/v1/applications`,
    `${BASE_URL}/api/v1/analytics/dashboard`,
    `${BASE_URL}/api/v1/notifications`,
  ];
  const url = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(url);
  check(res, {
    'status ok or auth': (r) => [200, 401, 403, 422].includes(r.status),
    'response under 1s': (r) => r.timings.duration < 1000,
  });
  sleep(0.5);
}
