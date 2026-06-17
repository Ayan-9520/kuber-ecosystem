import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

const indianMobile = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number');

export const partnerKycStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
  'VERIFIED',
  'REJECTED',
]);

export const partnerStatusSchema = z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'REJECTED']);

export const listPartnersQuerySchema = paginationSchema.extend({
  partnerTypeId: z.string().uuid().optional(),
  status: partnerStatusSchema.optional(),
  kycStatus: partnerKycStatusSchema.optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['partnerCode', 'businessName', 'contactName', 'createdAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createPartnerSchema = z.object({
  userId: z.string().uuid(),
  partnerTypeId: z.string().uuid(),
  partnerCode: z.string().min(2).max(30),
  businessName: z.string().max(200).optional(),
  contactName: z.string().min(1).max(150),
  phone: indianMobile,
  email: z.string().email().optional(),
  kycStatus: partnerKycStatusSchema.default('NOT_STARTED'),
  status: partnerStatusSchema.default('PENDING'),
  commissionTier: z.string().max(20).optional(),
});

export const updatePartnerSchema = createPartnerSchema
  .omit({ userId: true, partnerCode: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const registerPartnerSchema = z.object({
  phone: indianMobile,
  email: z.string().email().optional(),
  businessName: z.string().max(200).optional(),
  contactName: z.string().min(1).max(150),
  partnerTypeCode: z.string().min(2).max(20).default('DSA'),
});

export type ListPartnersQuery = z.infer<typeof listPartnersQuerySchema>;
export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type RegisterPartnerInput = z.infer<typeof registerPartnerSchema>;
