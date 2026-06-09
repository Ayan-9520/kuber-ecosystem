import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const documentsService = {
  list: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/documents', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/documents/${id}`),
  upload: (data: Record<string, unknown>) => apiPost<Record<string, unknown>>('/documents/upload', data),
  deficiencies: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/document-deficiencies', params),
  verificationResults: (documentId: string) =>
    apiGetPaginated<Record<string, unknown>>('/verification-results', { documentId, limit: 20 }),
  types: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/document-types', params ?? {}),
  requests: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/document-requests', params),
};
