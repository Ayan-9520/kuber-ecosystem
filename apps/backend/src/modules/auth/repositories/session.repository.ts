import { prisma } from '../../../config/database.js';

export const sessionRepository = {
  create: (data: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }) => prisma.session.create({ data }),

  findActiveById: (sessionId: string) =>
    prisma.session.findFirst({
      where: {
        id: sessionId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    }),

  revoke: (sessionId: string) =>
    prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    }),

  revokeAllForUser: (userId: string) =>
    prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    }),

  listActiveForUser: (userId: string) =>
    prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    }),
};
