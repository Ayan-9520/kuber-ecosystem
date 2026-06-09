import { prisma } from '../../../config/database.js';

export const otpRepository = {
  create: (data: {
    userId?: string;
    phone: string;
    otpHash: string;
    purpose: string;
    expiresAt: Date;
  }) => prisma.otpVerification.create({ data }),

  findLatestValid: (phone: string, purpose: string) =>
    prisma.otpVerification.findFirst({
      where: {
        phone,
        purpose,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    }),

  findRecentByPhone: (phone: string, purpose: string, since: Date) =>
    prisma.otpVerification.findFirst({
      where: {
        phone,
        purpose,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
    }),

  incrementAttempts: (id: string) =>
    prisma.otpVerification.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    }),

  markVerified: (id: string) =>
    prisma.otpVerification.update({
      where: { id },
      data: { verifiedAt: new Date() },
    }),

  countRecentByPhone: (phone: string, since: Date) =>
    prisma.otpVerification.count({
      where: { phone, createdAt: { gte: since } },
    }),

  invalidatePending: (phone: string, purpose: string) =>
    prisma.otpVerification.updateMany({
      where: {
        phone,
        purpose,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { expiresAt: new Date() },
    }),
};
