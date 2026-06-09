import type { AuthTokens } from '@kuberone/shared-types';

import { apiGet, apiPost } from '@/lib/api';
import { getDeviceId } from '@/lib/utils';

export interface MeUser {
  id: string;
  userType: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  roles: string[];
  permissions: string[];
  dataScope: string;
  branchId?: string;
  regionId?: string;
  employeeId?: string;
  customerId?: string;
  partnerId?: string;
  lastLoginAt?: string | null;
}

export const authService = {
  login: (email: string, password: string) =>
    apiPost<AuthTokens>('/auth/login', {
      loginType: 'employee',
      email,
      password,
      device: { deviceId: getDeviceId(), platform: 'WEB' },
    }),

  sendOtp: (phone: string, purpose: 'LOGIN' | 'RESET_PASSWORD' = 'LOGIN') =>
    apiPost<{ message: string; expiresIn?: number }>('/auth/send-otp', { phone, purpose }),

  verifyOtp: (phone: string, otp: string, purpose: 'LOGIN' | 'RESET_PASSWORD' = 'LOGIN') =>
    apiPost<AuthTokens>('/auth/verify-otp', {
      phone,
      otp,
      purpose,
      device: { deviceId: getDeviceId(), platform: 'WEB' },
    }),

  me: () => apiGet<MeUser>('/auth/me'),

  logout: (refreshToken: string) => apiPost<void>('/auth/logout', { refreshToken }),
};
