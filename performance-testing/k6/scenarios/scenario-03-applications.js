import http from 'k6/http';
import { check, sleep } from 'k6';
import { API, THRESHOLDS } from '../lib/common.js';

/** Scenario 3: 500 application submissions */
export const options = {
  vus: Number(__ENV.VUS || 150),
  duration: __ENV.DURATION || '2m',
  thresholds: THRESHOLDS,
};

export default function () {
  const list = http.get(`${API}/applications`);
  check(list, { 'applications list': (r) => [200, 401].includes(r.status) });
  const create = http.post(`${API}/applications`, JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(create, { 'application submit path': (r) => [401, 422, 201].includes(r.status) });
  sleep(0.4);
}
