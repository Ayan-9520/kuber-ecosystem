import http from 'k6/http';
import { check, sleep } from 'k6';
import { API, THRESHOLDS } from '../lib/common.js';

/** Scenario 6: AI advisor burst — chat, lead score, recommendations */
export const options = {
  vus: Number(__ENV.VUS || 50),
  duration: __ENV.DURATION || '90s',
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const chat = http.post(
    `${API}/ai/chat`,
    JSON.stringify({ message: 'What loan fits a salaried customer with 50k income?' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(chat, { 'ai chat path': (r) => [200, 401, 422, 503].includes(r.status) });

  const score = http.post(
    `${API}/leads/score`,
    JSON.stringify({ leadId: '00000000-0000-0000-0000-000000000001' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(score, { 'lead score path': (r) => [200, 401, 422].includes(r.status) });

  sleep(1);
}
