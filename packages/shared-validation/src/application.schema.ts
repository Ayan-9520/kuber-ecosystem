import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const applicationStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'DOCUMENT_PENDING',
  'BANK_LOGIN',
  'CREDIT_REVIEW',
  'SANCTIONED',
  'DISBURSED',
  'REJECTED',
  'CLOSED',
]);

export const eligibilityResultTypeSchema = z.enum(['ELIGIBLE', 'CONDITIONALLY_ELIGIBLE', 'NOT_ELIGIBLE']);
export const bankLoginStatusSchema = z.enum(['PENDING', 'SUBMITTED', 'ACKNOWLEDGED', 'QUERY_RAISED', 'REJECTED']);
export const creditReviewTypeSchema = z.enum(['INTERNAL', 'LENDER_QUERY', 'REWORK']);
export const creditDecisionSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'QUERY']);
export const riskGradeSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const sanctionStatusSchema = z.enum(['ISSUED', 'ACCEPTED', 'EXPIRED', 'CANCELLED']);
export const disbursementModeSchema = z.enum(['FULL', 'PARTIAL', 'TRANCHE']);
export const disbursementStatusSchema = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED']);
export const closureTypeSchema = z.enum(['DISBURSED_COMPLETE', 'REJECTED', 'WITHDRAWN', 'CANCELLED']);

export const applicantProfileSchema = z.object({
  age: z.number().int().positive().optional(),
  monthlyIncome: z.number().nonnegative().optional(),
  annualIncome: z.number().nonnegative().optional(),
  employmentType: z.string().optional(),
  propertyValue: z.number().nonnegative().optional(),
  vehicleValue: z.number().nonnegative().optional(),
  existingEmi: z.number().nonnegative().optional(),
  requestedLoanAmount: z.number().nonnegative().optional(),
  creditScore: z.number().int().min(300).max(900).optional(),
  turnover: z.number().nonnegative().optional(),
});

export const createApplicationSchema = z.object({
  customerId: z.string().uuid(),
  leadId: z.string().uuid().optional(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  requestedAmount: z.number().positive(),
  requestedTenureMonths: z.number().int().positive(),
  purpose: z.string().max(200).optional(),
  selectedLenderId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
  runEligibility: z.boolean().default(true),
  applicantProfile: applicantProfileSchema.optional(),
});

export const updateApplicationSchema = z.object({
  variantId: z.string().uuid().nullable().optional(),
  partnerId: z.string().uuid().nullable().optional(),
  branchId: z.string().uuid().nullable().optional(),
  regionId: z.string().uuid().nullable().optional(),
  status: applicationStatusSchema.optional(),
  requestedAmount: z.number().positive().optional(),
  requestedTenureMonths: z.number().int().positive().optional(),
  purpose: z.string().max(200).nullable().optional(),
  selectedLenderId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
  statusReason: z.string().max(200).optional(),
});

export const listApplicationsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  status: applicationStatusSchema.optional(),
  customerId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  assignedSalesId: z.string().uuid().optional(),
  assignedCreditId: z.string().uuid().optional(),
  selectedLenderId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'submittedAt', 'requestedAmount', 'status'])
    .default('createdAt'),
});

export const assignApplicationSchema = z.object({
  assignedSalesId: z.string().uuid().optional(),
  assignedCreditId: z.string().uuid().optional(),
  assignedOpsId: z.string().uuid().optional(),
});

export const submitApplicationSchema = z.object({
  applicantProfile: applicantProfileSchema.optional(),
  runEligibility: z.boolean().default(true),
});

export const listApplicationStatusQuerySchema = paginationSchema.extend({
  applicationId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt']).default('createdAt'),
});

export const applicationTimelineQuerySchema = paginationSchema.extend({
  applicationId: z.string().uuid(),
  eventTypes: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',') : undefined)),
});

export const evaluateEligibilityResultSchema = z.object({
  applicationId: z.string().uuid(),
  applicantProfile: applicantProfileSchema.optional(),
});

export const listEligibilityResultsQuerySchema = paginationSchema.extend({
  applicationId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  result: eligibilityResultTypeSchema.optional(),
  sortBy: z.enum(['checkedAt', 'createdAt']).default('checkedAt'),
});

export const createBankLoginSchema = z.object({
  applicationId: z.string().uuid(),
  lenderId: z.string().uuid(),
  loginReference: z.string().max(100).optional(),
  loginDate: z.coerce.date(),
  status: bankLoginStatusSchema.default('SUBMITTED'),
  notes: z.string().max(2000).optional(),
});

export const updateBankLoginSchema = z.object({
  loginReference: z.string().max(100).nullable().optional(),
  loginDate: z.coerce.date().optional(),
  status: bankLoginStatusSchema.optional(),
  notes: z.string().max(2000).nullable().optional(),
  acknowledgmentReceived: z.boolean().optional(),
});

export const listBankLoginsQuerySchema = paginationSchema.extend({
  applicationId: z.string().uuid().optional(),
  lenderId: z.string().uuid().optional(),
  status: bankLoginStatusSchema.optional(),
  sortBy: z.enum(['loginDate', 'createdAt']).default('loginDate'),
});

