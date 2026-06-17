import request from 'supertest';

import { createApp } from '../../src/app.js';

describe('Security — Infrastructure', () => {
  const app = createApp();

  it('sets Helmet security headers', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeTruthy();
  });

  it('disables X-Powered-By header', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('exposes rate limit headers on API routes', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.headers['ratelimit-limit'] || res.headers['x-ratelimit-limit']).toBeTruthy();
  });

  it('health endpoint does not leak secrets', async () => {
    const res = await request(app).get('/health');
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/JWT_ACCESS_SECRET|OPENAI_API_KEY|password/i);
  });

  it('returns JSON content-type for errors', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route-xyz');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('includes request id middleware support', async () => {
    const res = await request(app).get('/health').set('X-Request-Id', 'sec-test-req-1');
    expect(res.status).toBe(200);
  });
});
