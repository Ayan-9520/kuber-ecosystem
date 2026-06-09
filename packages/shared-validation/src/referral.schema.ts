import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const referralTypeCodeSchema = z.enum([
  'CUSTOMER',
  'DSA',
  'BUILDER',
  'PROPERTY_DEALER',
  'CA',
  'BROKER',
  'CORPORATE',
]);

export const referralStatusSchema = z.enum([
  'PENDING',
  'ACTIVE',
  'CONVERTED',
  'EXPIRED',
  'CANCELLED',
  'REJECTED',
]);

export const referralRewardStatusSchema = z.enum([
  'NOT_APPLICABLE',
  'PENDING',
  'APPROVED',
  'PAID',
  'REJECTED',
]);

export const listReferralTypesQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['displayOrder', 'name', 'createdAt']).default('displayOrder'),
});

export const createReferralTypeSchema = z.object({
  code: referralTypeCodeSchema,
  name: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  defaultRewardPct: z.coerce.number().min(0).max(100).optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const updateReferralTypeSchema = createReferralTypeSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const listReferralsQuerySchema = paginationSchema.extend({
  referralTypeId: z.string().uuid().optional(),
  referralTypeCode: referralTypeCodeSchema.optional(),
  status: referralStatusSchema.optional(),
  rewardStatus: referralRewardStatusSchema.optional(),
  referrerCustomerId: z.string().uuid().optional(),
  referrerPartnerId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['createdAt', 'convertedAt', 'referralNumber', 'status']).default('createdAt'),
});

export const createReferralSchema = z
  .object({
    referralTypeId: z.string().uuid().optional(),
    referralTypeCode: referralTypeCodeSchema.optional(),
    referrerCustomerId: z.string().uuid().optional(),
    referrerPartnerId: z.string().uuid().optional(),
    referrerEmployeeId: z.string().uuid().optional(),
    referrerName: z.string().min(2).max(200),
    referrerPhone: z.string().max(15).optional(),
    referrerEmail: z.string().email().max(255).optional(),
    refereeName: z.string().min(2).max(200),
    refereePhone: z.string().min(10).max(15),
    refereeEmail: z.string().email().max(255).optional(),
    productId: z.string().uuid().optional(),
    partnerId: z.string().uuid().optional(),
    branchId: z.string().uuid().optional(),
    requestedAmount: z.coerce.number().positive().optional(),
    notes: z.string().max(2000).optional(),
    expiresAt: z.coerce.date().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine((v) => v.referralTypeId || v.referralTypeCode, {
    message: 'Either referralTypeId or referralTypeCode is required',
  });

export const updateReferralSchema = z.object({
  status: referralStatusSchema.optional(),
  refereeName: z.string().min(2).max(200).optional(),
  refereePhone: z.string().min(10).max(15).optional(),
  refereeEmail: z.string().email().max(255).optional(),
  productId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  requestedAmount: z.coerce.number().positive().optional(),
  rewardAmount: z.coerce.number().min(0).optional(),
  rewardStatus: referralRewardStatusSchema.optional(),
  notes: z.string().max(2000).optional(),
  expiresAt: z.coerce.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const convertReferralSchema = z.object({
  customerId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  rewardAmount: z.coerce.number().min(0).optional(),
});

export const rejectReferralSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const validateReferralCodeSchema = z.object({
  referralCode: z.string().min(4).max(20),
});

export type ListReferralTypesQuery = z.infer<typeof listReferralTypesQuerySchema>;
export type CreateReferralTypeInput = z.infer<typeof createReferralTypeSchema>;
export type UpdateReferralTypeInput = z.infer<typeof updateReferralTypeSchema>;
export type ListReferralsQuery = z.infer<typeof listReferralsQuerySchema>;
export type CreateReferralInput = z.infer<typeof createReferralSchema>;
export type UpdateReferralInput = z.infer<typeof updateReferralSchema>;
export type ConvertReferralInput = z.infer<typeof convertReferralSchema>;
