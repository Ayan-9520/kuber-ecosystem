import { jest } from '@jest/globals';
import { DataScope, UserType } from '@kuberone/shared-types';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { prisma } from '../../src/config/database.js';
import { env } from '../../src/config/env.js';
import { createApp } from '../../src/app.js';
import { tokenService } from '../../src/modules/auth/services/token.service.js';
import { securityService } from '../../src/modules/auth/services/security.service.js';
import { centralAuditService } from '../../src/modules/governance/services/central-audit.service.js';
import type { AuthContext } from '../../src/modules/auth/types/auth.types.js';
import { TooManyRequestsError } from '../../src/shared/errors/app-error.js';

describe('Security — Authentication', () => {
  const app = createApp();
  const base = '/api/v1/auth';

  const context: AuthContext = {
    userId: 'user-sec-1',
    userType: UserType.EMPLOYEE,
    email: 'sec@kuberone.com',
    phone: '9876543210',
    roles: ['ADMIN'],
    permissions: ['users.read'],
    dataScope: DataScope.ORGANIZATION,
    branchId: 'branch-1',
    regionId: 'region-1',
    employeeId: 'emp-1',
  };

  beforeEach(() => {
    jest.spyOn(centralAuditService, 'logSecurityEvent').mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects forged JWT signed with wrong secret', async () => {
    const payload = tokenService.buildJwtPayload(context, 'session-forged');
    const forged = jwt.sign(payload, 'attacker-secret-not-the-real-one-32chars', { algorithm: 'HS256' });
    const res = await request(app).get(`${base}/me`).set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('rejects expired JWT', async () => {
    const payload = tokenService.buildJwtPayload(context, 'session-expired');
    const expired = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '-1h', algorithm: 'HS256' });
    const res = await request(app).get(`${base}/me`).set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it('rejects malformed JWT', async () => {
    const res = await request(app).get(`${base}/me`).set('Authorization', 'Bearer not.a.valid.jwt');
    expect(res.status).toBe(401);
  });

  it('rejects empty bearer token', async () => {
    const res = await request(app).get(`${base}/me`).set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
  });

  it('rejects refresh token abuse with invalid token', async () => {
    const res = await request(app).post(`${base}/refresh`).send({ refreshToken: 'stolen-or-replayed-token' });
    expect([401, 403, 422]).toContain(res.status);
  });

  it('rejects session replay without authorization header', async () => {
    const res = await request(app).post(`${base}/logout`).send({ refreshToken: 'any' });
    expect(res.status).toBe(401);
  });

  it('enforces OTP resend cooldown (brute-force mitigation)', () => {
    expect(() => securityService.assertOtpResendAllowed(new Date())).toThrow(TooManyRequestsError);
  });

  it('stores refresh tokens as SHA-256 hash, not plaintext', () => {
    const pair = tokenService.createRefreshTokenPair();
    expect(pair.hash).not.toBe(pair.plain);
    expect(pair.hash).toBe(tokenService.hashRefreshToken(pair.plain));
    expect(pair.hash).toHaveLength(64);
  });

  it('rejects invalid employee login (account enumeration mitigation via validation)', async () => {
    const res = await request(app).post(`${base}/login`).send({
      loginType: 'employee',
      email: 'nonexistent@evil.com',
      password: 'WrongPassword123!',
    });
    expect([401, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('rejects password reset / OTP send with invalid phone', async () => {
    const res = await request(app).post(`${base}/send-otp`).send({ phone: '00000' });
    expect(res.status).toBe(422);
  });

  it('logs security event on failed login recording', async () => {
    jest.mocked(prisma.loginHistory.create).mockResolvedValue({} as never);
    jest.mocked(prisma.loginHistory.count).mockResolvedValue(1);
    const logSpy = jest.spyOn(centralAuditService, 'logSecurityEvent');
    await securityService.recordFailedLogin('user-1', 'bad password', {
      ipAddress: '1.2.3.4',
      userAgent: 'test',
    });
    expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'FAILED_LOGIN' }));
  });
});
