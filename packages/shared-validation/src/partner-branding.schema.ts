import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const partnerBrandExpertiseTypeSchema = z.enum([
  'HOME_LOAN',
  'BUSINESS_LOAN',
  'LOAN_AGAINST_PROPERTY',
  'WORKING_CAPITAL',
  'INSURANCE',
  'CREDIT_CARDS',
  'PERSONAL_LOAN',
  'MSME_FINANCE',
  'BUILDER_FUNDING',
  'PROJECT_FINANCE',
  'VEHICLE_LOAN',
]);

export const partnerBrandAchievementTypeSchema = z.enum([
  'TOP_PERFORMER',
  'ELITE_PARTNER',
  'CHAIRMANS_CIRCLE',
  'PRESIDENT_CLUB',
  'CERTIFIED_ADVISOR',
  'LEADERSHIP_AWARD',
  'BUSINESS_EXCELLENCE',
]);

export const partnerBrandCertificateTypeSchema = z.enum([
  'KUBER_ACADEMY',
  'PRODUCT',
  'INSURANCE',
  'SALES',
  'LEADERSHIP',
  'COMPLIANCE',
]);

export const partnerBrandMediaTypeSchema = z.enum([
  'YOUTUBE',
  'FACEBOOK',
  'INSTAGRAM',
  'ARTICLE',
  'BLOG',
  'SUCCESS_STORY',
]);

export const partnerBrandGalleryCategorySchema = z.enum([
  'OFFICE',
  'TEAM',
  'CUSTOMER_MEETING',
  'AWARD',
  'EVENT',
  'SEMINAR',
]);

export const partnerBrandSocialPlatformSchema = z.enum([
  'LINKEDIN',
  'FACEBOOK',
  'INSTAGRAM',
  'WHATSAPP',
  'X',
  'TELEGRAM',
  'YOUTUBE',
  'WEBSITE',
]);

export const partnerBrandContentTypeSchema = z.enum([
  'BIOGRAPHY',
  'LINKEDIN_SUMMARY',
  'FACEBOOK_INTRO',
  'INSTAGRAM_BIO',
  'BUSINESS_DESCRIPTION',
  'COMPANY_DESCRIPTION',
  'SEO_TITLE',
  'SEO_DESCRIPTION',
  'ARTICLE',
  'BLOG',
  'REELS_CAPTION',
  'SUCCESS_STORY',
  'CASE_STUDY',
  'LINKEDIN_POST',
  'FACEBOOK_POST',
  'INSTAGRAM_CAPTION',
  'BUSINESS_QUOTE',
  'MARKET_UPDATE',
  'FINANCE_TIP',
  'FESTIVAL_GREETING',
  'BIRTHDAY_WISH',
  'LOAN_AWARENESS',
  'INSURANCE_AWARENESS',
]);

const slugSchema = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

const stringArraySchema = z.array(z.string().max(100)).max(20).optional();

