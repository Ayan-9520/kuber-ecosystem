import { paginationSchema } from '@kuberone/shared-validation';
import { z } from 'zod';


export const leadScoringEntityParamSchema = z.object({
  leadId: z.string().uuid(),
});

export const bulkCalculateSchema = z.object({
  leadIds: z.array(z.string().uuid()).min(1).max(100),
  aiScore: z.number().int().min(0).max(100).optional(),
  force: z.boolean().default(false),
});

export const calculateLeadScoreQuerySchema = z.object({
  aiScore: z.coerce.number().int().min(0).max(100).optional(),
  force: z.coerce.boolean().optional(),
});

export const listScoringRulesQuerySchema = paginationSchema.extend({
  factor: z.string().optional(),
  ruleType: z.enum(['STATIC', 'DYNAMIC', 'CONFIG']).optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['priority', 'factor', 'createdAt']).default('priority'),
});

export const createScoringRuleSchema = z.object({
  code: z.string().min(2).max(50).toUpperCase(),
  name: z.string().min(2).max(150),
  factor: z.string().min(2).max(50),
  ruleType: z.enum(['STATIC', 'DYNAMIC', 'CONFIG']),
  condition: z.record(z.unknown()),
  scoreImpact: z.number().int().min(-100).max(100),
  priority: z.number().int().min(1).max(100).default(50),
  isActive: z.boolean().default(true),
  description: z.string().max(500).optional(),
});

export const updateScoringRuleSchema = createScoringRuleSchema.partial().omit({ code: true });

export const listWeightConfigsQuerySchema = paginationSchema.extend({
  version: z.string().optional(),
  factor: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['factor', 'effectiveFrom', 'createdAt']).default('factor'),
});

export const upsertWeightConfigSchema = z.object({
  version: z.string().min(2).max(20).default('v2.0'),
  weights: z
    .array(
      z.object({
        factor: z.string().min(2).max(50),
        weight: z.number().min(0).max(1),
      }),
    )
    .min(1),
  effectiveFrom: z.coerce.date().optional(),
});

export const scoringAnalyticsQuerySchema = z.object({
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export type BulkCalculateInput = z.infer<typeof bulkCalculateSchema>;
export type CreateScoringRuleInput = z.infer<typeof createScoringRuleSchema>;
export type UpdateScoringRuleInput = z.infer<typeof updateScoringRuleSchema>;
export type UpsertWeightConfigInput = z.infer<typeof upsertWeightConfigSchema>;
export type ScoringAnalyticsQuery = z.infer<typeof scoringAnalyticsQuerySchema>;
