import { prisma } from '../../../config/database.js';

export const refreshTokenRepository = {
  create: (data: {
    userId: string;
    sessionId: string;
    tokenHash: string;
    expiresAt: Date;
  }) => prisma.refreshToken.create({ data }),

  findValidByHash: (tokenHash: string) =>
    prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        session: true,
        user: true,
      },
    }),

  findByHash: (tokenHash: string) =>
    prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: { session: true, user: true },
    }),

  revoke: (id: string) =>
    prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    }),

  revokeBySession: (sessionId: string) =>
    prisma.refreshToken.updateMany({
      where: {
        sessionId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    }),

  revokeAllForUser: (userId: string) =>
    prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    }),
};