export const listProfessionalsQuerySchema = paginationSchema.extend({
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  language: z.string().max(50).optional(),
  companyName: z.string().max(200).optional(),
  expertise: partnerBrandExpertiseTypeSchema.optional(),
  minExperience: z.coerce.number().int().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  gender: z.string().max(20).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['displayName', 'customerRating', 'experienceYears', 'publishedAt', 'profileViews']).default('customerRating'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const slugParamSchema = z.object({
  slug: slugSchema,
});

export const updatePartnerBrandProfileSchema = z
  .object({
    slug: slugSchema.optional(),
    coverImageUrl: z.string().url().max(500).nullable().optional(),
    photoUrl: z.string().url().max(500).nullable().optional(),
    companyLogoUrl: z.string().url().max(500).nullable().optional(),
    displayName: z.string().min(1).max(150).optional(),
    designation: z.string().max(150).nullable().optional(),
    tagline: z.string().max(300).nullable().optional(),
    companyName: z.string().max(200).nullable().optional(),
    companyCategory: z.string().max(100).nullable().optional(),
    biography: z.string().max(10000).nullable().optional(),
    mission: z.string().max(5000).nullable().optional(),
    vision: z.string().max(5000).nullable().optional(),
    experienceYears: z.number().int().min(0).max(60).nullable().optional(),
    businessSince: z.number().int().min(1950).max(2100).nullable().optional(),
    languages: stringArraySchema,
    workingAreas: stringArraySchema,
    gender: z.string().max(20).nullable().optional(),
    city: z.string().max(100).nullable().optional(),
    state: z.string().max(100).nullable().optional(),
    country: z.string().max(60).optional(),
    gstNumber: z.string().max(20).nullable().optional(),
    establishedYear: z.number().int().min(1950).max(2100).nullable().optional(),
    founderName: z.string().max(150).nullable().optional(),
    officeAddress: z.string().max(2000).nullable().optional(),
    citiesServed: stringArraySchema,
    companyWebsite: z.string().url().max(500).nullable().optional(),
    phone: z.string().max(15).nullable().optional(),
    whatsapp: z.string().max(15).nullable().optional(),
    email: z.string().email().nullable().optional(),
    consultationUrl: z.string().url().max(500).nullable().optional(),
    calendarUrl: z.string().url().max(500).nullable().optional(),
    applyLoanUrl: z.string().url().max(500).nullable().optional(),
    applyInsuranceUrl: z.string().url().max(500).nullable().optional(),
    seoTitle: z.string().max(200).nullable().optional(),
    seoDescription: z.string().max(500).nullable().optional(),
    seoKeywords: stringArraySchema,
    themePreference: z.enum(['light', 'dark']).optional(),
    expertises: z.array(partnerBrandExpertiseTypeSchema).max(20).optional(),
    socialLinks: z
      .array(
        z.object({
          platform: partnerBrandSocialPlatformSchema,
          url: z.string().url().max(500),
        }),
      )
      .max(10)
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const publishPartnerBrandSchema = z.object({
  publish: z.boolean(),
});

export const generateBrandContentSchema = z.object({
  type: partnerBrandContentTypeSchema,
  prompt: z.string().max(2000).optional(),
});

export const partnerBrandAchievementInputSchema = z.object({
  type: partnerBrandAchievementTypeSchema,
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  year: z.number().int().min(1990).max(2100).optional(),
  imageUrl: z.string().url().max(500).optional(),
});

export const partnerBrandCertificateInputSchema = z.object({
  type: partnerBrandCertificateTypeSchema,
  title: z.string().min(1).max(200),
  issuer: z.string().max(200).optional(),
  issuedAt: z.string().datetime().optional(),
  imageUrl: z.string().url().max(500).optional(),
  downloadUrl: z.string().url().max(500).optional(),
});

export const partnerBrandReviewInputSchema = z.object({
  reviewerName: z.string().min(1).max(150),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  photoUrl: z.string().url().max(500).optional(),
  videoUrl: z.string().url().max(500).optional(),
});

export const partnerBrandMediaInputSchema = z.object({
  type: partnerBrandMediaTypeSchema,
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  url: z.string().url().max(500),
  thumbnailUrl: z.string().url().max(500).optional(),
});

export const partnerBrandGalleryInputSchema = z.object({
  category: partnerBrandGalleryCategorySchema,
  title: z.string().max(200).optional(),
  imageUrl: z.string().url().max(500),
  caption: z.string().max(1000).optional(),
});

export const partnerBrandTeamMemberInputSchema = z.object({
  name: z.string().min(1).max(150),
  role: z.string().max(150).optional(),
  photoUrl: z.string().url().max(500).optional(),
});

export type ListProfessionalsQuery = z.infer<typeof listProfessionalsQuerySchema>;
export type UpdatePartnerBrandProfileInput = z.infer<typeof updatePartnerBrandProfileSchema>;
export type GenerateBrandContentInput = z.infer<typeof generateBrandContentSchema>;
export type PartnerBrandAchievementInput = z.infer<typeof partnerBrandAchievementInputSchema>;
export type PartnerBrandCertificateInput = z.infer<typeof partnerBrandCertificateInputSchema>;
export type PartnerBrandReviewInput = z.infer<typeof partnerBrandReviewInputSchema>;
export type PartnerBrandMediaInput = z.infer<typeof partnerBrandMediaInputSchema>;
export type PartnerBrandGalleryInput = z.infer<typeof partnerBrandGalleryInputSchema>;
export type PartnerBrandTeamMemberInput = z.infer<typeof partnerBrandTeamMemberInputSchema>;