export const createCreditReviewSchema = z.object({
  applicationId: z.string().uuid(),
  reviewerId: z.string().uuid().optional(),
  reviewType: creditReviewTypeSchema,
  reviewNotes: z.string().max(5000).optional(),
  riskIndicators: z.array(z.string()).optional(),
  riskGrade: riskGradeSchema.optional(),
  cibilScore: z.number().int().min(300).max(900).optional(),
  decision: creditDecisionSchema.default('PENDING'),
  conditions: z.string().max(2000).optional(),
  rejectionReason: z.string().max(200).optional(),
});

export const updateCreditReviewSchema = createCreditReviewSchema.partial().omit({ applicationId: true, reviewerId: true });

export const listCreditReviewsQuerySchema = paginationSchema.extend({
  applicationId: z.string().uuid().optional(),
  reviewerId: z.string().uuid().optional(),
  decision: creditDecisionSchema.optional(),
  sortBy: z.enum(['createdAt', 'reviewedAt']).default('createdAt'),
});

export const createSanctionSchema = z.object({
  applicationId: z.string().uuid(),
  lenderId: z.string().uuid(),
  sanctionAmount: z.number().positive(),
  tenureMonths: z.number().int().positive(),
  interestRate: z.number().positive(),
  processingFee: z.number().nonnegative().optional(),
  emiAmount: z.number().positive().optional(),
  sanctionDate: z.coerce.date(),
  validityDate: z.coerce.date().optional(),
  conditions: z.string().max(2000).optional(),
  status: sanctionStatusSchema.default('ISSUED'),
});

export const updateSanctionSchema = createSanctionSchema.partial().omit({ applicationId: true });

export const listSanctionsQuerySchema = paginationSchema.extend({
  applicationId: z.string().uuid().optional(),
  lenderId: z.string().uuid().optional(),
  status: sanctionStatusSchema.optional(),
  sortBy: z.enum(['sanctionDate', 'createdAt']).default('sanctionDate'),
});

export const createDisbursementSchema = z.object({
  applicationId: z.string().uuid(),
  lenderId: z.string().uuid(),
  disbursementAmount: z.number().positive(),
  disbursementDate: z.coerce.date(),
  bankReference: z.string().max(50).optional(),
  disbursementMode: disbursementModeSchema.default('FULL'),
  trancheNumber: z.number().int().positive().optional(),
  status: disbursementStatusSchema.default('PENDING'),
});

export const updateDisbursementSchema = createDisbursementSchema.partial().omit({ applicationId: true });

export const listDisbursementsQuerySchema = paginationSchema.extend({
  applicationId: z.string().uuid().optional(),
  lenderId: z.string().uuid().optional(),
  status: disbursementStatusSchema.optional(),
  sortBy: z.enum(['disbursementDate', 'createdAt']).default('disbursementDate'),
});

export const createClosureSchema = z.object({
  applicationId: z.string().uuid(),
  closureType: closureTypeSchema,
  closureDate: z.coerce.date(),
  closureReason: z.string().max(200).optional(),
  rmAssignedId: z.string().uuid().optional(),
});

export const losAnalyticsQuerySchema = z.object({
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  assignedSalesId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
export type AssignApplicationInput = z.infer<typeof assignApplicationSchema>;
export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;
export type ListApplicationStatusQuery = z.infer<typeof listApplicationStatusQuerySchema>;
export type ApplicationTimelineQuery = z.infer<typeof applicationTimelineQuerySchema>;
export type EvaluateEligibilityResultInput = z.infer<typeof evaluateEligibilityResultSchema>;
export type ListEligibilityResultsQuery = z.infer<typeof listEligibilityResultsQuerySchema>;
export type CreateBankLoginInput = z.infer<typeof createBankLoginSchema>;
export type UpdateBankLoginInput = z.infer<typeof updateBankLoginSchema>;
export type ListBankLoginsQuery = z.infer<typeof listBankLoginsQuerySchema>;
export type CreateCreditReviewInput = z.infer<typeof createCreditReviewSchema>;
export type UpdateCreditReviewInput = z.infer<typeof updateCreditReviewSchema>;
export type ListCreditReviewsQuery = z.infer<typeof listCreditReviewsQuerySchema>;
export type CreateSanctionInput = z.infer<typeof createSanctionSchema>;
export type UpdateSanctionInput = z.infer<typeof updateSanctionSchema>;
export type ListSanctionsQuery = z.infer<typeof listSanctionsQuerySchema>;
export type CreateDisbursementInput = z.infer<typeof createDisbursementSchema>;
export type UpdateDisbursementInput = z.infer<typeof updateDisbursementSchema>;
export type ListDisbursementsQuery = z.infer<typeof listDisbursementsQuerySchema>;
export type CreateClosureInput = z.infer<typeof createClosureSchema>;
export type LosAnalyticsQuery = z.infer<typeof losAnalyticsQuerySchema>;
export type ApplicantProfile = z.infer<typeof applicantProfileSchema>;
