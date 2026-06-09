import type {
  KnowledgeApprovalAction,
  KnowledgeContentType,
  KnowledgeLifecycleStatus,
} from '@kuberone/database';

export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface KnowledgeArticleSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  contentType: KnowledgeContentType;
  categoryId: string;
  categoryName?: string;
  status: KnowledgeLifecycleStatus;
  currentVersion: number;
  viewCount: number;
  publishedAt: string | null;
  tags?: Array<{ id: string; code: string; name: string }>;
  productCode?: string | null;
  lenderCode?: string | null;
}

export interface KnowledgeArticleDetail extends KnowledgeArticleSummary {
  content: string;
  searchKeywords: string | null;
  department: string | null;
  riskCategory: string | null;
  authorId: string | null;
  versions?: Array<{ version: number; changeNotes: string | null; createdAt: string }>;
  attachments?: Array<{ id: string; fileName: string; fileType: string }>;
}

export interface KnowledgeSearchResult {
  items: KnowledgeArticleSummary[];
  meta: { total: number; page: number; limit: number; searchType: string };
  facets?: {
    categories: Array<{ id: string; name: string; count: number }>;
    contentTypes: Array<{ type: string; count: number }>;
    tags: Array<{ id: string; name: string; count: number }>;
  };
}

export interface AiKnowledgeContext {
  snippets: Array<{
    id: string;
    title: string;
    summary: string;
    content: string;
    contentType: KnowledgeContentType;
    categoryCode?: string;
    tags: string[];
    relevanceScore: number;
  }>;
  policies: string[];
  faqs: string[];
  scripts: string[];
  source: string;
  generatedAt: string;
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

export interface ApprovalRecord {
  id: string;
  articleId: string;
  version: number;
  action: KnowledgeApprovalAction;
  actorId: string;
  actorRole: string;
  comments: string | null;
  createdAt: string;
}
