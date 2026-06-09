import { deviceRepository } from '../repositories/device.repository.js';
import type { AuthDeviceInput } from '../types/auth.types.js';

export const deviceService = {
  async registerDevice(userId: string, device?: AuthDeviceInput): Promise<void> {
    if (!device) return;

    await deviceRepository.upsert({
      userId,
      deviceId: device.deviceId,
      platform: device.platform,
      fcmToken: device.fcmToken,
      appVersion: device.appVersion,
    });
  },
};
