import { z } from 'zod';

const contentTypes = ['ARTICLE', 'POLICY', 'FAQ', 'SOP', 'TRAINING_MATERIAL', 'SCRIPT', 'VIDEO_METADATA', 'DOCUMENT_METADATA'] as const;
const lifecycleStatuses = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] as const;

export const listCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  parentId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createCategorySchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(150),
  description: z.string().max(2000).optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const listArticlesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(lifecycleStatuses).optional(),
  contentType: z.enum(contentTypes).optional(),
  categoryId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  productCode: z.string().optional(),
  lenderCode: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'viewCount', 'publishedAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createArticleSchema = z.object({
  title: z.string().min(3).max(300),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/).optional(),
  summary: z.string().max(2000).optional(),
  content: z.string().min(10),
  contentType: z.enum(contentTypes),
  categoryId: z.string().uuid(),
  searchKeywords: z.string().max(1000).optional(),
  department: z.string().max(100).optional(),
  productCode: z.string().max(50).optional(),
  lenderCode: z.string().max(50).optional(),
  riskCategory: z.string().max(50).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updateArticleSchema = createArticleSchema.partial().extend({
  changeNotes: z.string().max(500).optional(),
});

export const articleParamSchema = z.object({ id: z.string().uuid() });

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(500),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  searchType: z.enum(['fulltext', 'keyword', 'category', 'tag', 'semantic']).default('fulltext'),
  categoryId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  contentType: z.enum(contentTypes).optional(),
  productCode: z.string().optional(),
  lenderCode: z.string().optional(),
});

export const listTagsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  tagGroup: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createTagSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(100),
  tagGroup: z.string().min(2).max(50),
  color: z.string().max(20).optional(),
});

export const feedbackSchema = z.object({
  articleId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  helpful: z.boolean().optional(),
});

export const reviewSchema = z.object({
  articleId: z.string().uuid(),
  rating: z.number().int().min(1).max(5).optional(),
  comments: z.string().max(2000).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'REJECTED']).optional(),
});

export const approvalActionSchema = z.object({
  articleId: z.string().uuid(),
  action: z.enum(['SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED', 'ROLLED_BACK']),
  comments: z.string().max(2000).optional(),
  version: z.number().int().optional(),
});

export const listApprovalsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(['REVIEW', 'APPROVED']).optional(),
});

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(['PENDING', 'COMPLETED', 'REJECTED']).optional(),
});

export const aiContextQuerySchema = z.object({
  source: z.enum(['AI_ADVISOR', 'VOICE_AI', 'COPILOT', 'RECOMMENDATION', 'RAG']).default('AI_ADVISOR'),
  productCode: z.string().optional(),
  lenderCode: z.string().optional(),
  categoryCode: z.string().optional(),
  contentTypes: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(20).default(8),
  query: z.string().max(500).optional(),
});

export const analyticsQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const rollbackSchema = z.object({
  version: z.number().int().min(1),
});
