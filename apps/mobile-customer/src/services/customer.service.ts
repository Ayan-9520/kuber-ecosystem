import { apiGet, apiGetPaginated, apiPatch, apiPost, apiPut } from '@/lib/api';

export const customerService = {
  getById: (id: string) => apiGet<Record<string, unknown>>(`/customers/${id}`),
  update: (id: string, data: Record<string, unknown>) => apiPatch(`/customers/${id}`, data),
  profile: (customerId: string) => apiGet<Record<string, unknown>>('/customer-profiles', { customerId }),
  upsertProfile: (data: Record<string, unknown>) => apiPut('/customer-profiles', data),
  addresses: (customerId: string) =>
    apiGetPaginated<Record<string, unknown>>('/customer-addresses', { customerId, limit: 20 }),
  employment: (customerId: string) =>
    apiGetPaginated<Record<string, unknown>>('/customer-employment', { customerId, limit: 20 }),
  income: (customerId: string) =>
    apiGetPaginated<Record<string, unknown>>('/customer-income', { customerId, limit: 20 }),
  preferences: (customerId: string) =>
    apiGetPaginated<Record<string, unknown>>('/notification-preferences', { userId: customerId, limit: 50 }),
};

export const kycService = {
  profile: (customerId?: string) =>
    apiGet<Record<string, unknown>>('/kyc/profile', customerId ? { customerId } : undefined),
  upsertProfile: (data: Record<string, unknown>) => apiPost('/kyc/profile', data),
  submitPan: (data: { customerId?: string; pan: string; nameOnPan?: string }) =>
    apiPost('/kyc/pan', data),
  getPan: (customerId?: string) =>
    apiGet<Record<string, unknown>[]>('/kyc/pan', customerId ? { customerId } : undefined),
  sendAadhaarOtp: (data: { customerId?: string; aadhaar: string }) =>
    apiPost('/kyc/aadhaar/send-otp', data),
  verifyAadhaar: (data: { customerId?: string; aadhaar: string; otp: string }) =>
    apiPost('/kyc/aadhaar/verify', data),
};
