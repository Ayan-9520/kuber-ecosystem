import { apiGet, apiPost } from '@/lib/api';

export interface RagAnalytics {
  totalQueries: number;
  totalRetrievals: number;
  avgLatencyMs: number;
  avgFeedbackRating: number;
  retrievalAccuracy: number;
  searchEffectiveness: number;
  topDocuments: Array<{ id: string; title: string; retrievalCount: number }>;
  topCategories: Array<{ code: string; count: number }>;
  queriesBySource: Record<string, number>;
}

export interface RagDocument {
  id: string;
  title: string;
  sourceType: string;
  status: string;
  ingestionStatus: string;
  chunkCount: number;
  embeddingCount: number;
  indexedAt: string | null;
}

export const ragService = {
  analytics: (params?: Record<string, unknown>) => apiGet<RagAnalytics>('/rag/analytics', params),

  documents: (params?: Record<string, unknown>) =>
    apiGet<{ items: RagDocument[]; meta: { total: number } }>('/rag/documents', params),

  getDocument: (id: string) => apiGet<RagDocument & { chunks?: Array<{ id: string; chunkIndex: number; content: string }> }>(`/rag/documents/${id}`),

  ingest: (data: unknown) => apiPost('/rag/ingest', data),

  ingestArticle: (articleId: string) => apiPost('/rag/ingest/article', { articleId }),

  ingestAllPublished: (limit = 100) => apiPost('/rag/ingest/published', { limit }),

  search: (params: Record<string, unknown>) =>
    apiGet<{ chunks: Array<{ chunkId: string; documentTitle: string; content: string; score: number }> }>('/rag/search', params),

  query: (data: unknown) => apiPost<{ answer: string; context: { snippets: string[] } }>('/rag/query', data),

  context: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/rag/context', params),

  feedback: (data: unknown) => apiPost('/rag/feedback', data),
};
