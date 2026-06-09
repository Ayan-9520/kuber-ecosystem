import { UserStatus } from '@kuberone/shared-types';

import { env } from '../../../config/env.js';
import {
  AccountLockedError,
  ForbiddenError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../repositories/audit.repository.js';
import { loginHistoryRepository } from '../repositories/login-history.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import type { RequestContext } from '../types/auth.types.js';

export const securityService = {
  async assertUserCanAuthenticate(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.INACTIVE) {
      throw new ForbiddenError('Account is not active');
    }

    if (user.status === UserStatus.LOCKED) {
      const unlocked = await securityService.tryUnlockAccount(userId);
      if (!unlocked) {
        const lastFailure = await loginHistoryRepository.findLastFailure(userId);
        const unlockAt = lastFailure
          ? new Date(
              lastFailure.createdAt.getTime() + env.ACCOUNT_LOCK_MINUTES * 60 * 1000,
            )
          : undefined;
        throw new AccountLockedError(unlockAt);
      }
    }
  },

  async recordFailedLogin(
    userId: string,
    reason: string,
    ctx: RequestContext,
  ): Promise<void> {
    await loginHistoryRepository.create({
      userId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      success: false,
      failReason: reason,
    });

    const since = new Date(Date.now() - env.ACCOUNT_LOCK_MINUTES * 60 * 1000);
    const failures = await loginHistoryRepository.countRecentFailures(userId, since);

    if (failures >= env.MAX_FAILED_LOGIN_ATTEMPTS) {
      await userRepository.setStatus(userId, UserStatus.LOCKED);
      await authAuditRepository.log({
        userId,
        action: 'ACCOUNT_LOCKED',
        entityType: 'user',
        entityId: userId,
        newValues: { reason: 'MAX_FAILED_LOGIN_ATTEMPTS', failures },
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });
    }
  },

  async recordSuccessfulLogin(
    userId: string,
    sessionId: string,
    ctx: RequestContext,
  ): Promise<void> {
    await loginHistoryRepository.create({
      userId,
      sessionId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      success: true,
    });

    await userRepository.updateLastLogin(userId);

    if ((await userRepository.findById(userId))?.status === UserStatus.LOCKED) {
      await userRepository.setStatus(userId, UserStatus.ACTIVE);
    }
  },

  async tryUnlockAccount(userId: string): Promise<boolean> {
    const lastFailure = await loginHistoryRepository.findLastFailure(userId);
    if (!lastFailure) {
      await userRepository.setStatus(userId, UserStatus.ACTIVE);
      return true;
    }

    const unlockAt = new Date(
      lastFailure.createdAt.getTime() + env.ACCOUNT_LOCK_MINUTES * 60 * 1000,
    );

    if (new Date() >= unlockAt) {
      await userRepository.setStatus(userId, UserStatus.ACTIVE);
      return true;
    }

    return false;
  },

  assertOtpResendAllowed(lastSentAt?: Date): void {
    if (!lastSentAt) return;

    const cooldownMs = env.OTP_RESEND_COOLDOWN_SECONDS * 1000;
    const elapsed = Date.now() - lastSentAt.getTime();
    if (elapsed < cooldownMs) {
      const retryAfter = Math.ceil((cooldownMs - elapsed) / 1000);
      throw new TooManyRequestsError(`OTP resend allowed in ${retryAfter} seconds`);
    }
  },
};
