import { apiGet, apiGetPaginated, apiPost } from '@/lib/api';

export const documentsService = {
  list: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/documents', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/documents/${id}`),
  upload: (data: Record<string, unknown>) => apiPost<Record<string, unknown>>('/documents/upload', data),
  downloadUrl: (id: string) => apiGet<{ url: string }>(`/documents/${id}/download-url`),
  deficiencies: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/document-deficiencies', params),
  verificationResults: (documentId: string) =>
    apiGetPaginated<Record<string, unknown>>('/verification-results', { documentId, limit: 20 }),
  ocrResults: (documentId: string) =>
    apiGetPaginated<Record<string, unknown>>('/ocr-results', { documentId, limit: 20 }),
  requests: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/document-requests', params),
};
