import type { SuperAgentTest } from 'supertest';

import { API } from './api.js';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  authorization: string;
}

export async function loginAsAdmin(agent: SuperAgentTest): Promise<AuthSession> {
  const res = await agent.post(`${API}/auth/login`).send({
    loginType: 'employee',
    email: 'admin@kuberone.com',
    password: 'Admin@123',
  });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);

  const accessToken = res.body.data.accessToken as string;
  const refreshToken = res.body.data.refreshToken as string;
  return {
    accessToken,
    refreshToken,
    authorization: `Bearer ${accessToken}`,
  };
}

export async function loginAsCustomer(
  agent: SuperAgentTest,
  phone = '9876543210',
): Promise<AuthSession> {
  let sendRes = await agent.post(`${API}/auth/send-otp`).send({ phone, purpose: 'LOGIN' });
  if (sendRes.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    sendRes = await agent.post(`${API}/auth/send-otp`).send({ phone, purpose: 'LOGIN' });
  }
  if (sendRes.status !== 429) {
    expect([200, 422]).toContain(sendRes.status);
  }

  const verifyRes = await agent.post(`${API}/auth/verify-otp`).send({
    phone,
    otp: '123456',
    purpose: 'LOGIN',
  });

  expect(verifyRes.status).toBe(200);
  const accessToken = verifyRes.body.data.accessToken as string;
  const refreshToken = verifyRes.body.data.refreshToken as string;
  return {
    accessToken,
    refreshToken,
    authorization: `Bearer ${accessToken}`,
  };
}

export async function refreshSession(
  agent: SuperAgentTest,
  refreshToken: string,
): Promise<AuthSession> {
  const res = await agent.post(`${API}/auth/refresh`).send({ refreshToken });
  expect(res.status).toBe(200);
  const accessToken = res.body.data.accessToken as string;
  const newRefresh = res.body.data.refreshToken as string;
  return {
    accessToken,
    refreshToken: newRefresh,
    authorization: `Bearer ${accessToken}`,
  };
}
