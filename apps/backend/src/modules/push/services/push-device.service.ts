import type { RefreshPushTokenInput, RegisterPushDeviceInput, UnregisterPushDeviceInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { pushDeviceRepository, pushTokenRepository } from '../repositories/push.repository.js';

export const pushDeviceService = {
  async register(userId: string, input: RegisterPushDeviceInput) {
    const legacyDevice = await prisma.device.upsert({
      where: { userId_deviceId: { userId, deviceId: input.deviceId } },
      update: {
        platform: input.platform,
        fcmToken: input.fcmToken,
        appVersion: input.appVersion,
        lastActiveAt: new Date(),
      },
      create: {
        userId,
        deviceId: input.deviceId,
        platform: input.platform,
        fcmToken: input.fcmToken,
        appVersion: input.appVersion,
      },
    });

    const pushDevice = await prisma.pushDevice.upsert({
      where: {
        userId_deviceId_appTarget: {
          userId,
          deviceId: input.deviceId,
          appTarget: input.appTarget as never,
        },
      },
      update: {
        platform: input.platform,
        appVersion: input.appVersion,
        legacyDeviceId: legacyDevice.id,
        isActive: true,
        lastActiveAt: new Date(),
      },
      create: {
        userId,
        deviceId: input.deviceId,
        platform: input.platform,
        appTarget: input.appTarget as never,
        appVersion: input.appVersion,
        legacyDeviceId: legacyDevice.id,
      },
    });

    if (input.fcmToken) {
      await pushTokenRepository.deactivateForDevice(pushDevice.id);
      await pushTokenRepository.create({
        pushDevice: { connect: { id: pushDevice.id } },
        token: input.fcmToken,
        provider: 'FCM',
        isActive: true,
      });
    }

    return { pushDevice, legacyDevice };
  },

  async unregister(userId: string, input: UnregisterPushDeviceInput) {
    await pushDeviceRepository.deactivate(userId, input.deviceId, input.appTarget);
    const device = await pushDeviceRepository.findByUserDevice(
      userId,
      input.deviceId,
      input.appTarget ?? 'CUSTOMER',
    );
    if (device) await pushTokenRepository.deactivateForDevice(device.id);
    await prisma.device.updateMany({
      where: { userId, deviceId: input.deviceId },
      data: { fcmToken: null },
    });
    return { success: true };
  },

  async refreshToken(userId: string, input: RefreshPushTokenInput) {
    const device = await pushDeviceRepository.findByUserDevice(userId, input.deviceId, input.appTarget);
    if (!device) {
      const legacy = await prisma.device.findUnique({
        where: { userId_deviceId: { userId, deviceId: input.deviceId } },
      });
      return pushDeviceService.register(userId, {
        deviceId: input.deviceId,
        platform: (legacy?.platform === 'IOS' ? 'IOS' : legacy?.platform === 'WEB' ? 'WEB' : 'ANDROID'),
        fcmToken: input.fcmToken,
        appTarget: input.appTarget,
      });
    }

    await pushTokenRepository.deactivateForDevice(device.id);
    await pushTokenRepository.create({
      pushDevice: { connect: { id: device.id } },
      token: input.fcmToken,
      provider: 'FCM',
      isActive: true,
      rotatedAt: new Date(),
    });

    await prisma.device.updateMany({
      where: { userId, deviceId: input.deviceId },
      data: { fcmToken: input.fcmToken, lastActiveAt: new Date() },
    });

    return { success: true, pushDeviceId: device.id };
  },

  async listActiveTokens(userId: string, deviceId?: string, appTarget?: string) {
    const devices = deviceId
      ? [await pushDeviceRepository.findByUserDevice(userId, deviceId, appTarget ?? 'CUSTOMER')].filter(Boolean)
      : await pushDeviceRepository.listActiveForUser(userId, appTarget);

    const fromEnterprise = devices.flatMap((d) =>
      (d?.tokens ?? []).map((t) => ({
        pushDeviceId: d!.id,
        deviceId: d!.deviceId,
        platform: d!.platform,
        token: t.token,
        legacyDeviceId: d!.legacyDeviceId,
      })),
    );

    if (fromEnterprise.length > 0) return fromEnterprise;

    const legacyDevices = await prisma.device.findMany({
      where: {
        userId,
        fcmToken: { not: null },
        ...(deviceId ? { deviceId } : {}),
      },
    });

    return legacyDevices
      .filter((d) => d.fcmToken)
      .map((d) => ({
        pushDeviceId: undefined as string | undefined,
        deviceId: d.deviceId,
        platform: d.platform,
        token: d.fcmToken!,
        legacyDeviceId: d.id,
      }));
  },
};
