import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const documentStatusSchema = z.enum([
  'UPLOADED',
  'PENDING_VERIFICATION',
  'VERIFIED',
  'REJECTED',
  'DEFICIENT',
  'EXPIRED',
]);

export const documentOwnerTypeSchema = z.enum(['CUSTOMER', 'LEAD', 'APPLICATION', 'PARTNER', 'EMPLOYEE']);
export const documentUploadReasonSchema = z.enum(['INITIAL', 'REUPLOAD', 'CORRECTION']);
export const documentRequestStatusSchema = z.enum(['PENDING', 'FULFILLED', 'WAIVED', 'EXPIRED']);
export const ocrProviderSchema = z.enum(['INTERNAL', 'AWS_TEXTRACT', 'THIRD_PARTY']);
export const verificationResultTypeSchema = z.enum(['APPROVED', 'REJECTED', 'NEEDS_REVIEW']);
export const verificationModeSchema = z.enum(['AUTO', 'MANUAL']);
export const deficiencyTypeSchema = z.enum(['MISSING', 'ILLEGIBLE', 'EXPIRED', 'MISMATCH', 'INSUFFICIENT']);
export const deficiencyStatusSchema = z.enum(['OPEN', 'RESOLVED', 'WAIVED']);
export const documentTypeCategorySchema = z.enum([
  'KYC',
  'INCOME',
  'PROPERTY',
  'VEHICLE',
  'BUSINESS',
  'AGREEMENT',
  'IDENTITY',
  'OTHER',
]);

export const ownerLinkSchema = z.object({
  ownerType: documentOwnerTypeSchema,
  customerId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
});

export const uploadDocumentSchema = ownerLinkSchema.extend({
  documentTypeId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(3).max(100),
  contentBase64: z.string().min(1),
  expiresAt: z.coerce.date().optional(),
  metadata: z.record(z.unknown()).optional(),
  runOcr: z.boolean().default(true),
  autoVerify: z.boolean().default(false),
});

export const presignUploadSchema = ownerLinkSchema.extend({
  documentTypeId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(3).max(100),
  fileSizeBytes: z.number().int().positive(),
});

export const confirmUploadSchema = ownerLinkSchema.extend({
  uploadToken: z.string().uuid(),
  documentTypeId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(3).max(100),
  s3Key: z.string().min(1).max(500),
  fileSizeBytes: z.number().int().positive(),
  checksum: z.string().length(64),
  expiresAt: z.coerce.date().optional(),
  metadata: z.record(z.unknown()).optional(),
  runOcr: z.boolean().default(true),
});

export const replaceDocumentSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(3).max(100),
  contentBase64: z.string().min(1),
  uploadReason: documentUploadReasonSchema.default('REUPLOAD'),
  runOcr: z.boolean().default(true),
});

export const listDocumentsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  status: documentStatusSchema.optional(),
  documentTypeId: z.string().uuid().optional(),
  ownerType: documentOwnerTypeSchema.optional(),
  customerId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['createdAt', 'updatedAt', 'fileName', 'status']).default('createdAt'),
});

export const verifyDocumentSchema = z.object({
  result: verificationResultTypeSchema,
  mode: verificationModeSchema.default('MANUAL'),
  rejectionReason: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export const createDocumentTypeSchema = z.object({
  code: z.string().min(2).max(30).toUpperCase(),
  name: z.string().min(2).max(100),
  category: documentTypeCategorySchema,
  allowedMimeTypes: z.array(z.string()).default(['application/pdf', 'image/jpeg', 'image/png']),
  maxSizeMb: z.number().int().positive().default(10),
  requiresOcr: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateDocumentTypeSchema = createDocumentTypeSchema.partial();

export const listDocumentTypesQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  category: documentTypeCategorySchema.optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'code', 'createdAt']).default('name'),
});

export const createDocumentRequestSchema = z.object({
  applicationId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  documentTypeId: z.string().uuid(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateDocumentRequestSchema = z.object({
  status: documentRequestStatusSchema.optional(),
  dueDate: z.coerce.date().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  fulfilledDocumentId: z.string().uuid().nullable().optional(),
});

export const listDocumentRequestsQuerySchema = paginationSchema.extend({
  applicationId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  status: documentRequestStatusSchema.optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'status']).default('createdAt'),
});

export const listDocumentVersionsQuerySchema = paginationSchema.extend({
  documentId: z.string().uuid(),
  sortBy: z.enum(['versionNumber', 'createdAt']).default('versionNumber'),
});

export const runOcrSchema = z.object({
  documentId: z.string().uuid(),
  documentVersionId: z.string().uuid().optional(),
  provider: ocrProviderSchema.default('INTERNAL'),
});

export const listOcrResultsQuerySchema = paginationSchema.extend({
  documentId: z.string().uuid().optional(),
  sortBy: z.enum(['processedAt', 'createdAt']).default('processedAt'),
});

export const autoVerifySchema = z.object({
  documentId: z.string().uuid(),
});

export const listVerificationResultsQuerySchema = paginationSchema.extend({
  documentId: z.string().uuid().optional(),
  result: verificationResultTypeSchema.optional(),
  sortBy: z.enum(['verifiedAt', 'createdAt']).default('verifiedAt'),
});

export const createDocumentDeficiencySchema = z.object({
  applicationId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  documentRequestId: z.string().uuid().optional(),
  documentId: z.string().uuid().optional(),
  deficiencyType: deficiencyTypeSchema,
  description: z.string().min(1).max(2000),
});

export const updateDocumentDeficiencySchema = z.object({
  status: deficiencyStatusSchema.optional(),
  description: z.string().max(2000).optional(),
});

export const listDocumentDeficienciesQuerySchema = paginationSchema.extend({
  applicationId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  status: deficiencyStatusSchema.optional(),
  deficiencyType: deficiencyTypeSchema.optional(),
  sortBy: z.enum(['createdAt', 'status']).default('createdAt'),
});

export const scanDeficienciesSchema = z.object({
  applicationId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  requiredDocumentTypeIds: z.array(z.string().uuid()).optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;
export type ReplaceDocumentInput = z.infer<typeof replaceDocumentSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
export type VerifyDocumentInput = z.infer<typeof verifyDocumentSchema>;
export type CreateDocumentTypeInput = z.infer<typeof createDocumentTypeSchema>;
export type UpdateDocumentTypeInput = z.infer<typeof updateDocumentTypeSchema>;
export type ListDocumentTypesQuery = z.infer<typeof listDocumentTypesQuerySchema>;
export type CreateDocumentRequestInput = z.infer<typeof createDocumentRequestSchema>;
export type UpdateDocumentRequestInput = z.infer<typeof updateDocumentRequestSchema>;
export type ListDocumentRequestsQuery = z.infer<typeof listDocumentRequestsQuerySchema>;
export type ListDocumentVersionsQuery = z.infer<typeof listDocumentVersionsQuerySchema>;
export type RunOcrInput = z.infer<typeof runOcrSchema>;
export type ListOcrResultsQuery = z.infer<typeof listOcrResultsQuerySchema>;
export type AutoVerifyInput = z.infer<typeof autoVerifySchema>;
export type ListVerificationResultsQuery = z.infer<typeof listVerificationResultsQuerySchema>;
export type CreateDocumentDeficiencyInput = z.infer<typeof createDocumentDeficiencySchema>;
export type UpdateDocumentDeficiencyInput = z.infer<typeof updateDocumentDeficiencySchema>;
export type ListDocumentDeficienciesQuery = z.infer<typeof listDocumentDeficienciesQuerySchema>;
export type ScanDeficienciesInput = z.infer<typeof scanDeficienciesSchema>;
