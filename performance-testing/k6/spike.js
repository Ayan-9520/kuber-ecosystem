import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, spikeStages } from './lib/common.js';

/** Spike — campaign launch, mass notifications, peak loan season */
export const options = {
  stages: spikeStages(),
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.02'],
  },
};

export default function () {
  const burst = [
    http.get(`${BASE_URL}/health`),
    http.get(`${BASE_URL}/api/v1/campaigns`),
    http.get(`${BASE_URL}/api/v1/notifications`),
    http.post(`${BASE_URL}/api/v1/auth/send-otp`, JSON.stringify({ phone: '9876543210' }), {
      headers: { 'Content-Type': 'application/json' },
    }),
  ];
  check(burst[0], { 'spike health ok': (r) => r.status === 200 });
  sleep(0.1);
}
