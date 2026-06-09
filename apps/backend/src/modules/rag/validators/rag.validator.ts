import { z } from 'zod';

const sourceTypes = ['KNOWLEDGE_ARTICLE', 'PDF', 'DOCX', 'TXT', 'MD', 'HTML', 'POLICY', 'FAQ', 'SOP', 'PRODUCT_GUIDELINE', 'ELIGIBILITY_RULE', 'LENDER_POLICY'] as const;
const querySources = ['AI_ADVISOR', 'VOICE_AI', 'COPILOT', 'RECOMMENDATION', 'ADMIN', 'API'] as const;

export const ingestSchema = z.object({
  title: z.string().min(3).max(300),
  sourceType: z.enum(sourceTypes),
  sourceId: z.string().uuid().optional(),
  content: z.string().min(10),
  fileName: z.string().max(255).optional(),
  mimeType: z.string().max(100).optional(),
  categoryCode: z.string().max(50).optional(),
  productCode: z.string().max(50).optional(),
  lenderCode: z.string().max(50).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const ingestArticleSchema = z.object({
  articleId: z.string().uuid(),
  force: z.boolean().optional(),
});

export const ingestAllPublishedSchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

export const searchSchema = z.object({
  q: z.string().min(1).max(2000),
  topK: z.coerce.number().int().min(1).max(20).default(5),
  source: z.enum(querySources).default('API'),
  categoryCode: z.string().optional(),
  productCode: z.string().optional(),
  lenderCode: z.string().optional(),
  rerank: z.coerce.boolean().optional(),
});

export const querySchema = z.object({
  q: z.string().min(1).max(2000),
  source: z.enum(querySources).default('API'),
  topK: z.coerce.number().int().min(1).max(10).default(5),
  categoryCode: z.string().optional(),
  productCode: z.string().optional(),
  lenderCode: z.string().optional(),
  generateAnswer: z.coerce.boolean().default(true),
});

export const contextSchema = z.object({
  q: z.string().max(2000).optional(),
  source: z.enum(querySources).default('AI_ADVISOR'),
  topK: z.coerce.number().int().min(1).max(15).default(8),
  productCode: z.string().optional(),
  lenderCode: z.string().optional(),
  categoryCode: z.string().optional(),
});

export const feedbackSchema = z.object({
  responseId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  helpful: z.boolean().optional(),
  comment: z.string().max(2000).optional(),
});

export const analyticsQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const documentParamSchema = z.object({ id: z.string().uuid() });

export const listDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'PROCESSING', 'INDEXED', 'FAILED', 'ARCHIVED']).optional(),
});
