import { DataScope, UserType } from '@kuberone/shared-types';

import { tokenService } from '../../../src/modules/auth/services/token.service.js';
import type { AuthContext } from '../../../src/modules/auth/types/auth.types.js';

describe('tokenService', () => {
  const context: AuthContext = {
    userId: 'user-1',
    userType: UserType.EMPLOYEE,
    email: 'admin@kuberone.com',
    phone: '9876543210',
    roles: ['ADMIN'],
    permissions: ['users.read'],
    dataScope: DataScope.ORGANIZATION,
    branchId: 'branch-1',
    regionId: 'region-1',
    employeeId: 'emp-1',
  };

  it('builds JWT payload with session id', () => {
    const payload = tokenService.buildJwtPayload(context, 'session-abc');
    expect(payload.sub).toBe('user-1');
    expect(payload.sessionId).toBe('session-abc');
    expect(payload.roles).toContain('ADMIN');
  });

  it('issues and verifies access token', () => {
    const payload = tokenService.buildJwtPayload(context, 'session-abc');
    const token = tokenService.issueAccessToken(payload);
    const verified = tokenService.verifyAccessToken(token);
    expect(verified.sub).toBe('user-1');
    expect(verified.sessionId).toBe('session-abc');
  });

  it('creates refresh token pair with hash', () => {
    const pair = tokenService.createRefreshTokenPair();
    expect(pair.plain).toBeTruthy();
    expect(pair.hash).toBe(tokenService.hashRefreshToken(pair.plain));
    expect(pair.plain).not.toBe(pair.hash);
  });

  it('returns positive access token expiry seconds', () => {
    expect(tokenService.getAccessTokenExpirySeconds()).toBeGreaterThan(0);
  });

  it('returns future refresh token expiry date', () => {
    const expiry = tokenService.getRefreshTokenExpiryDate();
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
  });
});
