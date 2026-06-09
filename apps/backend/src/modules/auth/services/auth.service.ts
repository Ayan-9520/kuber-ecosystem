import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../repositories/audit.repository.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import type { MeResponse, RequestContext, SessionIssueResult } from '../types/auth.types.js';

import { rbacService } from './rbac.service.js';
import { sessionService } from './session.service.js';
import { tokenService } from './token.service.js';

export const authService = {
  async refresh(refreshToken: string, ctx: RequestContext): Promise<SessionIssueResult> {
    const hash = tokenService.hashRefreshToken(refreshToken);
    const previous = await refreshTokenRepository.findValidByHash(hash);
    const result = await sessionService.refreshSession(refreshToken, ctx);

    await authAuditRepository.log({
      userId: previous?.userId,
      action: 'TOKEN_REFRESHED',
      entityType: 'session',
      entityId: result.sessionId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return result;
  },

  async logout(
    refreshToken: string,
    sessionId: string | undefined,
    ctx: RequestContext,
  ): Promise<void> {
    let resolvedSessionId = sessionId;
    let userId: string | undefined;

    const hash = tokenService.hashRefreshToken(refreshToken);
    const record = await refreshTokenRepository.findValidByHash(hash);
    if (record) {
      resolvedSessionId = record.sessionId;
      userId = record.userId;
    }

    if (resolvedSessionId) {
      await sessionService.logout(resolvedSessionId);
    }

    if (userId) {
      await authAuditRepository.log({
        userId,
        action: 'LOGOUT',
        entityType: 'session',
        entityId: resolvedSessionId,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });
    }
  },

  async logoutAll(userId: string, ctx: RequestContext): Promise<void> {
    await sessionService.logoutAll(userId);

    await authAuditRepository.log({
      userId,
      action: 'LOGOUT_ALL_DEVICES',
      entityType: 'user',
      entityId: userId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  },

  async getMe(userId: string): Promise<MeResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const authContext = await rbacService.resolveAuthContext(userId);

    return {
      id: user.id,
      userType: authContext.userType,
      email: authContext.email,
      phone: authContext.phone,
      status: user.status,
      roles: authContext.roles,
      permissions: authContext.permissions,
      dataScope: authContext.dataScope,
      branchId: authContext.branchId,
      regionId: authContext.regionId,
      employeeId: authContext.employeeId,
      customerId: authContext.customerId,
      partnerId: authContext.partnerId,
      lastLoginAt: user.lastLoginAt,
    };
  },
};
