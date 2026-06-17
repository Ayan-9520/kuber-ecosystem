import {
  employmentTypeSchema,
  financeProductSlugSchema,
} from '@kuberone/shared-validation';
import { z } from 'zod';


export const aiLanguageSchema = z.enum(['en', 'hi', 'hinglish']);

export const aiChatSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
  language: aiLanguageSchema.default('en'),
  customerId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  productSlug: financeProductSlugSchema.optional(),
  monthlyIncome: z.coerce.number().positive().optional(),
  creditScore: z.coerce.number().int().min(300).max(900).optional(),
  requestedLoanAmount: z.coerce.number().positive().optional(),
  requestedTenureMonths: z.coerce.number().int().min(1).max(480).optional(),
});

export const aiContextSchema = z.object({
  customerId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  productSlug: financeProductSlugSchema.optional(),
  productId: z.string().uuid().optional(),
  language: aiLanguageSchema.default('en'),
  includeKnowledge: z.coerce.boolean().default(true),
});

export const aiRecommendationSchema = z.object({
  customerId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  monthlyIncome: z.coerce.number().positive().optional(),
  creditScore: z.coerce.number().int().min(300).max(900).optional(),
  propertyValue: z.coerce.number().positive().optional(),
  vehicleValue: z.coerce.number().positive().optional(),
  preferredSegment: z.enum(['HOME', 'AUTO', 'BUSINESS']).optional(),
  requestedLoanAmount: z.coerce.number().positive().optional(),
  requestedTenureMonths: z.coerce.number().int().min(1).max(480).default(240),
  interestRate: z.coerce.number().min(0).max(100).default(9.5),
});

export const aiEligibilitySchema = z
  .object({
    productSlug: financeProductSlugSchema.optional(),
    productId: z.string().uuid().optional(),
    variantId: z.string().uuid().optional(),
    customerId: z.string().uuid().optional(),
    leadId: z.string().uuid().optional(),
    applicationId: z.string().uuid().optional(),
    age: z.coerce.number().int().min(18).max(100).optional(),
    monthlyIncome: z.coerce.number().positive().optional(),
    annualIncome: z.coerce.number().positive().optional(),
    employmentType: employmentTypeSchema.optional(),
    creditScore: z.coerce.number().int().min(300).max(900).optional(),
    propertyValue: z.coerce.number().positive().optional(),
    vehicleValue: z.coerce.number().positive().optional(),
    existingObligations: z.coerce.number().min(0).default(0),
    existingEmi: z.coerce.number().min(0).optional(),
    requestedLoanAmount: z.coerce.number().positive().optional(),
    requestedTenureMonths: z.coerce.number().int().min(1).max(480).optional(),
    interestRate: z.coerce.number().min(0).max(100).optional(),
    language: aiLanguageSchema.default('en'),
    includeLenderRecommendations: z.boolean().default(true),
    includeApprovalProbability: z.boolean().default(true),
  })
  .refine((v) => v.productSlug || v.productId || v.monthlyIncome, {
    message: 'Provide productSlug, productId, or monthlyIncome for assessment',
  });

export const listConversationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AiChatInputValidated = z.infer<typeof aiChatSchema>;
export type AiContextInputValidated = z.infer<typeof aiContextSchema>;
export type AiRecommendationInputValidated = z.infer<typeof aiRecommendationSchema>;
export type AiEligibilityInputValidated = z.infer<typeof aiEligibilitySchema>;
