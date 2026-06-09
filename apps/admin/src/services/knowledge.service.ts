import { apiGet, apiPatch, apiPost } from '@/lib/api';

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content?: string;
  contentType: string;
  categoryId: string;
  categoryName?: string;
  status: string;
  currentVersion: number;
  viewCount: number;
  publishedAt: string | null;
  tags?: Array<{ id: string; code: string; name: string }>;
  productCode?: string | null;
  lenderCode?: string | null;
}

export interface KnowledgeAnalytics {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  pendingReview: number;
  totalViews: number;
  totalSearches: number;
  averageFeedbackRating: number;
  mostViewed: Array<{ id: string; title: string; viewCount: number }>;
  mostUsedPolicies: Array<{ id: string; title: string; viewCount: number }>;
  searchTrends: Array<{ query: string; count: number }>;
  departmentUsage: Array<{ department: string; views: number }>;
  contentTypeDistribution: Record<string, number>;
}

export const knowledgeService = {
  categories: (params?: Record<string, unknown>) =>
    apiGet<{ items: Array<{ id: string; code: string; name: string; articleCount: number }> }>('/knowledge/categories', params),

  articles: (params?: Record<string, unknown>) =>
    apiGet<{ items: KnowledgeArticle[]; meta: { total: number; page: number; limit: number } }>('/knowledge/articles', params),

  getArticle: (id: string) => apiGet<KnowledgeArticle>(`/knowledge/articles/${id}`),

  createArticle: (data: unknown) => apiPost('/knowledge/articles', data),

  updateArticle: (id: string, data: unknown) => apiPatch(`/knowledge/articles/${id}`, data),

  search: (params: Record<string, unknown>) =>
    apiGet<{ items: KnowledgeArticle[]; meta: { total: number; searchType: string } }>('/knowledge/search', params),

  tags: (params?: Record<string, unknown>) =>
    apiGet<{ items: Array<{ id: string; code: string; name: string; tagGroup: string }> }>('/knowledge/tags', params),

  createTag: (data: unknown) => apiPost('/knowledge/tags', data),

  createCategory: (data: unknown) => apiPost('/knowledge/categories', data),

  approvals: (params?: Record<string, unknown>) =>
    apiGet<{ items: Array<Record<string, unknown>> }>('/knowledge/approvals', params),

  submitApproval: (data: unknown) => apiPost('/knowledge/approvals', data),

  reviews: (params?: Record<string, unknown>) =>
    apiGet<{ items: Array<Record<string, unknown>> }>('/knowledge/reviews', params),

  createReview: (data: unknown) => apiPost('/knowledge/reviews', data),

  feedback: (data: unknown) => apiPost('/knowledge/feedback', data),

  analytics: (params?: Record<string, unknown>) => apiGet<KnowledgeAnalytics>('/knowledge/analytics', params),

  aiContext: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/knowledge/context', params),
};
