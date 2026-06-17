import request from 'supertest';

import { createApp } from '../../../src/app.js';

describe('Auth routes', () => {
  const app = createApp();
  const base = '/api/v1/auth';

  it('rejects invalid employee login payload', async () => {
    const res = await request(app).post(`${base}/login`).send({
      loginType: 'employee',
      email: 'not-email',
      password: 'short',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid OTP send payload', async () => {
    const res = await request(app).post(`${base}/send-otp`).send({ phone: '12345' });
    expect(res.status).toBe(422);
  });

  it('rejects refresh without token', async () => {
    const res = await request(app).post(`${base}/refresh`).send({});
    expect(res.status).toBe(422);
  });

  it('rejects /me without auth header', async () => {
    const res = await request(app).get(`${base}/me`);
    expect(res.status).toBe(401);
  });

  it('rejects logout without auth', async () => {
    const res = await request(app).post(`${base}/logout`).send({ refreshToken: 'x' });
    expect(res.status).toBe(401);
  });

  it('rejects logout-all without auth', async () => {
    const res = await request(app).post(`${base}/logout-all`);
    expect(res.status).toBe(401);
  });
});
