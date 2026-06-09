import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const ticketPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const ticketStatusSchema = z.enum([
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'PENDING_CUSTOMER',
  'PENDING_INTERNAL',
  'RESOLVED',
  'CLOSED',
  'REJECTED',
]);

export const ticketEscalationLevelSchema = z.enum([
  'L1_SUPPORT',
  'L2_SUPPORT',
  'SUPPORT_MANAGER',
  'BRANCH_MANAGER',
  'REGIONAL_MANAGER',
  'ADMIN',
]);

export const ticketMessageTypeSchema = z.enum(['CUSTOMER', 'AGENT', 'INTERNAL', 'SYSTEM']);

export const ticketCategoryCodeSchema = z.enum([
  'GENERAL_INQUIRY',
  'LOAN_APPLICATION',
  'KYC',
  'DOCUMENTS',
  'ELIGIBILITY',
  'EMI',
  'DISBURSEMENT',
  'COMMISSION',
  'REFERRAL',
  'TECHNICAL_ISSUE',
  'COMPLAINT',
]);

export const listTicketsQuerySchema = paginationSchema.extend({
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  categoryId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  escalationLevel: ticketEscalationLevelSchema.optional(),
  slaBreached: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  search: z.string().max(100).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status', 'ticketNumber']).default('createdAt'),
});

export const createTicketSchema = z.object({
  subject: z.string().min(3).max(300),
  description: z.string().min(10).max(10000),
  categoryId: z.string().uuid(),
  priority: ticketPrioritySchema.default('MEDIUM'),
  customerId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateTicketSchema = createTicketSchema.partial().extend({
  status: ticketStatusSchema.optional(),
  statusReason: z.string().max(500).optional(),
});

export const assignTicketSchema = z.object({
  assignedToId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().optional(),
  reason: z.string().max(500).optional(),
});

export const escalateTicketSchema = z.object({
  toLevel: ticketEscalationLevelSchema,
  reason: z.string().max(500).optional(),
});

export const resolveTicketSchema = z.object({
  resolutionNotes: z.string().min(10).max(5000),
  resolutionType: z.string().max(50).optional(),
});

export const closeTicketSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const rejectTicketSchema = z.object({
  reason: z.string().min(5).max(500),
});

export const createTicketMessageSchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().min(1).max(10000),
  messageType: ticketMessageTypeSchema.default('AGENT'),
  isInternal: z.boolean().default(false),
});

export const listTicketMessagesQuerySchema = paginationSchema.extend({
  ticketId: z.string().uuid(),
  includeInternal: z.coerce.boolean().default(true),
  sortBy: z.enum(['createdAt']).default('createdAt'),
});

export const listTicketAssignmentsQuerySchema = paginationSchema.extend({
  ticketId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt']).default('createdAt'),
});

export const listTicketEscalationsQuerySchema = paginationSchema.extend({
  ticketId: z.string().uuid().optional(),
  sortBy: z.enum(['escalatedAt']).default('escalatedAt'),
});

export const listTicketResolutionsQuerySchema = paginationSchema.extend({
  ticketId: z.string().uuid().optional(),
  sortBy: z.enum(['resolvedAt']).default('resolvedAt'),
});

export const createTicketAttachmentSchema = z.object({
  ticketId: z.string().uuid(),
  messageId: z.string().uuid().optional(),
  fileName: z.string().min(1).max(255),
  s3Key: z.string().min(1).max(500),
  mimeType: z.string().min(3).max(100),
  fileSizeBytes: z.number().int().positive(),
});

export const listTicketCategoriesQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['sortOrder', 'name', 'code']).default('sortOrder'),
});

export const createTicketCategorySchema = z.object({
  code: ticketCategoryCodeSchema,
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().default(0),
});

export const updateTicketCategorySchema = createTicketCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const ticketAnalyticsQuerySchema = z.object({
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const ticketTimelineQuerySchema = paginationSchema.extend({
  ticketId: z.string().uuid(),
});

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type EscalateTicketInput = z.infer<typeof escalateTicketSchema>;
export type ResolveTicketInput = z.infer<typeof resolveTicketSchema>;
export type CloseTicketInput = z.infer<typeof closeTicketSchema>;
export type RejectTicketInput = z.infer<typeof rejectTicketSchema>;
export type CreateTicketMessageInput = z.infer<typeof createTicketMessageSchema>;
export type ListTicketMessagesQuery = z.infer<typeof listTicketMessagesQuerySchema>;
export type ListTicketAssignmentsQuery = z.infer<typeof listTicketAssignmentsQuerySchema>;
export type ListTicketEscalationsQuery = z.infer<typeof listTicketEscalationsQuerySchema>;
export type ListTicketResolutionsQuery = z.infer<typeof listTicketResolutionsQuerySchema>;
export type CreateTicketAttachmentInput = z.infer<typeof createTicketAttachmentSchema>;
export type ListTicketCategoriesQuery = z.infer<typeof listTicketCategoriesQuerySchema>;
export type CreateTicketCategoryInput = z.infer<typeof createTicketCategorySchema>;
export type UpdateTicketCategoryInput = z.infer<typeof updateTicketCategorySchema>;
export type TicketAnalyticsQuery = z.infer<typeof ticketAnalyticsQuerySchema>;
export type TicketTimelineQuery = z.infer<typeof ticketTimelineQuerySchema>;
