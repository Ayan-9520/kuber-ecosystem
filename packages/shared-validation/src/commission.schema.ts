import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const commissionPartnerTypeSchema = z.enum([
  'DSA',
  'BUILDER',
  'PROPERTY_DEALER',
  'CA',
  'BROKER',
  'CORPORATE',
  'CHANNEL_PARTNER',
]);

export const commissionEventTypeSchema = z.enum([
  'LEAD_GENERATION',
  'APPLICATION_LOGIN',
  'SANCTION',
  'DISBURSEMENT',
  'RENEWAL',
  'CROSS_SELL',
  'CAMPAIGN_BONUS',
]);

export const commissionStatusSchema = z.enum([
  'PENDING',
  'CALCULATED',
  'APPROVED',
  'REJECTED',
  'PAID',
  'RECOVERED',
  'ADJUSTED',
]);

export const commissionCalculationMethodSchema = z.enum([
  'FIXED_AMOUNT',
  'PERCENTAGE',
  'SLAB_BASED',
  'PRODUCT_BASED',
  'LENDER_BASED',
  'CAMPAIGN_BASED',
]);

export const commissionLedgerEntryTypeSchema = z.enum([
  'CREDIT',
  'DEBIT',
  'ADJUSTMENT',
  'RECOVERY',
  'PAYMENT',
]);

export const slabDefinitionSchema = z.array(
  z.object({
    minAmount: z.coerce.number().min(0),
    maxAmount: z.coerce.number().positive().optional(),
    percentage: z.coerce.number().min(0).max(100).optional(),
    fixedAmount: z.coerce.number().min(0).optional(),
  }),
);

export const listCommissionRulesQuerySchema = paginationSchema.extend({
  partnerType: commissionPartnerTypeSchema.optional(),
  commissionType: commissionEventTypeSchema.optional(),
  calculationMethod: commissionCalculationMethodSchema.optional(),
  productId: z.string().uuid().optional(),
  lenderId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['priority', 'name', 'effectiveFrom', 'createdAt']).default('priority'),
});

export const createCommissionRuleSchema = z.object({
  ruleCode: z.string().min(2).max(30).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  partnerType: commissionPartnerTypeSchema.optional(),
  commissionType: commissionEventTypeSchema,
  calculationMethod: commissionCalculationMethodSchema,
  fixedAmount: z.coerce.number().min(0).optional(),
  percentage: z.coerce.number().min(0).max(100).optional(),
  slabDefinition: slabDefinitionSchema.optional(),
  productId: z.string().uuid().optional(),
  lenderId: z.string().uuid().optional(),
  campaignId: z.string().max(36).optional(),
  minBaseAmount: z.coerce.number().min(0).optional(),
  maxBaseAmount: z.coerce.number().min(0).optional(),
  minCommission: z.coerce.number().min(0).optional(),
  maxCommission: z.coerce.number().min(0).optional(),
  priority: z.coerce.number().int().min(0).default(0),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
});

export const updateCommissionRuleSchema = createCommissionRuleSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const calculateCommissionSchema = z.object({
  partnerId: z.string().uuid(),
  commissionType: commissionEventTypeSchema,
  baseAmount: z.coerce.number().positive(),
  leadId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  referralId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  lenderId: z.string().uuid().optional(),
  campaignId: z.string().max(36).optional(),
  notes: z.string().max(2000).optional(),
});

export const listCommissionLedgerQuerySchema = paginationSchema.extend({
  partnerId: z.string().uuid().optional(),
  commissionType: commissionEventTypeSchema.optional(),
  entryType: commissionLedgerEntryTypeSchema.optional(),
  status: commissionStatusSchema.optional(),
  branchId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  lenderId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['createdAt', 'calculatedAt', 'commissionAmount', 'ledgerNumber']).default('createdAt'),
});

export const exportCommissionLedgerQuerySchema = listCommissionLedgerQuerySchema.omit({
  page: true,
  limit: true,
});

