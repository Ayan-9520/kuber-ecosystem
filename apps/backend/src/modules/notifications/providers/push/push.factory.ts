import { env } from '../../../../config/env.js';
import { rejectMockProviderInProduction } from '../provider-guard.js';
import type { PushProvider } from '../types.js';

import { fcmProvider } from './fcm.provider.js';
import { mockPushProvider } from './mock.provider.js';

export function resolvePushProvider(): PushProvider {
  if (env.FCM_SERVER_KEY || env.FIREBASE_PROJECT_ID) return fcmProvider;
  rejectMockProviderInProduction(env, 'Push', 'mock');
  return mockPushProvider;
}
