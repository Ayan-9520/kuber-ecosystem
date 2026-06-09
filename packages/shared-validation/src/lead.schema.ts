import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const leadGradeSchema = z.enum(['A_PLUS', 'A', 'B', 'C', 'REJECTED']);
export const leadStatusSchema = z.enum([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'DOCUMENT_PENDING',
  'IN_PROCESS',
  'APPLICATION_CREATED',
  'SANCTIONED',
  'DISBURSED',
  'REJECTED',
  'LOST',
]);
export const leadPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const leadSourceChannelSchema = z.enum(['DIGITAL', 'PARTNER', 'DIRECT', 'INBOUND']);
export const leadAssignmentTypeSchema = z.enum(['AUTO', 'MANUAL', 'ROUND_ROBIN', 'LOAD_BALANCE', 'ESCALATION', 'BRANCH']);
export const leadActivityTypeSchema = z.enum([
  'CALL',
  'SMS',
  'EMAIL',
  'WHATSAPP',
  'MEETING',
  'NOTE',
  'STATUS_CHANGE',
  'ASSIGNMENT',
  'DOCUMENT',
]);
export const leadActivityDispositionSchema = z.enum([
  'CONNECTED',
  'NO_ANSWER',
  'CALLBACK',
  'NOT_INTERESTED',
  'INTERESTED',
  'BUSY',
  'WRONG_NUMBER',
]);
export const leadFollowUpTypeSchema = z.enum(['CALL', 'WHATSAPP', 'SMS', 'EMAIL', 'MEETING', 'DOCUMENT_REQUEST']);
export const leadFollowUpStatusSchema = z.enum(['PENDING', 'COMPLETED', 'MISSED', 'CANCELLED', 'ESCALATED']);

export const scoringProfileSchema = z.object({
  monthlyIncome: z.number().nonnegative().optional(),
  annualIncome: z.number().nonnegative().optional(),
  propertyValue: z.number().nonnegative().optional(),
  vehicleValue: z.number().nonnegative().optional(),
  businessTurnover: z.number().nonnegative().optional(),
  loanAmount: z.number().nonnegative().optional(),
  location: z.string().optional(),
  occupation: z.string().optional(),
  productType: z.string().optional(),
  creditScore: z.number().int().min(300).max(900).optional(),
  employmentType: z.string().optional(),
});

export const createLeadSourceSchema = z.object({
  code: z.string().min(2).max(20).toUpperCase(),
  name: z.string().min(2).max(100),
  channel: leadSourceChannelSchema,
  isActive: z.boolean().default(true),
});

export const updateLeadSourceSchema = createLeadSourceSchema.partial();

export const listLeadSourcesQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  channel: leadSourceChannelSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'code', 'createdAt']).default('name'),
});

export const createLeadSchema = z.object({
  customerId: z.string().uuid().optional(),
  prospectName: z.string().min(2).max(200),
  prospectPhone: z.string().min(10).max(15),
  prospectEmail: z.string().email().optional(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  sourceId: z.string().uuid(),
  partnerId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  requestedAmount: z.number().positive().optional(),
  priority: leadPrioritySchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  scoringProfile: scoringProfileSchema.optional(),
  assignImmediately: z.boolean().default(true),
});

export const updateLeadSchema = z.object({
  customerId: z.string().uuid().nullable().optional(),
  prospectName: z.string().min(2).max(200).optional(),
  prospectPhone: z.string().min(10).max(15).optional(),
  prospectEmail: z.string().email().nullable().optional(),
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().nullable().optional(),
  sourceId: z.string().uuid().optional(),
  partnerId: z.string().uuid().nullable().optional(),
  branchId: z.string().uuid().nullable().optional(),
  regionId: z.string().uuid().nullable().optional(),
  status: leadStatusSchema.optional(),
  priority: leadPrioritySchema.optional(),
  requestedAmount: z.number().positive().nullable().optional(),
  lostReason: z.string().max(200).nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
  rescore: z.boolean().optional(),
  scoringProfile: scoringProfileSchema.optional(),
});

export const listLeadsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  status: leadStatusSchema.optional(),
  grade: leadGradeSchema.optional(),
  priority: leadPrioritySchema.optional(),
  sourceId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'prospectName', 'score', 'status', 'slaDeadline'])
    .default('createdAt'),
});

export const exportLeadsQuerySchema = listLeadsQuerySchema.omit({ page: true, limit: true }).extend({
  format: z.enum(['csv', 'json']).default('csv'),
});

