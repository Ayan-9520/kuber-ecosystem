import { z } from 'zod';

const loanCaseStageEnum = z.enum([
  'LEAD_CREATED',
  'ASSIGNED',
  'ELIGIBILITY',
  'DOCUMENT_COLLECTION',
  'DOCUMENTS_VERIFIED',
  'LOAN_LOGIN',
  'BANK_PROCESSING',
  'BANK_QUERY_RAISED',
  'QUERY_RESOLVED',
  'SANCTIONED',
  'DISBURSEMENT_SCHEDULED',
  'DISBURSED',
  'COMMISSION_GENERATED',
  'FINANCE_APPROVAL',
  'PARTNER_PAYMENT',
  'EMPLOYEE_INCENTIVE',
  'COMPLETED',
  'REJECTED',
  'ON_HOLD',
]);

const productEnum = z.enum([
  'HOME_LOAN',
  'LOAN_AGAINST_PROPERTY',
  'BUSINESS_LOAN',
  'WORKING_CAPITAL',
  'PERSONAL_LOAN',
  'AUTO_LOAN',
  'CONSTRUCTION_LOAN',
  'EDUCATION_LOAN',
  'DOCTOR_LOAN',
  'MSME_LOAN',
]);

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
  'OTHER',
]);

const documentTypeEnum = z.enum([
  'PAN',
  'AADHAAR',
  'PHOTOGRAPH',
  'SALARY_SLIP',
  'ITR',
  'BANK_STATEMENT',
  'PROPERTY_PAPERS',
  'AGREEMENT',
  'SANCTION_LETTER',
  'DISBURSEMENT_LETTER',
  'PDD',
  'OTHER',
]);

const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

const approvalStatusEnum = z.enum(['NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED', 'ON_HOLD']);
const paymentStatusEnum = z.enum(['NOT_DUE', 'PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'FAILED']);

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const approvalDecideParamsSchema = z.object({
  id: z.string().uuid(),
  approvalId: z.string().uuid(),
});

export const listCasesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  stage: loanCaseStageEnum.optional(),
  product: productEnum.optional(),
  partnerId: z.string().uuid().optional(),
  /** Free-text partner match (name or id fragment) used by the console filter bar. */
  partner: z.string().trim().max(150).optional(),
  employee: z.string().trim().max(150).optional(),
  lenderName: z.string().trim().max(150).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
  fromDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  toDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  search: z.string().trim().max(200).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'loanAmount', 'caseNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const listRevenueRulesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  product: productEnum.optional(),
  lenderName: z.string().trim().max(150).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().trim().max(200).optional(),
});

const stakeholderInputSchema = z.object({
  stakeholderType: stakeholderTypeEnum,
  stakeholderName: z.string().trim().min(1).max(150),
  stakeholderRefId: z.string().uuid().optional(),
  sharePercent: z.number().min(0).max(100),
});

export const createCaseSchema = z.object({
  product: productEnum,
  lenderName: z.string().trim().min(1).max(150),
  lenderId: z.string().uuid().optional(),
  branchName: z.string().trim().max(150).optional(),
  branchId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  connectorId: z.string().uuid().optional(),
  relationshipManagerId: z.string().uuid().optional(),
  salesEmployeeId: z.string().uuid().optional(),
  customerName: z.string().trim().min(1).max(150),
  pan: z.string().trim().max(10).optional(),
  aadhaarMasked: z.string().trim().max(16).optional(),
  mobile: z.string().trim().min(8).max(15),
  email: z.string().email().max(255).optional(),
  occupation: z.string().trim().max(100).optional(),
  employer: z.string().trim().max(150).optional(),
  annualIncome: z.number().nonnegative().optional(),
  propertyAddress: z.string().trim().max(500).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  referralSource: z.string().trim().max(100).optional(),
  projectName: z.string().trim().max(200).optional(),
  loanAmount: z.number().positive(),
  requestedAmount: z.number().positive(),
  eligibleAmount: z.number().nonnegative().optional(),
  interestRate: z.number().nonnegative().optional(),
  tenureMonths: z.number().int().positive().optional(),
  remarks: z.string().max(5000).optional(),
  internalNotes: z.string().max(5000).optional(),
  stakeholders: z.array(stakeholderInputSchema).optional(),
});

