import { jest } from '@jest/globals';
import { UserStatus } from '@kuberone/shared-types';

import { prisma } from '../../../src/config/database.js';
import { securityService } from '../../../src/modules/auth/services/security.service.js';
import { centralAuditService } from '../../../src/modules/governance/services/central-audit.service.js';
import { AccountLockedError, ForbiddenError, TooManyRequestsError } from '../../../src/shared/errors/app-error.js';

const ctx = { ipAddress: '127.0.0.1', userAgent: 'jest', requestId: 'req-1' };

describe('securityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(centralAuditService, 'logSecurityEvent').mockResolvedValue(undefined as never);
  });

  describe('assertUserCanAuthenticate', () => {
    it('rejects missing user', async () => {
      jest.mocked(prisma.user.findFirst).mockResolvedValue(null);
      await expect(securityService.assertUserCanAuthenticate('missing')).rejects.toThrow('Invalid credentials');
    });

    it('rejects suspended account', async () => {
      jest.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'u1', status: UserStatus.SUSPENDED } as never);
      await expect(securityService.assertUserCanAuthenticate('u1')).rejects.toThrow(ForbiddenError);
    });

    it('allows active user', async () => {
      jest.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'u1', status: UserStatus.ACTIVE } as never);
      await expect(securityService.assertUserCanAuthenticate('u1')).resolves.toBeUndefined();
    });

    it('throws AccountLockedError when lock period not elapsed', async () => {
      jest.mocked(prisma.user.findFirst).mockResolvedValue({ id: 'u1', status: UserStatus.LOCKED } as never);
      jest.mocked(prisma.loginHistory.findFirst).mockResolvedValue({ createdAt: new Date() } as never);
      await expect(securityService.assertUserCanAuthenticate('u1')).rejects.toThrow(AccountLockedError);
    });
  });

  describe('assertOtpResendAllowed', () => {
    it('allows first OTP send', () => {
      expect(() => securityService.assertOtpResendAllowed(undefined)).not.toThrow();
    });

    it('blocks OTP resend during cooldown', () => {
      expect(() => securityService.assertOtpResendAllowed(new Date())).toThrow(TooManyRequestsError);
    });
  });

  describe('recordFailedLogin', () => {
    it('locks account after max failed attempts', async () => {
      jest.mocked(prisma.loginHistory.create).mockResolvedValue({} as never);
      jest.mocked(prisma.loginHistory.count).mockResolvedValue(5);
      jest.mocked(prisma.user.update).mockResolvedValue({} as never);
      jest.mocked(prisma.auditLog.create).mockResolvedValue({} as never);

      await securityService.recordFailedLogin('u1', 'INVALID_PASSWORD', ctx);

      expect(prisma.user.update).toHaveBeenCalled();
    });
  });
});
