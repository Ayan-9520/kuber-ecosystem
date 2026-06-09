import { prisma } from '../../../config/database.js';

export const deviceRepository = {
  upsert: (data: {
    userId: string;
    deviceId: string;
    platform: string;
    fcmToken?: string;
    appVersion?: string;
  }) =>
    prisma.device.upsert({
      where: {
        userId_deviceId: {
          userId: data.userId,
          deviceId: data.deviceId,
        },
      },
      update: {
        platform: data.platform,
        fcmToken: data.fcmToken,
        appVersion: data.appVersion,
        lastActiveAt: new Date(),
      },
      create: {
        userId: data.userId,
        deviceId: data.deviceId,
        platform: data.platform,
        fcmToken: data.fcmToken,
        appVersion: data.appVersion,
      },
    }),

  listByUser: (userId: string) =>
    prisma.device.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' },
    }),
};
