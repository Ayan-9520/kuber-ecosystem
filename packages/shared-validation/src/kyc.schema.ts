import { z } from 'zod';

const panRegex = z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format');
const aadhaarRegex = z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits');

export const kycEntityQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
});

export const upsertKycProfileSchema = z.object({
  customerId: z.string().uuid(),
  photoS3Key: z.string().max(500).optional(),
  ckycNumber: z.string().max(20).optional(),
});

export const submitPanSchema = z.object({
  customerId: z.string().uuid().optional(),
  pan: panRegex,
  nameOnPan: z.string().min(1).max(200).optional(),
});

export const aadhaarSendOtpSchema = z.object({
  customerId: z.string().uuid().optional(),
  aadhaar: aadhaarRegex,
});

export const aadhaarVerifySchema = z.object({
  customerId: z.string().uuid().optional(),
  aadhaar: aadhaarRegex,
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const listKycAuditQuerySchema = z.object({
  customerId: z.string().uuid(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type UpsertKycProfileInput = z.infer<typeof upsertKycProfileSchema>;
export type SubmitPanInput = z.infer<typeof submitPanSchema>;
export type AadhaarSendOtpInput = z.infer<typeof aadhaarSendOtpSchema>;
export type AadhaarVerifyInput = z.infer<typeof aadhaarVerifySchema>;