export const listCommissionApprovalsQuerySchema = paginationSchema.extend({
  ledgerId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  sortBy: z.enum(['createdAt', 'approvedAt']).default('createdAt'),
});

export const createCommissionApprovalSchema = z.object({
  ledgerId: z.string().uuid(),
  notes: z.string().max(2000).optional(),
});

export const decideCommissionApprovalSchema = z.object({
  approvedAmount: z.coerce.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
  rejectionReason: z.string().max(500).optional(),
});

export const listCommissionPaymentsQuerySchema = paginationSchema.extend({
  partnerId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'RELEASED', 'FAILED', 'CANCELLED']).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['createdAt', 'releasedAt', 'totalAmount']).default('createdAt'),
});

export const createCommissionPaymentSchema = z.object({
  partnerId: z.string().uuid(),
  ledgerIds: z.array(z.string().uuid()).min(1).max(100),
  paymentMethod: z.string().max(50).optional(),
  bankAccountRef: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});

export const releaseCommissionPaymentSchema = z.object({
  paymentReference: z.string().min(1).max(100),
  notes: z.string().max(2000).optional(),
});

export const listCommissionAdjustmentsQuerySchema = paginationSchema.extend({
  partnerId: z.string().uuid().optional(),
  ledgerId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'APPLIED']).optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['createdAt', 'amount']).default('createdAt'),
});

export const createCommissionAdjustmentSchema = z.object({
  partnerId: z.string().uuid(),
  ledgerId: z.string().uuid().optional(),
  amount: z.coerce.number(),
  reason: z.string().min(1).max(500),
  notes: z.string().max(2000).optional(),
});

export const listCommissionRecoveriesQuerySchema = paginationSchema.extend({
  partnerId: z.string().uuid().optional(),
  ledgerId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'RECOVERED', 'REJECTED', 'CANCELLED']).optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['createdAt', 'amount']).default('createdAt'),
});

export const createCommissionRecoverySchema = z.object({
  partnerId: z.string().uuid(),
  ledgerId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  reason: z.string().min(1).max(500),
  notes: z.string().max(2000).optional(),
});

export const commissionAnalyticsQuerySchema = z.object({
  partnerId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  groupBy: z.enum(['partner', 'branch', 'product', 'commissionType']).default('partner'),
});

export type ListCommissionRulesQuery = z.infer<typeof listCommissionRulesQuerySchema>;
export type CreateCommissionRuleInput = z.infer<typeof createCommissionRuleSchema>;
export type UpdateCommissionRuleInput = z.infer<typeof updateCommissionRuleSchema>;
export type CalculateCommissionInput = z.infer<typeof calculateCommissionSchema>;
export type ListCommissionLedgerQuery = z.infer<typeof listCommissionLedgerQuerySchema>;
export type ExportCommissionLedgerQuery = z.infer<typeof exportCommissionLedgerQuerySchema>;
export type ListCommissionApprovalsQuery = z.infer<typeof listCommissionApprovalsQuerySchema>;
export type CreateCommissionApprovalInput = z.infer<typeof createCommissionApprovalSchema>;
export type ListCommissionPaymentsQuery = z.infer<typeof listCommissionPaymentsQuerySchema>;
export type CreateCommissionPaymentInput = z.infer<typeof createCommissionPaymentSchema>;
export type ListCommissionAdjustmentsQuery = z.infer<typeof listCommissionAdjustmentsQuerySchema>;
export type CreateCommissionAdjustmentInput = z.infer<typeof createCommissionAdjustmentSchema>;
export type ListCommissionRecoveriesQuery = z.infer<typeof listCommissionRecoveriesQuerySchema>;
export type CreateCommissionRecoveryInput = z.infer<typeof createCommissionRecoverySchema>;
export type CommissionAnalyticsQuery = z.infer<typeof commissionAnalyticsQuerySchema>;
