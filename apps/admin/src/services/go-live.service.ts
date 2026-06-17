import { apiGet, apiGetPaginated, apiPatch, apiPost } from '@/lib/api';

export const goLiveService = {
  readiness: () => apiGet<Record<string, unknown>>('/go-live/readiness'),
  dashboard: () => apiGet<Record<string, unknown>>('/go-live/dashboard'),
  status: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/go-live/status', params),
  checklist: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/go-live/checklist', params),
  updateChecklistItem: (itemCode: string, data: unknown) =>
    apiPatch(`/go-live/checklist/${itemCode}`, data),
  approvals: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/go-live/approvals', params),
  decideApproval: (launchId: string, approvalType: string, data: unknown) =>
    apiPost(`/go-live/approvals/${launchId}/${approvalType}`, data),
  startLaunch: (data?: unknown) => apiPost('/go-live/launch', data ?? {}),
  completeLaunch: (data: unknown) => apiPost('/go-live/launch/complete', data),
  advanceWorkflow: (data?: unknown) => apiPost('/go-live/launch/advance', data ?? {}),
  runSmokeTests: (data?: unknown) => apiPost('/go-live/launch/smoke-tests', data ?? {}),
  events: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/go-live/events', params),
  incidents: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/go-live/incidents', params),
  createIncident: (data: unknown) => apiPost('/go-live/incidents', data),
  metrics: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/go-live/metrics', params),
  snapshotMetrics: (data?: unknown) => apiPost('/go-live/metrics/snapshot', data ?? {}),
  warRoom: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/go-live/war-room', params),
  activateWarRoom: (data?: unknown) => apiPost('/go-live/war-room/activate', data ?? {}),
  reports: () => apiGet<Record<string, unknown>>('/go-live/reports'),
  executionReports: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/go-live/reports/execution', params),
};
