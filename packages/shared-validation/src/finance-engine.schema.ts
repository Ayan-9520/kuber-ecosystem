import { z } from 'zod';

export const financeProductSlugSchema = z.enum([
  'HOME_LOAN',
  'HOME_LOAN_BT',
  'HOME_LOAN_TOP_UP',
  'HOME_LOAN_BT_TOP_UP',
  'LAP',
  'LAP_BT',
  'LAP_TOP_UP',
  'LAP_BT_TOP_UP',
  'BUSINESS_LOAN',
  'MSME_LOAN',
  'WORKING_CAPITAL',
  'OD',
  'CC',
  'NEW_CAR_LOAN',
  'USED_CAR_LOAN',
  'COMMERCIAL_VEHICLE',
  'EV_LOAN',
  'CAR_LOAN_BT',
  'CAR_LOAN_TOP_UP',
  'CAR_REFINANCE',
]);

export const approvalGradeSchema = z.enum(['A_PLUS', 'A', 'B', 'C', 'REJECTED']);

export const employmentTypeSchema = z.enum([
  'SALARIED',
  'SELF_EMPLOYED',
  'BUSINESS_OWNER',
  'PROFESSIONAL',
  'RETIRED',
  'OTHER',
]);

const entityContextSchema = z.object({
  customerId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  persist: z.boolean().default(true),
  useCache: z.boolean().default(true),
});

export const calculateEmiSchema = z
  .object({
    productSlug: financeProductSlugSchema.optional(),
    productId: z.string().uuid().optional(),
    loanAmount: z.coerce.number().positive(),
    interestRate: z.coerce.number().min(0).max(100),
    tenureMonths: z.coerce.number().int().min(1).max(480),
    processingFee: z.coerce.number().min(0).default(0),
    includeAmortization: z.boolean().default(true),
  })
  .merge(entityContextSchema);

export const calculateEligibilitySchema = z
  .object({
    productSlug: financeProductSlugSchema.optional(),
    productId: z.string().uuid().optional(),
    variantId: z.string().uuid().optional(),
    age: z.coerce.number().int().min(18).max(100).optional(),
    monthlyIncome: z.coerce.number().positive().optional(),
    annualIncome: z.coerce.number().positive().optional(),
    employmentType: employmentTypeSchema.optional(),
    businessVintageMonths: z.coerce.number().int().min(0).optional(),
    turnover: z.coerce.number().min(0).optional(),
    propertyValue: z.coerce.number().positive().optional(),
    vehicleValue: z.coerce.number().positive().optional(),
    creditScore: z.coerce.number().int().min(300).max(900).optional(),
    location: z.string().max(100).optional(),
    existingObligations: z.coerce.number().min(0).default(0),
    existingEmi: z.coerce.number().min(0).optional(),
    requestedLoanAmount: z.coerce.number().positive().optional(),
    requestedTenureMonths: z.coerce.number().int().min(1).max(480).optional(),
    interestRate: z.coerce.number().min(0).max(100).optional(),
    annualBusinessProfit: z.coerce.number().min(0).optional(),
    annualDebtService: z.coerce.number().min(0).optional(),
  })
  .merge(entityContextSchema)
  .refine((v) => v.productSlug || v.productId, {
    message: 'Either productSlug or productId is required',
  });

export const calculateSavingsSchema = z
  .object({
    productSlug: financeProductSlugSchema.optional(),
    outstandingPrincipal: z.coerce.number().positive(),
    currentInterestRate: z.coerce.number().min(0).max(100),
    remainingTenureMonths: z.coerce.number().int().min(1).max(480),
    newInterestRate: z.coerce.number().min(0).max(100),
    newTenureMonths: z.coerce.number().int().min(1).max(480),
    topUpAmount: z.coerce.number().min(0).default(0),
    processingFee: z.coerce.number().min(0).default(0),
    foreclosureCharges: z.coerce.number().min(0).default(0),
  })
  .merge(entityContextSchema);

export const loanComparisonOfferSchema = z.object({
  label: z.string().min(1).max(100),
  lenderId: z.string().uuid().optional(),
  lenderCode: z.string().max(20).optional(),
  lenderName: z.string().max(200).optional(),
  loanAmount: z.coerce.number().positive(),
  interestRate: z.coerce.number().min(0).max(100),
  tenureMonths: z.coerce.number().int().min(1).max(480),
  processingFee: z.coerce.number().min(0).default(0),
  turnaroundDays: z.coerce.number().int().min(0).optional(),
});

export const calculateLoanComparisonSchema = z
  .object({
    productSlug: financeProductSlugSchema.optional(),
    productId: z.string().uuid().optional(),
    offers: z.array(loanComparisonOfferSchema).min(2).max(10),
    rankBy: z.enum(['emi', 'totalRepayment', 'processingFee', 'turnaround']).default('emi'),
  })
  .merge(entityContextSchema);

export const calculateApprovalProbabilitySchema = z
  .object({
    productSlug: financeProductSlugSchema.optional(),
    productId: z.string().uuid().optional(),
    variantId: z.string().uuid().optional(),
    age: z.coerce.number().int().min(18).max(100).optional(),
    monthlyIncome: z.coerce.number().positive().optional(),
    annualIncome: z.coerce.number().positive().optional(),
    employmentType: employmentTypeSchema.optional(),
    businessVintageMonths: z.coerce.number().int().min(0).optional(),
    turnover: z.coerce.number().min(0).optional(),
    propertyValue: z.coerce.number().positive().optional(),
    vehicleValue: z.coerce.number().positive().optional(),
    creditScore: z.coerce.number().int().min(300).max(900).optional(),
    location: z.string().max(100).optional(),
    existingObligations: z.coerce.number().min(0).default(0),
    existingEmi: z.coerce.number().min(0).optional(),
    requestedLoanAmount: z.coerce.number().positive().optional(),
    requestedTenureMonths: z.coerce.number().int().min(1).max(480).optional(),
    interestRate: z.coerce.number().min(0).max(100).optional(),
    documentsComplete: z.boolean().default(true),
    kycVerified: z.boolean().default(false),
  })
  .merge(entityContextSchema)
  .refine((v) => v.productSlug || v.productId, {
    message: 'Either productSlug or productId is required',
  });

export const listFinanceCalculationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  calculationKind: z.enum(['EMI', 'ELIGIBILITY', 'SAVINGS', 'LOAN_COMPARISON', 'APPROVAL_PROBABILITY']).optional(),
  customerId: z.string().uuid().optional(),
  productSlug: financeProductSlugSchema.optional(),
  sortBy: z.enum(['createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CalculateEmiInput = z.infer<typeof calculateEmiSchema>;
export type CalculateEligibilityInput = z.infer<typeof calculateEligibilitySchema>;
export type CalculateSavingsInput = z.infer<typeof calculateSavingsSchema>;
export type CalculateLoanComparisonInput = z.infer<typeof calculateLoanComparisonSchema>;
export type CalculateApprovalProbabilityInput = z.infer<typeof calculateApprovalProbabilitySchema>;
export type ListFinanceCalculationsQuery = z.infer<typeof listFinanceCalculationsQuerySchema>;
