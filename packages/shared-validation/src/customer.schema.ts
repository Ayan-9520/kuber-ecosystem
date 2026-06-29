import { z } from 'zod';

const indianMobile = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number');
const pincode = z.string().regex(/^\d{6}$/, 'Invalid pincode');

export const genderEnum = z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);
export const maritalStatusEnum = z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']);
export const customerSourceEnum = z.enum(['DIRECT', 'DSA', 'REFERRAL', 'CAMPAIGN', 'WALK_IN']);
export const preferredLanguageEnum = z.enum(['EN', 'HI', 'TA', 'TE', 'MR', 'BN', 'GU', 'KN', 'ML']);
export const preferredContactChannelEnum = z.enum(['SMS', 'WHATSAPP', 'EMAIL', 'PUSH', 'CALL']);
export const residentialStatusEnum = z.enum(['RESIDENT', 'NRI', 'PIO']);
export const addressTypeEnum = z.enum(['CURRENT', 'PERMANENT', 'OFFICE', 'PROPERTY']);
export const employmentTypeEnum = z.enum([
  'SALARIED',
  'SELF_EMPLOYED',
  'BUSINESS_OWNER',
  'PROFESSIONAL',
  'RETIRED',
  'OTHER',
]);
export const incomeTypeEnum = z.enum([
  'MONTHLY_SALARY',
  'ANNUAL_INCOME',
  'BUSINESS_INCOME',
  'RENTAL',
  'OTHER',
]);
export const incomeFrequencyEnum = z.enum(['MONTHLY', 'ANNUAL']);
export const consentTypeEnum = z.enum([
  'TERMS',
  'PRIVACY',
  'KYC',
  'CREDIT_CHECK',
  'MARKETING',
  'DATA_SHARING',
]);

export const createCustomerSchema = z.object({
  userId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: genderEnum.optional(),
  maritalStatus: maritalStatusEnum.optional(),
  branchId: z.string().uuid().optional(),
  rmEmployeeId: z.string().uuid().optional(),
  source: customerSourceEnum.default('DIRECT'),
  metadata: z.record(z.unknown()).optional(),
});

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: genderEnum.optional(),
  maritalStatus: maritalStatusEnum.optional(),
  branchId: z.string().uuid().nullable().optional(),
  rmEmployeeId: z.string().uuid().nullable().optional(),
  source: customerSourceEnum.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const listCustomersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  branchId: z.string().uuid().optional(),
  kycStatus: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'VERIFIED', 'REJECTED', 'EXPIRED']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'fullName', 'customerCode']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const customerIdQuerySchema = z.object({
  customerId: z.string().uuid(),
});

export const upsertCustomerProfileSchema = z.object({
  customerId: z.string().uuid(),
  photoS3Key: z.string().max(500).optional(),
  alternatePhone: indianMobile.optional(),
  alternateEmail: z.string().email().optional(),
  preferredLanguage: preferredLanguageEnum.optional(),
  preferredContactChannel: preferredContactChannelEnum.optional(),
  nationality: z.string().max(50).optional(),
  residentialStatus: residentialStatusEnum.optional(),
});

export const createCustomerAddressSchema = z.object({
  customerId: z.string().uuid(),
  addressType: addressTypeEnum,
  line1: z.string().min(1).max(255),
  line2: z.string().max(255).optional(),
  landmark: z.string().max(100).optional(),
  city: z.string().min(1).max(100),
  stateId: z.string().uuid().optional(),
  stateName: z.string().min(1).max(100),
  pincode,
  countryId: z.string().uuid(),
  isPrimary: z.boolean().default(false),
});

export const updateCustomerAddressSchema = createCustomerAddressSchema
  .omit({ customerId: true })
  .partial()
  .extend({
    customerId: z.string().uuid().optional(),
  });

export const listCustomerAddressesQuerySchema = z.object({
  customerId: z.string().uuid(),
  addressType: addressTypeEnum.optional(),
});

export const createCustomerEmploymentSchema = z.object({
  customerId: z.string().uuid(),
  employmentType: employmentTypeEnum,
  employerName: z.string().max(200).optional(),
  designation: z.string().max(100).optional(),
  industryId: z.string().uuid().optional(),
  occupationId: z.string().uuid().optional(),
  yearsInCurrentJob: z.coerce.number().min(0).max(99).optional(),
  totalExperienceYears: z.coerce.number().min(0).max(99).optional(),
  officeAddressId: z.string().uuid().optional(),
  isCurrent: z.boolean().default(true),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateCustomerEmploymentSchema = createCustomerEmploymentSchema
  .omit({ customerId: true })
  .partial();

export const listCustomerEmploymentQuerySchema = z.object({
  customerId: z.string().uuid(),
  isCurrent: z.coerce.boolean().optional(),
});

export const createCustomerIncomeSchema = z.object({
  customerId: z.string().uuid(),
  employmentId: z.string().uuid().optional(),
  incomeType: incomeTypeEnum,
  grossAmount: z.coerce.number().positive(),
  netAmount: z.coerce.number().positive().optional(),
  frequency: incomeFrequencyEnum.default('MONTHLY'),
  currency: z.string().length(3).default('INR'),
  declaredAt: z.coerce.date().default(() => new Date()),
});

export const updateCustomerIncomeSchema = createCustomerIncomeSchema
  .omit({ customerId: true })
  .partial();

export const listCustomerIncomeQuerySchema = z.object({
  customerId: z.string().uuid(),
  employmentId: z.string().uuid().optional(),
});

export const upsertCustomerPreferencesSchema = z.object({
  customerId: z.string().uuid(),
  pushEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
  marketingOptIn: z.boolean().optional(),
  aiAdvisorEnabled: z.boolean().optional(),
  voiceAiEnabled: z.boolean().optional(),
});

export const createCustomerConsentSchema = z.object({
  customerId: z.string().uuid(),
  consentType: consentTypeEnum,
  consentVersion: z.string().min(1).max(20),
  granted: z.boolean(),
});

export const listCustomerConsentsQuerySchema = z.object({
  customerId: z.string().uuid(),
  consentType: consentTypeEnum.optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;
export type UpsertCustomerProfileInput = z.infer<typeof upsertCustomerProfileSchema>;
export type CreateCustomerAddressInput = z.infer<typeof createCustomerAddressSchema>;
export type UpdateCustomerAddressInput = z.infer<typeof updateCustomerAddressSchema>;
export type CreateCustomerEmploymentInput = z.infer<typeof createCustomerEmploymentSchema>;
export type UpdateCustomerEmploymentInput = z.infer<typeof updateCustomerEmploymentSchema>;
export type CreateCustomerIncomeInput = z.infer<typeof createCustomerIncomeSchema>;
export type UpdateCustomerIncomeInput = z.infer<typeof updateCustomerIncomeSchema>;
export type UpsertCustomerPreferencesInput = z.infer<typeof upsertCustomerPreferencesSchema>;
export type CreateCustomerConsentInput = z.infer<typeof createCustomerConsentSchema>;
