import { paginationSchema } from '@kuberone/shared-validation';
import { z } from 'zod';


export const entityParamSchema = z.object({
  id: z.string().uuid(),
});

export const crossSellQuerySchema = z.object({
  entityType: z.enum(['CUSTOMER', 'LEAD', 'APPLICATION']).default('LEAD'),
  entityId: z.string().uuid(),
});

export const actionsQuerySchema = z.object({
  entityType: z.enum(['CUSTOMER', 'LEAD', 'APPLICATION']).default('LEAD'),
  entityId: z.string().uuid(),
});

export const analyticsQuerySchema = z.object({
  branchId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const listRulesQuerySchema = paginationSchema.extend({
  category: z.string().optional(),
  ruleType: z.enum(['STATIC', 'CONFIG', 'DYNAMIC']).optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['priority', 'category', 'createdAt']).default('priority'),
});

export const createRuleSchema = z.object({
  code: z.string().min(2).max(50).toUpperCase(),
  name: z.string().min(2).max(150),
  ruleType: z.enum(['STATIC', 'CONFIG', 'DYNAMIC']),
  category: z.string().min(2).max(50),
  condition: z.record(z.unknown()),
  scoreImpact: z.number().int().min(-100).max(100),
  priority: z.number().int().min(1).max(100).default(50),
  isActive: z.boolean().default(true),
  description: z.string().max(500).optional(),
});

export const updateRuleSchema = createRuleSchema.partial().omit({ code: true });

export const upsertWeightsSchema = z.object({
  version: z.string().min(2).max(20).default('rec-v1.0'),
  weights: z.array(z.object({ factor: z.string(), weight: z.number().min(0).max(1) })).min(1),
});

export type CrossSellQuery = z.infer<typeof crossSellQuerySchema>;
export type ActionsQuery = z.infer<typeof actionsQuerySchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type CreateRuleInput = z.infer<typeof createRuleSchema>;
export type UpdateRuleInput = z.infer<typeof updateRuleSchema>;
