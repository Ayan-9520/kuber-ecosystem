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
  partnerId?: string | null;
  branchId?: string | null;
  lastLoginAt?: string | null;
}

async function devicePayload() {
  const deviceId = await getOrCreateDeviceId();
  const platform = Platform.OS === 'ios' ? ('IOS' as const) : ('ANDROID' as const);
  return { deviceId, platform, appVersion: '1.0.0' };
}

export const authService = {
  sendOtp: (phone: string, purpose: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' = 'LOGIN') =>
    apiPost<{ message: string }>('/auth/send-otp', { phone, purpose }),

  /** Mobile / email / partner code — same as kuberfinserve.com/partner-login */
  partnerOtpRequest: (identifier: string) =>
    apiPost<{
      message?: string;
      phone_hint?: string;
      email_hint?: string;
      email_sent?: boolean;
      otp_sent?: boolean;
      phone_bypass_otp?: string;
      dev_otp?: string;
    }>('/auth/partner/otp-request', {
      mode: 'otp_request',
      identifier: identifier.trim().replace(/\.+$/, ''),
    }),

  partnerOtpVerify: async (identifier: string, otp: string) =>
    apiPost<AuthTokens & { partner?: { partner_id?: string; phone?: string } }>(
      '/auth/partner/otp-verify',
      {
        mode: 'otp',
        identifier: identifier.trim().replace(/\.+$/, ''),
        otp,
      },
    ),

  verifyOtp: async (phone: string, otp: string, purpose: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' = 'LOGIN') =>
    apiPost<AuthTokens>('/auth/verify-otp', {
      phone,
      otp,
      purpose,
      device: await devicePayload(),
    }),

  partnerLogin: async (phone: string, otp: string) =>
    apiPost<AuthTokens>('/auth/login', {
      loginType: 'partner',
      phone,
      otp,
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
