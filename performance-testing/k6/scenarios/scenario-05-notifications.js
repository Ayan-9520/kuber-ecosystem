import http from 'k6/http';
import { check, sleep } from 'k6';
import { API, THRESHOLDS } from '../lib/common.js';

/** Scenario 5: Mass notification blast — queue throughput */
export const options = {
  scenarios: {
    notification_blast: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 300 },
        { duration: '1m', target: 300 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    ...THRESHOLDS,
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  const channels = [
    () => http.get(`${API}/notifications`),
    () =>
      http.post(`${API}/email/send`, JSON.stringify({ to: 'perf@test.com', subject: 'Perf', body: 'test' }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    () =>
      http.post(`${API}/sms/send`, JSON.stringify({ to: '+919876543210', message: 'Perf' }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    () =>
      http.post(`${API}/push/send`, JSON.stringify({ userId: 'u1', title: 'Perf', body: 'test' }), {
        headers: { 'Content-Type': 'application/json' },
      }),
  ];
  const fn = channels[__ITER % channels.length];
  const res = fn();
  check(res, { 'notification channel handled': (r) => [200, 401, 422, 429].includes(r.status) });
  sleep(0.15);
}
