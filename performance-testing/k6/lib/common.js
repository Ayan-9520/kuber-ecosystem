/**
 * Shared k6 configuration for KuberOne performance tests.
 * @see https://k6.io/docs/
 */
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
export const API = `${BASE_URL}/api/v1`;

export const THRESHOLDS = {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  http_req_failed: ['rate<0.01'],
};

export function healthCheck() {
  return `${BASE_URL}/health`;
}

export function jsonHeaders(token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export function tierStages(targetVus) {
  return [
    { duration: '30s', target: Math.min(50, targetVus) },
    { duration: '1m', target: targetVus },
    { duration: '2m', target: targetVus },
    { duration: '30s', target: 0 },
  ];
}

export function stressStages() {
  return [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 500 },
    { duration: '2m', target: 1000 },
    { duration: '2m', target: 2000 },
    { duration: '2m', target: 5000 },
    { duration: '1m', target: 0 },
  ];
}

export function spikeStages() {
  return [
    { duration: '30s', target: 50 },
    { duration: '10s', target: 2000 },
    { duration: '1m', target: 2000 },
    { duration: '10s', target: 50 },
    { duration: '30s', target: 0 },
  ];
}

/** CI-safe endurance (override with ENDURANCE_DURATION=4h for full runs) */
export function enduranceDuration() {
  return __ENV.ENDURANCE_DURATION || '2m';
}
