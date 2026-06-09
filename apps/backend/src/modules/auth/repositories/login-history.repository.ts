import { prisma } from '../../../config/database.js';

export const loginHistoryRepository = {
  create: (data: {
    userId: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    failReason?: string;
  }) => prisma.loginHistory.create({ data }),

  countRecentFailures: (userId: string, since: Date) =>
    prisma.loginHistory.count({
      where: {
        userId,
        success: false,
        createdAt: { gte: since },
      },
    }),

  findLastFailure: (userId: string) =>
    prisma.loginHistory.findFirst({
      where: { userId, success: false },
      orderBy: { createdAt: 'desc' },
    }),
};
