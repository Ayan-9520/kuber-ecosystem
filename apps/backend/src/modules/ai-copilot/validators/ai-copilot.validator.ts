import { z } from 'zod';

export const copilotInsightsQuerySchema = z.object({
  entityType: z.enum(['LEAD', 'APPLICATION', 'CUSTOMER', 'EXECUTIVE', 'BRANCH', 'PARTNER', 'PRODUCT', 'PORTFOLIO']).optional(),
  entityId: z.string().uuid().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const copilotRecommendationsQuerySchema = z.object({
  entityType: z.enum(['LEAD', 'APPLICATION', 'CUSTOMER', 'EXECUTIVE', 'BRANCH', 'PARTNER', 'PRODUCT', 'PORTFOLIO']).optional(),
  entityId: z.string().uuid().optional(),
  recommendationType: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const copilotFeedbackSchema = z.object({
  sessionId: z.string().uuid().optional(),
  entityType: z.enum(['LEAD', 'APPLICATION', 'CUSTOMER', 'EXECUTIVE', 'BRANCH', 'PARTNER', 'PRODUCT', 'PORTFOLIO']).optional(),
  entityId: z.string().uuid().optional(),
  rating: z.enum(['HELPFUL', 'PARTIAL', 'NOT_HELPFUL']),
  comment: z.string().max(2000).optional(),
  insightId: z.string().uuid().optional(),
  recommendationId: z.string().uuid().optional(),
});

export const copilotAcceptRecommendationSchema = z.object({
  accepted: z.boolean(),
});

export const copilotAnalyticsQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  branchId: z.string().uuid().optional(),
});

export const copilotEntityParamSchema = z.object({
  id: z.string().uuid(),
});

export type CopilotFeedbackInput = z.infer<typeof copilotFeedbackSchema>;
export type CopilotInsightsQuery = z.infer<typeof copilotInsightsQuerySchema>;
export type CopilotRecommendationsQuery = z.infer<typeof copilotRecommendationsQuerySchema>;
export type CopilotAnalyticsQuery = z.infer<typeof copilotAnalyticsQuerySchema>;
