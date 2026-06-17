import { jest } from '@jest/globals';
import { UserType } from '@kuberone/shared-types';
import bcrypt from 'bcryptjs';

import { prisma } from '../../../src/config/database.js';
import { loginService } from '../../../src/modules/auth/services/login.service.js';
import { sessionService } from '../../../src/modules/auth/services/session.service.js';
import { centralAuditService } from '../../../src/modules/governance/services/central-audit.service.js';
import { ForbiddenError, UnauthorizedError } from '../../../src/shared/errors/app-error.js';

const ctx = { ipAddress: '127.0.0.1', userAgent: 'jest', requestId: 'req-1' };

describe('loginService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(prisma.loginHistory.create).mockResolvedValue({} as never);
    jest.mocked(prisma.auditLog.create).mockResolvedValue({} as never);
    jest.mocked(prisma.user.update).mockResolvedValue({} as never);
    jest.spyOn(centralAuditService, 'logSecurityEvent').mockResolvedValue(undefined as never);
    jest.spyOn(sessionService, 'issueSession').mockResolvedValue({
      sessionId: 's1',
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 900,
    });
  });

  it('employee login succeeds with valid credentials', async () => {
    const hash = await bcrypt.hash('Admin@123', 10);
    jest.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'u1',
      userType: UserType.ADMIN,
      passwordHash: hash,
      status: 'ACTIVE',
    } as never);

    const result = await loginService.employeeLogin(
      { email: 'admin@kuberone.com', password: 'Admin@123' },
      ctx,
    );
    expect(result.accessToken).toBe('access');
  });

  it('employee login rejects invalid password', async () => {
    const hash = await bcrypt.hash('Admin@123', 10);
    jest.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'u1',
      userType: UserType.EMPLOYEE,
      passwordHash: hash,
      status: 'ACTIVE',
    } as never);

    await expect(
      loginService.employeeLogin({ email: 'admin@kuberone.com', password: 'wrong' }, ctx),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('employee login rejects partner user type', async () => {
    jest.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'u1',
      userType: UserType.PARTNER,
      passwordHash: 'hash',
      status: 'ACTIVE',
    } as never);

    await expect(
      loginService.employeeLogin({ email: 'p@example.com', password: 'Admin@123' }, ctx),
    ).rejects.toThrow(ForbiddenError);
  });
});
