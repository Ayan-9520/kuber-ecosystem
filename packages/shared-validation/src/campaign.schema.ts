import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const campaignChannelSchema = z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP']);

export const campaignStatusSchema = z.enum([
  'DRAFT',
  'SCHEDULED',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
]);

export const campaignAudienceSchema = z.enum([
  'ALL_CUSTOMERS',
  'LEADS',
  'DSA_PARTNERS',
  'BRANCH_CUSTOMERS',
  'CUSTOM_SEGMENT',
]);

export const listCampaignsQuerySchema = paginationSchema.extend({
  status: campaignStatusSchema.optional(),
  channel: campaignChannelSchema.optional(),
  audience: campaignAudienceSchema.optional(),
  branchId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  includeDeleted: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'status', 'startDate', 'createdAt', 'sent', 'converted']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const createCampaignSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  channel: campaignChannelSchema,
  audience: campaignAudienceSchema,
  status: campaignStatusSchema.default('DRAFT'),
  subject: z.string().max(500).optional(),
  body: z.string().max(50000).optional(),
  metadata: z.record(z.unknown()).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  branchId: z.string().uuid().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const updateCampaignMetricsSchema = z.object({
  sent: z.coerce.number().int().min(0).optional(),
  opened: z.coerce.number().int().min(0).optional(),
  clicked: z.coerce.number().int().min(0).optional(),
  converted: z.coerce.number().int().min(0).optional(),
});

export type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type UpdateCampaignMetricsInput = z.infer<typeof updateCampaignMetricsSchema>;
