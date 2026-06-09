import { z } from 'zod';

export {
  calculateCommissionSchema,
  commissionAnalyticsQuerySchema,
  createCommissionAdjustmentSchema,
  createCommissionApprovalSchema,
  createCommissionPaymentSchema,
  createCommissionRecoverySchema,
  createCommissionRuleSchema,
  decideCommissionApprovalSchema,
  exportCommissionLedgerQuerySchema,
  listCommissionAdjustmentsQuerySchema,
  listCommissionApprovalsQuerySchema,
  listCommissionLedgerQuerySchema,
  listCommissionPaymentsQuerySchema,
  listCommissionRecoveriesQuerySchema,
  listCommissionRulesQuerySchema,
  releaseCommissionPaymentSchema,
  updateCommissionRuleSchema,
} from '@kuberone/shared-validation';

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const rejectApprovalSchema = z.object({
  rejectionReason: z.string().min(1).max(500),
});

export const payoutReportQuerySchema = z.object({
  partnerId: z.string().uuid(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});
