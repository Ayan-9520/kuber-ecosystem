import { Platform } from 'react-native';

import { apiPost } from '@/lib/api';
import { getOrCreateDeviceId } from '@/lib/storage';

const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

async function devicePayload() {
  const deviceId = await getOrCreateDeviceId();
  return { deviceId, platform, appVersion: '1.0.0', appTarget: 'DSA' as const };
}

export const pushService = {
  registerDevice: async (fcmToken?: string) =>
    apiPost<void>('/push/register-device', { ...(await devicePayload()), fcmToken }),

  refreshToken: async (fcmToken: string) =>
    apiPost<void>('/push/refresh-token', { ...(await devicePayload()), fcmToken }),

  unregisterDevice: async () =>
    apiPost<void>('/push/unregister-device', { deviceId: await getOrCreateDeviceId(), appTarget: 'DSA' }),

  subscribeDsaTopics: async () => {
    await pushService.subscribeTopic('dsa_leads');
    await pushService.subscribeTopic('dsa_commission');
  },

  subscribeTopic: (topicCode: string) =>
    apiPost<void>('/push/subscribe', { topicCode }),

  unsubscribeTopic: (topicCode: string) =>
    apiPost<void>('/push/unsubscribe', { topicCode }),

  trackOpen: (deliveryId: string) =>
    apiPost<void>('/push/track', { deliveryId, eventType: 'OPENED' }),
};
