import { z } from 'zod';

const statementStatusEnum = z.enum(['UPLOADED', 'PARSED', 'RECONCILED', 'CLOSED']);
const matchTypeEnum = z.enum(['EXACT', 'PROBABLE', 'UNMATCHED']);
const varianceTypeEnum = z.enum(['SHORT_PAYMENT', 'EXCESS', 'MATCHED', 'MISSING']);
const matchStatusEnum = z.enum([
  'PENDING_REVIEW',
  'ACCEPTED',
  'DISPUTED',
  'WRITTEN_OFF',
  'RESOLVED',
]);
const disputeStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']);

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

const statementPeriodSchema = z
  .object({
    month: z.string().trim().max(20).optional().nullable(),
    year: z.coerce.number().int().min(2000).max(2100).optional().nullable(),
    from: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
    to: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  })
  .optional();

export const listStatementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  bankName: z.string().trim().max(150).optional(),
  status: statementStatusEnum.optional(),
  period: z.string().trim().max(40).optional(),
  search: z.string().trim().max(200).optional(),
});

export const listMatchesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  statementId: z.string().uuid().optional(),
  matchType: matchTypeEnum.optional(),
  varianceType: varianceTypeEnum.optional(),
  status: matchStatusEnum.optional(),
  bankName: z.string().trim().max(150).optional(),
  search: z.string().trim().max(200).optional(),
});

export const listDisputesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: disputeStatusEnum.optional(),
  bankName: z.string().trim().max(150).optional(),
  search: z.string().trim().max(200).optional(),
});

export const listAuditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  entityId: z.string().uuid().optional(),
  action: z.string().trim().max(100).optional(),
  entityType: z.string().trim().max(50).optional(),
});

const lineInputSchema = z.object({
  bankReference: z.string().trim().max(100).optional(),
  loanAccountNumber: z.string().trim().max(50).optional(),
  applicationNumber: z.string().trim().max(50).optional(),
  customerName: z.string().trim().min(1).max(150),
  pan: z.string().trim().max(10).optional(),
  disbursedAmount: z.number().nonnegative().optional(),
  commissionAmount: z.number(),
  gstAmount: z.number().nonnegative().optional(),
  tdsAmount: z.number().nonnegative().optional(),
  netAmount: z.number().optional(),
  payoutDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  rawPayload: z.record(z.unknown()).optional(),
});

export const createStatementSchema = z.object({
  bankName: z.string().trim().min(1).max(150),
  statementPeriod: statementPeriodSchema,
  fileName: z.string().trim().min(1).max(255),
  lines: z.array(lineInputSchema).min(1, 'At least one statement line is required'),
});

export const reviewMatchSchema = z.object({
  action: z.enum(['accept', 'dispute', 'write-off', 'resolve']),
  note: z.string().trim().max(2000).optional(),
  reason: z.string().trim().max(2000).optional(),
});

export const createDisputeSchema = z.object({
  reason: z.string().trim().min(1).max(2000),
  amount: z.number().nonnegative().optional(),
});

export const updateDisputeSchema = z
  .object({
    status: disputeStatusEnum,
    resolutionNotes: z.string().trim().max(2000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });
