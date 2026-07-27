import { z } from 'zod';

const distributionScopeEnum = z.enum(['PRODUCT', 'LENDER', 'PARTNER_TIER', 'DEFAULT', 'CUSTOM']);

const stakeholderTypeEnum = z.enum([
  'PARTNER',
  'CONNECTOR',
  'BROKER',
  'EMPLOYEE',
  'TEAM_LEADER',
  'SALES_MANAGER',
  'RELATIONSHIP_MANAGER',
  'OPERATIONS',
  'FINANCE',
  'COMPANY',
  'REFERRAL',
  'OTHER',
]);

const shareModeEnum = z.enum(['PERCENT', 'FIXED']);
const runStatusEnum = z.enum(['SIMULATED', 'PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']);
const auditEntityTypeEnum = z.enum(['RULE', 'RUN']);

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

const matchingCriteriaSchema = z
  .object({
    product: z.string().trim().max(150).nullable().optional(),
    lenderName: z.string().trim().max(150).nullable().optional(),
    partnerId: z.string().trim().max(100).nullable().optional(),
    partnerTier: z.string().trim().max(50).nullable().optional(),
  })
  .optional();

const stakeholderShareSchema = z
  .object({
    stakeholderType: stakeholderTypeEnum,
    label: z.string().trim().min(1).max(150),
    mode: shareModeEnum,
    percentage: z.number().min(0).max(100).default(0),
    fixedAmount: z.number().min(0).default(0),
  })
  .superRefine((val, ctx) => {
    if (val.mode === 'PERCENT' && val.percentage <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage must be greater than 0 for PERCENT mode',
        path: ['percentage'],
      });
    }
    if (val.mode === 'FIXED' && val.fixedAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Fixed amount must be greater than 0 for FIXED mode',
        path: ['fixedAmount'],
      });
    }
  });

export const listRulesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  scope: distributionScopeEnum.optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const listRunsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: runStatusEnum.optional(),
  sourceRef: z.string().trim().max(150).optional(),
  ruleId: z.string().uuid().optional(),
});

export const listAuditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  entityId: z.string().uuid().optional(),
  action: z.string().trim().max(100).optional(),
  entityType: auditEntityTypeEnum.optional(),
});

export const createRuleSchema = z.object({
  name: z.string().trim().min(1).max(200),
  scope: distributionScopeEnum,
  matchingCriteria: matchingCriteriaSchema,
  stakeholders: z.array(stakeholderShareSchema).min(1),
  gstPercent: z.number().min(0).max(100).optional(),
  tdsPercent: z.number().min(0).max(100).optional(),
  priority: z.number().int().min(0).max(10000).optional(),
  isActive: z.boolean().optional(),
});

export const updateRuleSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    scope: distributionScopeEnum.optional(),
    matchingCriteria: matchingCriteriaSchema,
    stakeholders: z.array(stakeholderShareSchema).min(1).optional(),
    gstPercent: z.number().min(0).max(100).optional(),
    tdsPercent: z.number().min(0).max(100).optional(),
    priority: z.number().int().min(0).max(10000).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

export const simulateSchema = z
  .object({
    grossRevenue: z.number().nonnegative(),
    context: matchingCriteriaSchema,
    ruleId: z.string().uuid().optional(),
    shares: z.array(stakeholderShareSchema).min(1).optional(),
    gstPercent: z.number().min(0).max(100).optional(),
    tdsPercent: z.number().min(0).max(100).optional(),
  })
  .refine((v) => Boolean(v.ruleId || v.shares?.length || v.context), {
    message: 'Provide ruleId, shares, or context to resolve a distribution',
  });

export const createRunSchema = z
  .object({
    sourceRef: z.string().trim().min(1).max(150),
    grossRevenue: z.number().nonnegative(),
    context: matchingCriteriaSchema,
    ruleId: z.string().uuid().optional(),
    shares: z.array(stakeholderShareSchema).min(1).optional(),
    gstPercent: z.number().min(0).max(100).optional(),
    tdsPercent: z.number().min(0).max(100).optional(),
    status: runStatusEnum.optional(),
  })
  .refine((v) => Boolean(v.ruleId || v.shares?.length || v.context), {
    message: 'Provide ruleId, shares, or context to resolve a distribution',
  });
