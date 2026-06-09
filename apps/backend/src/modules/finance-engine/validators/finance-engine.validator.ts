import { z } from 'zod';

export {
  calculateEmiSchema,
  calculateEligibilitySchema,
  calculateSavingsSchema,
  calculateLoanComparisonSchema,
  calculateApprovalProbabilitySchema,
  listFinanceCalculationsQuerySchema,
} from '@kuberone/shared-validation';

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const lenderRecommendationSchema = z.object({
  productId: z.string().uuid(),
  loanAmount: z.coerce.number().positive(),
  interestRate: z.coerce.number().min(0).max(100),
  tenureMonths: z.coerce.number().int().min(1).max(480),
});

export const productRecommendationSchema = z.object({
  monthlyIncome: z.coerce.number().positive().optional(),
  creditScore: z.coerce.number().int().min(300).max(900).optional(),
  propertyValue: z.coerce.number().positive().optional(),
  vehicleValue: z.coerce.number().positive().optional(),
  preferredSegment: z.enum(['HOME', 'AUTO', 'BUSINESS']).optional(),
});