export const assignLeadSchema = z.object({
  assignedToId: z.string().uuid(),
  assignmentType: leadAssignmentTypeSchema.default('MANUAL'),
  branchId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

export const autoAssignLeadSchema = z.object({
  branchId: z.string().uuid().optional(),
  assignmentType: z.enum(['ROUND_ROBIN', 'LOAD_BALANCE', 'AUTO', 'BRANCH']).default('ROUND_ROBIN'),
});

export const scoreLeadSchema = z.object({
  leadId: z.string().uuid(),
  scoringProfile: scoringProfileSchema.optional(),
  aiScore: z.number().min(0).max(100).optional(),
});

export const listLeadScoresQuerySchema = paginationSchema.extend({
  leadId: z.string().uuid().optional(),
  grade: leadGradeSchema.optional(),
  sortBy: z.enum(['calculatedAt', 'score', 'createdAt']).default('calculatedAt'),
});

export const listLeadAssignmentsQuerySchema = paginationSchema.extend({
  leadId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  isCurrent: z.coerce.boolean().optional(),
  assignmentType: leadAssignmentTypeSchema.optional(),
  sortBy: z.enum(['assignedAt', 'createdAt']).default('assignedAt'),
});

export const createLeadActivitySchema = z.object({
  leadId: z.string().uuid(),
  activityType: leadActivityTypeSchema,
  description: z.string().max(2000).optional(),
  disposition: leadActivityDispositionSchema.optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
  scheduledAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const listLeadActivitiesQuerySchema = paginationSchema.extend({
  leadId: z.string().uuid().optional(),
  activityType: leadActivityTypeSchema.optional(),
  performedById: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'scheduledAt']).default('createdAt'),
});

export const createLeadNoteSchema = z.object({
  leadId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  isPinned: z.boolean().default(false),
});

export const updateLeadNoteSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  isPinned: z.boolean().optional(),
});

export const listLeadNotesQuerySchema = paginationSchema.extend({
  leadId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  isPinned: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
});

export const createLeadFollowUpSchema = z.object({
  leadId: z.string().uuid(),
  assignedToId: z.string().uuid(),
  followUpType: leadFollowUpTypeSchema,
  scheduledAt: z.coerce.date(),
  notes: z.string().max(2000).optional(),
});

export const updateLeadFollowUpSchema = z.object({
  assignedToId: z.string().uuid().optional(),
  followUpType: leadFollowUpTypeSchema.optional(),
  scheduledAt: z.coerce.date().optional(),
  status: leadFollowUpStatusSchema.optional(),
  notes: z.string().max(2000).nullable().optional(),
  completedAt: z.coerce.date().nullable().optional(),
});

export const listLeadFollowUpsQuerySchema = paginationSchema.extend({
  leadId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  status: leadFollowUpStatusSchema.optional(),
  followUpType: leadFollowUpTypeSchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  overdue: z.coerce.boolean().optional(),
  sortBy: z.enum(['scheduledAt', 'createdAt', 'status']).default('scheduledAt'),
});

export const leadTimelineQuerySchema = paginationSchema.extend({
  leadId: z.string().uuid(),
  eventTypes: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',') : undefined)),
});

export const leadAnalyticsQuerySchema = z.object({
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export type CreateLeadSourceInput = z.infer<typeof createLeadSourceSchema>;
export type UpdateLeadSourceInput = z.infer<typeof updateLeadSourceSchema>;
export type ListLeadSourcesQuery = z.infer<typeof listLeadSourcesQuerySchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
export type ExportLeadsQuery = z.infer<typeof exportLeadsQuerySchema>;
export type AssignLeadInput = z.infer<typeof assignLeadSchema>;
export type AutoAssignLeadInput = z.infer<typeof autoAssignLeadSchema>;
export type ScoreLeadInput = z.infer<typeof scoreLeadSchema>;
export type ListLeadScoresQuery = z.infer<typeof listLeadScoresQuerySchema>;
export type ListLeadAssignmentsQuery = z.infer<typeof listLeadAssignmentsQuerySchema>;
export type CreateLeadActivityInput = z.infer<typeof createLeadActivitySchema>;
export type ListLeadActivitiesQuery = z.infer<typeof listLeadActivitiesQuerySchema>;
export type CreateLeadNoteInput = z.infer<typeof createLeadNoteSchema>;
export type UpdateLeadNoteInput = z.infer<typeof updateLeadNoteSchema>;
export type ListLeadNotesQuery = z.infer<typeof listLeadNotesQuerySchema>;
export type CreateLeadFollowUpInput = z.infer<typeof createLeadFollowUpSchema>;
export type UpdateLeadFollowUpInput = z.infer<typeof updateLeadFollowUpSchema>;
export type ListLeadFollowUpsQuery = z.infer<typeof listLeadFollowUpsQuerySchema>;
export type LeadTimelineQuery = z.infer<typeof leadTimelineQuerySchema>;
export type LeadAnalyticsQuery = z.infer<typeof leadAnalyticsQuerySchema>;
export type ScoringProfile = z.infer<typeof scoringProfileSchema>;
