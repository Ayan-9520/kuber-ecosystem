import { apiGet, apiGetPaginated, apiPatch, apiPost } from '@/lib/api';

export const uatService = {
  dashboard: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/uat/dashboard', params),

  plans: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/uat/plans', params),
  plan: (id: string) => apiGet<Record<string, unknown>>(`/uat/plans/${id}`),
  createPlan: (data: unknown) => apiPost('/uat/plans', data),
  updatePlan: (id: string, data: unknown) => apiPatch(`/uat/plans/${id}`, data),

  cycles: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/uat/cycles', params),
  cycle: (id: string) => apiGet<Record<string, unknown>>(`/uat/cycles/${id}`),
  createCycle: (data: unknown) => apiPost('/uat/cycles', data),
  updateCycle: (id: string, data: unknown) => apiPatch(`/uat/cycles/${id}`, data),
  qualityGates: (cycleId: string) =>
    apiGet<Record<string, unknown>>(`/uat/cycles/${cycleId}/quality-gates`),
  readiness: (cycleId: string) =>
    apiGet<Record<string, unknown>>(`/uat/cycles/${cycleId}/readiness`),

  scenarios: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/uat/scenarios', params),
  scenario: (id: string) => apiGet<Record<string, unknown>>(`/uat/scenarios/${id}`),

  testCases: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/uat/test-cases', params),
  testCase: (id: string) => apiGet<Record<string, unknown>>(`/uat/test-cases/${id}`),

  executions: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/uat/executions', params),
  executeTestCase: (data: unknown) => apiPost('/uat/executions', data),

  defects: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/uat/defects', params),
  createDefect: (data: unknown) => apiPost('/uat/defects', data),
  updateDefect: (id: string, data: unknown) => apiPatch(`/uat/defects/${id}`, data),

  signoffs: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/uat/signoffs', params),
  submitSignoff: (data: unknown) => apiPost('/uat/signoffs', data),

  approvals: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/uat/approvals', params),
  submitApproval: (data: unknown) => apiPost('/uat/approvals', data),

  reviews: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/uat/reviews', params),
  updateReview: (data: unknown) => apiPost('/uat/reviews', data),

  risks: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/uat/risks', params),
  createRisk: (data: unknown) => apiPost('/uat/risks', data),

  status: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/uat/status', params),

  templates: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/uat/templates', params),

  reports: {
    summary: (params?: Record<string, unknown>) =>
      apiGet<Record<string, unknown>>('/uat/reports/summary', params),
    defects: (params?: Record<string, unknown>) =>
      apiGet<Record<string, unknown>>('/uat/reports/defects', params),
    moduleReadiness: (params?: Record<string, unknown>) =>
      apiGet<Record<string, unknown>>('/uat/reports/module-readiness', params),
    businessReadiness: (params?: Record<string, unknown>) =>
      apiGet<Record<string, unknown>>('/uat/reports/business-readiness', params),
    signoff: (params?: Record<string, unknown>) =>
      apiGet<Record<string, unknown>>('/uat/reports/signoff', params),
    finalSignoff: (params?: Record<string, unknown>) =>
      apiGet<Record<string, unknown>>('/uat/reports/final-signoff', params),
  },
};
