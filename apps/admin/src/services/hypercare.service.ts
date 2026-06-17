import { apiGet, apiPatch, apiPost } from '@/lib/api';

export const hypercareService = {
  status: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/hypercare/status', params),
  incidents: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/hypercare/incidents', params),
  createIncident: (data: unknown) => apiPost('/hypercare/incidents', data),
  updateIncident: (incidentId: string, data: unknown) =>
    apiPatch(`/hypercare/incidents/${incidentId}`, data),
  issues: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/hypercare/issues', params),
  createIssue: (data: unknown) => apiPost('/hypercare/issues', data),
  updateIssue: (issueId: string, data: unknown) =>
    apiPatch(`/hypercare/issues/${issueId}`, data),
  metrics: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/hypercare/metrics', params),
  snapshotMetrics: (data?: unknown) => apiPost('/hypercare/metrics/snapshot', data ?? {}),
  reports: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/hypercare/reports', params),
  createRca: (data: unknown) => apiPost('/hypercare/rca', data),
};
