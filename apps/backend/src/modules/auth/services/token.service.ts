import type { JwtPayload } from '@kuberone/shared-types';
import jwt from 'jsonwebtoken';


import { env } from '../../../config/env.js';
import { generateRefreshToken, hashTokenSha256 } from '../../../shared/utils/crypto.js';
import type { AuthContext } from '../types/auth.types.js';

function parseExpiryToSeconds(expiry: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiry);
  if (!match) return 900;
  const value = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      return 900;
  }
}

export const tokenService = {
  getAccessTokenExpirySeconds: () => parseExpiryToSeconds(env.JWT_ACCESS_EXPIRY),

  getRefreshTokenExpiryDate: () => {
    const days = env.REFRESH_TOKEN_EXPIRY_DAYS;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  },

  buildJwtPayload(context: AuthContext, sessionId: string): JwtPayload {
    return {
      sub: context.userId,
      userType: context.userType,
      email: context.email ?? undefined,
      phone: context.phone ?? undefined,
      roles: context.roles,
      permissions: context.permissions,
      dataScope: context.dataScope,
      sessionId,
      branchId: context.branchId,
      regionId: context.regionId,
      partnerId: context.partnerId,
      customerId: context.customerId,
      employeeId: context.employeeId,
    };
  },

  issueAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
    });
  },

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    }) as JwtPayload;
  },

  createRefreshTokenPair(): { plain: string; hash: string } {
    const plain = generateRefreshToken();
    const hash = hashTokenSha256(plain);
    return { plain, hash };
  },

  hashRefreshToken(plain: string): string {
    return hashTokenSha256(plain);
  },
};
