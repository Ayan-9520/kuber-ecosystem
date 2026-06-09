import { env } from '../../../config/env.js';

import { fcmV1Provider } from './fcm-v1.provider.js';
import type { PushProviderAdapter } from './types.js';

const mockPushProvider: PushProviderAdapter = {
  type: 'MOCK',
  send: async (_payload) => ({
    success: true,
    providerRef: `mock-push-${Date.now()}`,
    deliveryStatus: 'sent',
  }),
  sendToTopic: async () => ({
    success: true,
    providerRef: `mock-push-topic-${Date.now()}`,
    deliveryStatus: 'sent',
  }),
  subscribeToTopic: async () => ({ success: true, providerRef: 'mock-sub' }),
  unsubscribeFromTopic: async () => ({ success: true, providerRef: 'mock-unsub' }),
};

function hasFcmConfig(): boolean {
  return Boolean(
    env.FCM_SERVER_KEY ||
      (env.FCM_CLIENT_EMAIL && env.FCM_PRIVATE_KEY && (env.FCM_PROJECT_ID || env.FIREBASE_PROJECT_ID)),
  );
}

export function resolveEnterprisePushProvider(dbType?: string): PushProviderAdapter {
  const type = (dbType ?? env.PUSH_PROVIDER).toUpperCase();

  if (type === 'FCM' && hasFcmConfig()) return fcmV1Provider;
  if (env.PUSH_PROVIDER === 'fcm' && hasFcmConfig()) return fcmV1Provider;
  if (hasFcmConfig()) return fcmV1Provider;

  return mockPushProvider;
}
