import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const commissionsService = {
  ledger: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/commission-ledger', params),
  ledgerById: (id: string) => apiGet<Record<string, unknown>>(`/commission-ledger/${id}`),
  approvals: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/commission-approvals', params),
  approvalById: (id: string) => apiGet<Record<string, unknown>>(`/commission-approvals/${id}`),
  payments: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/commission-payments', params),
  recoveries: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/commission-recoveries', params),
  adjustments: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/commission-adjustments', params),
  analytics: (params?: Record<string, unknown>) =>
    apiGet<Record<string, unknown>>('/commission-analytics', params),
  requestApproval: (ledgerId: string, notes?: string) =>
    apiPost<Record<string, unknown>>('/commission-approvals', { ledgerId, notes }),
};
