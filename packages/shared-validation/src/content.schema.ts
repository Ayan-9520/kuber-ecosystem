import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const contentTypes = [
  'EMAIL',
  'SMS',
  'WHATSAPP',
  'PUSH',
  'CAMPAIGN',
  'LANDING_PAGE',
  'BLOG',
  'FAQ',
  'KNOWLEDGE_ARTICLE',
  'SALES_SCRIPT',
  'CALL_SCRIPT',
  'FOLLOW_UP',
  'REFERRAL_CAMPAIGN',
  'COMMISSION_COMMUNICATION',
  'SUPPORT_RESPONSE',
  'ONBOARDING',
  'TRAINING',
  'SOCIAL_MEDIA',
] as const;

export const contentModes = [
  'GENERATE',
  'REWRITE',
  'EXPAND',
  'SUMMARIZE',
  'TRANSLATE',
  'OPTIMIZE',
  'PERSONALIZE',
  'AB_VARIANT',
] as const;

export const contentLanguages = ['EN', 'HI', 'HINGLISH'] as const;
export const contentTones = [
  'PROFESSIONAL',
  'PREMIUM_FINTECH',
  'SALES',
  'SUPPORT',
  'FORMAL',
  'FRIENDLY',
  'URGENT',
  'PROMOTIONAL',
] as const;

export const contentWorkflowStatuses = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] as const;

const personalizationSchema = z.object({
  customerName: z.string().optional(),
  product: z.string().optional(),
  loanAmount: z.number().optional(),
  leadScore: z.number().optional(),
  applicationStatus: z.string().optional(),
  region: z.string().optional(),
  branch: z.string().optional(),
  partnerType: z.string().optional(),
  campaignType: z.string().optional(),
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  ticketId: z.string().uuid().optional(),
});

export const contentGenerateSchema = z.object({
  contentType: z.enum(contentTypes),
  mode: z.enum(contentModes).default('GENERATE'),
  tone: z.enum(contentTones).default('PREMIUM_FINTECH'),
  language: z.enum(contentLanguages).default('EN'),
  prompt: z.string().max(8000).optional(),
  sourceText: z.string().max(20000).optional(),
  templateId: z.string().uuid().optional(),
  templateCode: z.string().max(64).optional(),
  personalization: personalizationSchema.optional(),
  ragEnabled: z.boolean().default(true),
  variantCount: z.number().int().min(1).max(5).default(1),
  entityType: z.string().max(64).optional(),
  entityId: z.string().uuid().optional(),
  campaignId: z.string().uuid().optional(),
  targetLanguage: z.enum(contentLanguages).optional(),
  async: z.boolean().default(false),
});

export const contentRewriteSchema = contentGenerateSchema.extend({
  mode: z.literal('REWRITE').default('REWRITE'),
  sourceText: z.string().min(10).max(20000),
});

export const contentSummarizeSchema = z.object({
  sourceText: z.string().min(20).max(50000),
  language: z.enum(contentLanguages).default('EN'),
  contentType: z.enum(contentTypes).optional(),
  maxLength: z.number().int().min(50).max(2000).optional(),
});

export const contentTranslateSchema = z.object({
  sourceText: z.string().min(5).max(20000),
  sourceLanguage: z.enum(contentLanguages).default('EN'),
  targetLanguage: z.enum(contentLanguages),
  contentType: z.enum(contentTypes).optional(),
  tone: z.enum(contentTones).optional(),
});

export const listContentTemplatesQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  contentType: z.enum(contentTypes).optional(),
  category: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createContentTemplateSchema = z.object({
  code: z.string().min(2).max(64).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  contentType: z.enum(contentTypes),
  category: z.string().max(64).optional(),
  tone: z.enum(contentTones).default('PREMIUM_FINTECH'),
  language: z.enum(contentLanguages).default('EN'),
  systemPrompt: z.string().max(4000).optional(),
  userPrompt: z.string().max(4000).optional(),
  variables: z.record(z.unknown()).optional(),
  sampleOutput: z.string().max(10000).optional(),
});

export const updateContentTemplateSchema = createContentTemplateSchema.partial().omit({ code: true });

export const listContentHistoryQuerySchema = paginationSchema.extend({
  contentType: z.enum(contentTypes).optional(),
  status: z.enum(contentWorkflowStatuses).optional(),
  mode: z.enum(contentModes).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const contentFeedbackSchema = z.object({
  requestId: z.string().uuid(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

export const contentApprovalSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().max(2000).optional(),
});

export const contentPublishSchema = z.object({
  requestId: z.string().uuid(),
  channel: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'CAMPAIGN', 'KNOWLEDGE']).optional(),
});

export const contentAnalyticsQuerySchema = paginationSchema.extend({
  contentType: z.enum(contentTypes).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  period: z.enum(['day', 'week', 'month', 'quarter']).default('month'),
});

export const contentIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type ContentGenerateInput = z.infer<typeof contentGenerateSchema>;
export type ContentRewriteInput = z.infer<typeof contentRewriteSchema>;
export type ContentSummarizeInput = z.infer<typeof contentSummarizeSchema>;
export type ContentTranslateInput = z.infer<typeof contentTranslateSchema>;
export type ListContentTemplatesQuery = z.infer<typeof listContentTemplatesQuerySchema>;
export type CreateContentTemplateInput = z.infer<typeof createContentTemplateSchema>;
export type ListContentHistoryQuery = z.infer<typeof listContentHistoryQuerySchema>;
export type ContentAnalyticsQuery = z.infer<typeof contentAnalyticsQuerySchema>;