export const updateCaseSchema = z
  .object({
    stage: loanCaseStageEnum.optional(),
    lenderName: z.string().trim().min(1).max(150).optional(),
    branchName: z.string().trim().max(150).optional(),
    customerName: z.string().trim().min(1).max(150).optional(),
    mobile: z.string().trim().min(8).max(15).optional(),
    email: z.string().email().max(255).optional(),
    occupation: z.string().trim().max(100).optional(),
    employer: z.string().trim().max(150).optional(),
    annualIncome: z.number().nonnegative().optional(),
    propertyAddress: z.string().trim().max(500).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    loanAmount: z.number().positive().optional(),
    requestedAmount: z.number().positive().optional(),
    eligibleAmount: z.number().nonnegative().nullable().optional(),
    sanctionAmount: z.number().nonnegative().nullable().optional(),
    disbursementAmount: z.number().nonnegative().nullable().optional(),
    interestRate: z.number().nonnegative().nullable().optional(),
    tenureMonths: z.number().int().positive().nullable().optional(),
    emiAmount: z.number().nonnegative().nullable().optional(),
    bankApplicationNumber: z.string().trim().max(50).nullable().optional(),
    loanAccountNumber: z.string().trim().max(50).nullable().optional(),
    expectedSanctionDate: z.string().datetime().nullable().optional(),
    expectedDisbursementDate: z.string().datetime().nullable().optional(),
    expectedRevenue: z.number().nonnegative().nullable().optional(),
    expectedCommission: z.number().nonnegative().nullable().optional(),
    revenueGenerated: z.number().nonnegative().nullable().optional(),
    companyMargin: z.number().nonnegative().nullable().optional(),
    employeeIncentiveTotal: z.number().nonnegative().nullable().optional(),
    approvalStatus: approvalStatusEnum.optional(),
    paymentStatus: paymentStatusEnum.optional(),
    remarks: z.string().max(5000).nullable().optional(),
    internalNotes: z.string().max(5000).nullable().optional(),
    aiEligibilityScore: z.number().min(0).max(100).nullable().optional(),
    aiRiskScore: z.number().min(0).max(100).nullable().optional(),
    aiBankRecommendation: z.string().max(200).nullable().optional(),
    aiCaseSummary: z.string().max(5000).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

export const advanceStageSchema = z.object({
  stage: loanCaseStageEnum.optional(),
  comment: z.string().trim().max(2000).optional(),
});

export const setStakeholdersSchema = z.object({
  stakeholders: z
    .array(stakeholderInputSchema)
    .min(1)
    .refine(
      (rows) => Math.abs(rows.reduce((s, r) => s + r.sharePercent, 0) - 100) < 0.01,
      { message: 'Stakeholder sharePercent must sum to 100' },
    ),
});

export const addDocumentSchema = z.object({
  documentType: documentTypeEnum,
  fileName: z.string().trim().min(1).max(255),
  storageKey: z.string().trim().min(1).max(500),
  mimeType: z.string().trim().max(100).optional(),
  fileSizeBytes: z.number().int().nonnegative().optional(),
});

export const addTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
  priority: taskPriorityEnum.optional(),
  dueAt: z.string().datetime().optional(),
  assignedToId: z.string().uuid().optional(),
  assignedToName: z.string().trim().max(150).optional(),
});

export const taskParamsSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
});

export const documentParamsSchema = z.object({
  id: z.string().uuid(),
  documentId: z.string().uuid(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    priority: taskPriorityEnum.optional(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    dueAt: z.string().datetime().nullable().optional(),
    assignedToId: z.string().uuid().nullable().optional(),
    assignedToName: z.string().trim().max(150).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

export const decideApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'ON_HOLD']),
  comment: z.string().trim().max(2000).optional(),
});

export const createRevenueRuleSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    lenderName: z.string().trim().min(1).max(150),
    lenderId: z.string().uuid().optional(),
    product: productEnum,
    revenuePercent: z.number().min(0).max(100),
    gstPercent: z.number().min(0).max(100).optional(),
    tdsPercent: z.number().min(0).max(100).optional(),
    platformSharePercent: z.number().min(0).max(100).optional(),
    partnerSharePercent: z.number().min(0).max(100).optional(),
    employeeSharePercent: z.number().min(0).max(100).optional(),
    teamSharePercent: z.number().min(0).max(100).optional(),
    managerSharePercent: z.number().min(0).max(100).optional(),
    companySharePercent: z.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
    effectiveFrom: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    effectiveTo: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  })
  .superRefine((v, ctx) => {
    const sum =
      (v.platformSharePercent ?? 0) +
      (v.partnerSharePercent ?? 0) +
      (v.employeeSharePercent ?? 0) +
      (v.teamSharePercent ?? 0) +
      (v.managerSharePercent ?? 0) +
      (v.companySharePercent ?? 0);
    if (sum > 0 && Math.abs(sum - 100) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Share percentages must sum to 100 when provided',
        path: ['partnerSharePercent'],
      });
    }
  });

export const updateRevenueRuleSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    lenderName: z.string().trim().min(1).max(150).optional(),
    revenuePercent: z.number().min(0).max(100).optional(),
    gstPercent: z.number().min(0).max(100).optional(),
    tdsPercent: z.number().min(0).max(100).optional(),
    platformSharePercent: z.number().min(0).max(100).optional(),
    partnerSharePercent: z.number().min(0).max(100).optional(),
    employeeSharePercent: z.number().min(0).max(100).optional(),
    teamSharePercent: z.number().min(0).max(100).optional(),
    managerSharePercent: z.number().min(0).max(100).optional(),
    companySharePercent: z.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
    effectiveFrom: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    effectiveTo: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });
