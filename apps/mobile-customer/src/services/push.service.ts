import { Platform } from 'react-native';

import { apiPost } from '@/lib/api';
import { getOrCreateDeviceId } from '@/lib/storage';

const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

async function devicePayload(appTarget: 'CUSTOMER' | 'DSA' = 'CUSTOMER') {
  const deviceId = await getOrCreateDeviceId();
  return { deviceId, platform, appVersion: '1.0.0', appTarget };
}

export const pushService = {
  registerDevice: async (fcmToken?: string) =>
    apiPost<void>('/push/register-device', { ...(await devicePayload('CUSTOMER')), fcmToken }),

  refreshToken: async (fcmToken: string) =>
    apiPost<void>('/push/refresh-token', { ...(await devicePayload('CUSTOMER')), fcmToken }),

  unregisterDevice: async () =>
    apiPost<void>('/push/unregister-device', { deviceId: await getOrCreateDeviceId(), appTarget: 'CUSTOMER' }),

  subscribeTopic: (topicCode: string) =>
    apiPost<void>('/push/subscribe', { topicCode }),

  unsubscribeTopic: (topicCode: string) =>
    apiPost<void>('/push/unsubscribe', { topicCode }),

  trackOpen: (deliveryId: string) =>
    apiPost<void>('/push/track', { deliveryId, eventType: 'OPENED' }),

  trackClick: (deliveryId: string, metadata?: Record<string, unknown>) =>
    apiPost<void>('/push/track', { deliveryId, eventType: 'CLICKED', metadata }),
};
