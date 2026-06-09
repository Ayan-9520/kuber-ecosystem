import { TRANSACTIONAL_EVENTS } from '../constants/notifications.constants.js';
import { notificationPreferenceRepository } from '../repositories/notification.repository.js';

export const preferenceEngineService = {
  async isChannelEnabled(userId: string, eventType: string, channel: string): Promise<boolean> {
    if (TRANSACTIONAL_EVENTS.has(eventType)) {
      return true;
    }

    const pref = await notificationPreferenceRepository.findUnique(userId, eventType, channel);
    if (!pref) return true;
    return pref.enabled;
  },

  async filterEnabledChannels(userId: string, eventType: string, channels: string[]): Promise<string[]> {
    const results = await Promise.all(
      channels.map(async (channel) => ((await preferenceEngineService.isChannelEnabled(userId, eventType, channel)) ? channel : null)),
    );
    return results.filter((c): c is string => c !== null);
  },
};
