import type { AuthTokens } from '@kuberone/shared-types';
import { Platform } from 'react-native';

import { apiGet, apiPost } from '@/lib/api';
import { getOrCreateDeviceId } from '@/lib/storage';

export interface MeUser {
  id: string;
  userType: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  roles: string[];
  permissions: string[];
  dataScope: string;
  customerId?: string | null;
  lastLoginAt?: string | null;
}

async function devicePayload() {
  const deviceId = await getOrCreateDeviceId();
  const platform =
    Platform.OS === 'ios' ? ('IOS' as const) : Platform.OS === 'android' ? ('ANDROID' as const) : ('WEB' as const);
  return { deviceId, platform, appVersion: '1.0.0' };
}

export const authService = {
  sendOtp: (phone: string, purpose: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' = 'LOGIN') =>
    apiPost<{ message: string }>('/auth/send-otp', { phone, purpose }),

  verifyOtp: async (phone: string, otp: string, purpose: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' = 'LOGIN') =>
    apiPost<AuthTokens>('/auth/verify-otp', {
      phone,
      otp,
      purpose,
      device: await devicePayload(),
    }),

  me: () => apiGet<MeUser>('/auth/me'),

  logout: async (refreshToken: string) => apiPost<void>('/auth/logout', { refreshToken }),

  registerDevice: async (fcmToken?: string) =>
    apiPost<void>('/push/register-device', {
      ...(await devicePayload()),
      fcmToken,
    }),
};
