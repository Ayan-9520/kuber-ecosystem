import { UnauthorizedError } from '../../../shared/errors/app-error.js';
import { centralAuditService } from '../../governance/services/central-audit.service.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { sessionRepository } from '../repositories/session.repository.js';
import type { AuthDeviceInput, RequestContext, SessionIssueResult } from '../types/auth.types.js';

import { deviceService } from './device.service.js';
import { rbacService } from './rbac.service.js';
import { tokenService } from './token.service.js';

export const sessionService = {
  async issueSession(
    userId: string,
    ctx: RequestContext,
    device?: AuthDeviceInput,
  ): Promise<SessionIssueResult> {
    const authContext = await rbacService.resolveAuthContext(userId);
    const expiresAt = tokenService.getRefreshTokenExpiryDate();

    const session = await sessionRepository.create({
      userId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      expiresAt,
    });

    const payload = tokenService.buildJwtPayload(authContext, session.id);
    const accessToken = tokenService.issueAccessToken(payload);
    const { plain: refreshToken, hash } = tokenService.createRefreshTokenPair();

    await refreshTokenRepository.create({
      userId,
      sessionId: session.id,
      tokenHash: hash,
      expiresAt,
    });

    await deviceService.registerDevice(userId, device);

    return {
      sessionId: session.id,
      accessToken,
      refreshToken,
      expiresIn: tokenService.getAccessTokenExpirySeconds(),
    };
  },

  async refreshSession(
    refreshToken: string,
    ctx: RequestContext,
  ): Promise<SessionIssueResult> {
    const tokenHash = tokenService.hashRefreshToken(refreshToken);
    const anyRecord = await refreshTokenRepository.findByHash(tokenHash);

    if (anyRecord?.revokedAt) {
      await sessionService.logoutAll(anyRecord.userId);
      void centralAuditService.logSecurityEvent({
        eventType: 'SUSPICIOUS_ACTIVITY',
        severity: 'CRITICAL',
        userId: anyRecord.userId,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
        description: 'Refresh token reuse detected — all sessions revoked',
        metadata: { sessionId: anyRecord.sessionId },
      });
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const candidates = anyRecord ? { record: anyRecord, session: anyRecord.session } : null;
    if (!candidates) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const { record, session } = candidates;
    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedError('Session expired or revoked');
    }

    await refreshTokenRepository.revoke(record.id);
    await sessionRepository.revoke(record.sessionId);

    return sessionService.issueSession(record.userId, ctx);
  },

  async logout(sessionId: string): Promise<void> {
    await sessionRepository.revoke(sessionId);
    await refreshTokenRepository.revokeBySession(sessionId);
  },

  async logoutAll(userId: string): Promise<void> {
    await sessionRepository.revokeAllForUser(userId);
    await refreshTokenRepository.revokeAllForUser(userId);
  },

  async assertActiveSession(sessionId: string): Promise<void> {
    const session = await sessionRepository.findActiveById(sessionId);
    if (!session) {
      throw new UnauthorizedError('Session expired or revoked');
    }
  },
};

