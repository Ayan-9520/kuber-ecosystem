import { apiGet, apiGetPaginated, apiPatch, apiPost } from '@/lib/api';

export const leadsService = {
  list: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/leads', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/leads/${id}`),
  create: (data: Record<string, unknown>) => apiPost<Record<string, unknown>>('/leads', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiPatch<Record<string, unknown>>(`/leads/${id}`, data),
  analytics: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/lead-analytics', params),
  timeline: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/lead-timeline', params),
  scores: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/lead-scores', params),
  notes: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/lead-notes', params),
  activities: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/lead-activities', params),
  sources: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/lead-sources', params ?? {}),
};
