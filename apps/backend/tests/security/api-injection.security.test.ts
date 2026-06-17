import request from 'supertest';
import {
  COMMAND_INJECTION_PAYLOADS,
  HEADER_INJECTION_PAYLOADS,
  MASS_ASSIGNMENT_FIELDS,
  NOSQL_INJECTION_PAYLOADS,
  PATH_TRAVERSAL_PAYLOADS,
  SQL_INJECTION_PAYLOADS,
  SSRF_PAYLOADS,
} from '@kuberone/security-testing';

import { createApp } from '../../src/app.js';

describe('Security — API Injection & Abuse', () => {
  const app = createApp();
  const api = '/api/v1';

  const safeStatuses = [400, 401, 403, 404, 422, 429];

  function assertNoSqlLeak(body: string): void {
    expect(body.toLowerCase()).not.toMatch(/syntax error|sqlstate|ora-\d+|mysql/i);
  }

  it.each(SQL_INJECTION_PAYLOADS)('rejects SQL injection in search param: %s', async (payload) => {
    const res = await request(app).get(`${api}/leads`).query({ search: payload });
    expect(safeStatuses).toContain(res.status);
    assertNoSqlLeak(JSON.stringify(res.body));
  });

  it.each(NOSQL_INJECTION_PAYLOADS)('rejects NoSQL injection in login: %s', async (payload) => {
    const res = await request(app).post(`${api}/auth/login`).send({
      loginType: 'employee',
      email: payload,
      password: payload,
    });
    expect([401, 422]).toContain(res.status);
  });

  it.each(COMMAND_INJECTION_PAYLOADS)('rejects command injection in query: %s', async (payload) => {
    const res = await request(app).get(`${api}/customers`).query({ name: payload });
    expect(safeStatuses).toContain(res.status);
  });

  it('rejects header injection in custom header', async () => {
    await expect(
      request(app)
        .get(`${api}/auth/me`)
        .set('X-Request-Id', HEADER_INJECTION_PAYLOADS[0]!)
        .set('Authorization', 'Bearer invalid'),
    ).rejects.toThrow(/Invalid character|header/i);

    const res = await request(app)
      .get(`${api}/auth/me`)
      .set('X-Request-Id', HEADER_INJECTION_PAYLOADS[1]!)
      .set('Authorization', 'Bearer invalid');
    expect(res.status).toBe(401);
    expect(res.headers['set-cookie']).toBeUndefined();
    expect(JSON.stringify(res.headers)).not.toMatch(/evil=1/i);
  });

  it.each(PATH_TRAVERSAL_PAYLOADS)('blocks path traversal IDOR attempt: %s', async (payload) => {
    const res = await request(app).get(`${api}/documents/${encodeURIComponent(payload)}`);
    expect(safeStatuses).toContain(res.status);
  });

  it('blocks unauthenticated IDOR on leads', async () => {
    const res = await request(app).get(`${api}/leads/00000000-0000-0000-0000-000000000001`);
    expect(res.status).toBe(401);
  });

  it('rejects mass assignment on login payload', async () => {
    const extra: Record<string, unknown> = { loginType: 'employee', email: 'a@b.com', password: 'ValidPass123!' };
    for (const field of MASS_ASSIGNMENT_FIELDS) {
      extra[field] = field === 'roles' ? ['ADMIN'] : 'ADMIN';
    }
    const res = await request(app).post(`${api}/auth/login`).send(extra);
    expect([401, 422]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data?.user?.roles).not.toContain('ADMIN');
    }
  });

  it.each(SSRF_PAYLOADS)('does not proxy SSRF URL via health: %s', async (url) => {
    const res = await request(app).get('/health').query({ callback: url });
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('169.254.169.254');
  });

  it('returns 404 for unknown API routes (no stack trace leak)', async () => {
    const res = await request(app).get(`${api}/internal-admin-backdoor`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).not.toMatch(/stack|at\s+\w+/i);
  });
});
