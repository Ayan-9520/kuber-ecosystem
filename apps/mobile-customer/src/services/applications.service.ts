import { apiGet, apiGetPaginated, apiPatch, apiPost } from '@/lib/api';

export const applicationsService = {
  list: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/applications', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/applications/${id}`),
  create: (data: Record<string, unknown>) => apiPost<Record<string, unknown>>('/applications', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiPatch<Record<string, unknown>>(`/applications/${id}`, data),
  submit: (id: string, data?: Record<string, unknown>) =>
    apiPost<Record<string, unknown>>(`/applications/${id}/submit`, data ?? {}),
  timeline: (applicationId: string) =>
    apiGetPaginated<Record<string, unknown>>('/application-timeline', { applicationId, limit: 50 }),
  bankLogins: (applicationId: string) =>
    apiGetPaginated<Record<string, unknown>>('/bank-logins', { applicationId, limit: 20 }),
  creditReviews: (applicationId: string) =>
    apiGetPaginated<Record<string, unknown>>('/credit-reviews', { applicationId, limit: 20 }),
  sanctions: (applicationId: string) =>
    apiGetPaginated<Record<string, unknown>>('/sanctions', { applicationId, limit: 20 }),
  disbursements: (applicationId: string) =>
    apiGetPaginated<Record<string, unknown>>('/disbursements', { applicationId, limit: 20 }),
  eligibility: (applicationId: string) =>
    apiGetPaginated<Record<string, unknown>>('/eligibility-results', { applicationId, limit: 10 }),
};
