import { z } from 'zod';

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const createProductFamilySchema = z.object({
  code: z.string().min(2).max(10).regex(/^[A-Z0-9_]+$/, 'Uppercase code required'),
  name: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  isSecured: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const updateProductFamilySchema = createProductFamilySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createProductSchema = z.object({
  familyId: z.string().uuid(),
  code: z.string().min(2).max(10).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  minAmount: z.coerce.number().positive(),
  maxAmount: z.coerce.number().positive(),
  minTenureMonths: z.coerce.number().int().min(1),
  maxTenureMonths: z.coerce.number().int().min(1),
  minInterestRate: z.coerce.number().min(0).max(100).optional(),
  maxInterestRate: z.coerce.number().min(0).max(100).optional(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).default('P1'),
  launchDate: z.coerce.date().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const listProductsQuerySchema = listQuerySchema.extend({
  familyId: z.string().uuid().optional(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
});

export const productVariantCodeEnum = z.enum([
  'FRESH',
  'BT',
  'TOP_UP',
  'BT_TOP_UP',
  'WORKING_CAPITAL',
  'OD',
  'CC',
]);

export const createProductVariantSchema = z.object({
  productId: z.string().uuid(),
  variantCode: productVariantCodeEnum,
  name: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  config: z.record(z.unknown()).optional(),
});

export const updateProductVariantSchema = createProductVariantSchema
  .omit({ productId: true })
  .partial()
  .extend({ isActive: z.boolean().optional() });

export const listProductVariantsQuerySchema = listQuerySchema.extend({
  productId: z.string().uuid().optional(),
  variantCode: productVariantCodeEnum.optional(),
});

export const eligibilityRuleTypeEnum = z.enum([
  'AGE',
  'INCOME',
  'FOIR',
  'LTV',
  'CIBIL',
  'EMPLOYMENT',
  'CUSTOM',
]);

export const ruleDefinitionSchema = z.object({
  minAge: z.number().optional(),
  maxAge: z.number().optional(),
  minIncome: z.number().optional(),
  maxIncome: z.number().optional(),
  employmentTypes: z.array(z.string()).optional(),
  businessVintageMonths: z.number().optional(),
  minTurnover: z.number().optional(),
  minPropertyValue: z.number().optional(),
  minVehicleValue: z.number().optional(),
  maxLtv: z.number().optional(),
  maxFoir: z.number().optional(),
  minDscr: z.number().optional(),
  minCreditScore: z.number().optional(),
  locations: z.array(z.string()).optional(),
  occupations: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  customExpression: z.string().optional(),
});

export const createEligibilityRuleSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  ruleName: z.string().min(2).max(100),
  ruleType: eligibilityRuleTypeEnum,
  ruleDefinition: ruleDefinitionSchema,
  priority: z.coerce.number().int().default(0),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
});

export const updateEligibilityRuleSchema = createEligibilityRuleSchema
  .omit({ productId: true })
  .partial()
  .extend({ isActive: z.boolean().optional() });

export const listEligibilityRulesQuerySchema = listQuerySchema.extend({
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  ruleType: eligibilityRuleTypeEnum.optional(),
});

export const evaluateEligibilitySchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  applicant: z.object({
    age: z.number().optional(),
    monthlyIncome: z.number().optional(),
    annualIncome: z.number().optional(),
    employmentType: z.string().optional(),
    businessVintageMonths: z.number().optional(),
    turnover: z.number().optional(),
    propertyValue: z.number().optional(),
    vehicleValue: z.number().optional(),
    requestedLoanAmount: z.number().optional(),
    existingEmi: z.number().optional(),
    creditScore: z.number().optional(),
    location: z.string().optional(),
    occupation: z.string().optional(),
    industry: z.string().optional(),
  }),
});

export const createDocumentRuleSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  documentTypeId: z.string().uuid(),
  isMandatory: z.boolean().default(true),
  stage: z.enum(['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09']).default('S03'),
  employmentType: z
    .enum(['SALARIED', 'SELF_EMPLOYED', 'BUSINESS_OWNER', 'PROFESSIONAL', 'RETIRED', 'OTHER'])
    .optional(),
  description: z.string().max(500).optional(),
});

export const updateDocumentRuleSchema = createDocumentRuleSchema
  .omit({ productId: true })
  .partial();

export const listDocumentRulesQuerySchema = listQuerySchema.extend({
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  stage: z.string().optional(),
});

export const resolveDocumentsSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  employmentType: z.string().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

export const lenderTypeEnum = z.enum(['BANK', 'NBFC', 'HFC']);
export const lenderIntegrationEnum = z.enum(['MANUAL', 'API', 'EMAIL']);

export const createLenderSchema = z.object({
  code: z.string().min(2).max(20).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(2).max(200),
  lenderType: lenderTypeEnum,
  contactEmail: z.string().email().optional(),
  integrationType: lenderIntegrationEnum.default('MANUAL'),
});

