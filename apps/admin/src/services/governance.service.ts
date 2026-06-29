import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';
import { resolveApiBaseUrl } from '@/lib/api-config';
import { tokenStorage } from '@/lib/token-storage';

export const governanceService = {
  // Audit
  auditDashboard: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/audit/events/dashboard', params),
  auditEvents: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/audit/events', params),
  auditEvent: (id: string) => apiGet<Record<string, unknown>>(`/audit/events/${id}`),
  exportAuditEvents: async (params: Record<string, unknown>) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    const token = tokenStorage.getAccessToken();
    const base = resolveApiBaseUrl();
    const res = await fetch(`${base}/audit/export?${qs}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.blob();
  },
  auditReports: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/audit/reports', params ?? {}),
  createAuditReport: (data: unknown) => apiPost('/audit/reports', data),

  // Compliance
  complianceDashboard: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/compliance/dashboard', params),
  violations: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/compliance/violations', params),
  resolveViolation: (data: unknown) => apiPost('/compliance/violations/resolve', data),
  complianceReports: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/compliance/reports', params ?? {}),
  complianceRules: () => apiGet<Record<string, unknown>[]>('/compliance/rules'),
  retentionPolicies: () => apiGet<Record<string, unknown>[]>('/compliance/retention-policies'),

  // Risk
  riskDashboard: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/risk/dashboard', params),
  riskRegister: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/risk/register', params),
  createRisk: (data: unknown) => apiPost('/risk/register', data),
  riskItem: (id: string) => apiGet<Record<string, unknown>>(`/risk/register/${id}`),
  createAssessment: (data: unknown) => apiPost('/risk/assessments', data),
  riskEvents: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/risk/events', params ?? {}),

  // Security
  securityDashboard: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/security/dashboard', params),
  securityEvents: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/security/events', params),
  securityAlerts: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/security/alerts', params),
  updateAlert: (data: unknown) => apiPost('/security/alerts/update', data),
  aiGovernance: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/security/ai-governance', params),
};