export const updateLenderSchema = createLenderSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const listLendersQuerySchema = listQuerySchema.extend({
  lenderType: lenderTypeEnum.optional(),
  integrationType: lenderIntegrationEnum.optional(),
});

export const lenderPolicyConfigSchema = z.object({
  roiMin: z.number().optional(),
  roiMax: z.number().optional(),
  minTenureMonths: z.number().optional(),
  maxTenureMonths: z.number().optional(),
  minDscr: z.number().optional(),
  propertyTypes: z.array(z.string()).optional(),
  vehicleTypes: z.array(z.string()).optional(),
  businessTypes: z.array(z.string()).optional(),
});

export const createLenderPolicySchema = z.object({
  lenderId: z.string().uuid(),
  productId: z.string().uuid(),
  minAmount: z.coerce.number().positive(),
  maxAmount: z.coerce.number().positive(),
  maxLtv: z.coerce.number().min(0).max(100).optional(),
  maxFoir: z.coerce.number().min(0).max(100).optional(),
  minCibil: z.coerce.number().int().min(300).max(900).optional(),
  processingFeePct: z.coerce.number().min(0).max(100).optional(),
  commissionRate: z.coerce.number().min(0).max(100).optional(),
  turnaroundDays: z.coerce.number().int().optional(),
  policyS3Key: z.string().max(500).optional(),
  policyConfig: lenderPolicyConfigSchema.optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
});

export const updateLenderPolicySchema = createLenderPolicySchema
  .omit({ lenderId: true, productId: true })
  .partial()
  .extend({ isActive: z.boolean().optional() });

export const listLenderPoliciesQuerySchema = listQuerySchema.extend({
  lenderId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
});

export const createProductLenderMappingSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  lenderId: z.string().uuid(),
  lenderPolicyId: z.string().uuid().optional(),
  eligibilityRuleIds: z.array(z.string().uuid()).optional(),
  documentRuleIds: z.array(z.string().uuid()).optional(),
  priority: z.coerce.number().int().default(0),
  config: z.record(z.unknown()).optional(),
});

export const updateProductLenderMappingSchema = createProductLenderMappingSchema
  .omit({ productId: true, lenderId: true })
  .partial()
  .extend({ isActive: z.boolean().optional() });

export const listProductLenderMappingsQuerySchema = listQuerySchema.extend({
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  lenderId: z.string().uuid().optional(),
});

export const productRecommendationSchema = z.object({
  customerId: z.string().uuid().optional(),
  loanPurpose: z.string().optional(),
  requestedAmount: z.coerce.number().positive().optional(),
  employmentType: z.string().optional(),
  creditScore: z.coerce.number().optional(),
  propertyValue: z.coerce.number().optional(),
  vehicleValue: z.coerce.number().optional(),
});

export type ListQuery = z.infer<typeof listQuerySchema>;
export type CreateProductFamilyInput = z.infer<typeof createProductFamilySchema>;
export type UpdateProductFamilyInput = z.infer<typeof updateProductFamilySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>;
export type ListProductVariantsQuery = z.infer<typeof listProductVariantsQuerySchema>;
export type CreateEligibilityRuleInput = z.infer<typeof createEligibilityRuleSchema>;
export type UpdateEligibilityRuleInput = z.infer<typeof updateEligibilityRuleSchema>;
export type ListEligibilityRulesQuery = z.infer<typeof listEligibilityRulesQuerySchema>;
export type EvaluateEligibilityInput = z.infer<typeof evaluateEligibilitySchema>;
export type CreateDocumentRuleInput = z.infer<typeof createDocumentRuleSchema>;
export type UpdateDocumentRuleInput = z.infer<typeof updateDocumentRuleSchema>;
export type ListDocumentRulesQuery = z.infer<typeof listDocumentRulesQuerySchema>;
export type ResolveDocumentsInput = z.infer<typeof resolveDocumentsSchema>;
export type CreateLenderInput = z.infer<typeof createLenderSchema>;
export type UpdateLenderInput = z.infer<typeof updateLenderSchema>;
export type ListLendersQuery = z.infer<typeof listLendersQuerySchema>;
export type CreateLenderPolicyInput = z.infer<typeof createLenderPolicySchema>;
export type UpdateLenderPolicyInput = z.infer<typeof updateLenderPolicySchema>;
export type ListLenderPoliciesQuery = z.infer<typeof listLenderPoliciesQuerySchema>;
export type CreateProductLenderMappingInput = z.infer<typeof createProductLenderMappingSchema>;
export type UpdateProductLenderMappingInput = z.infer<typeof updateProductLenderMappingSchema>;
export type ListProductLenderMappingsQuery = z.infer<typeof listProductLenderMappingsQuerySchema>;
export type ProductRecommendationInput = z.infer<typeof productRecommendationSchema>;
