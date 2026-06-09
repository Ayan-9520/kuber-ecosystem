export {
  assignTicketSchema,
  closeTicketSchema,
  createTicketAttachmentSchema,
  createTicketCategorySchema,
  createTicketMessageSchema,
  createTicketSchema,
  escalateTicketSchema,
  listTicketAssignmentsQuerySchema,
  listTicketCategoriesQuerySchema,
  listTicketEscalationsQuerySchema,
  listTicketMessagesQuerySchema,
  listTicketResolutionsQuerySchema,
  listTicketsQuerySchema,
  rejectTicketSchema,
  resolveTicketSchema,
  ticketAnalyticsQuerySchema,
  ticketTimelineQuerySchema,
  updateTicketCategorySchema,
  updateTicketSchema,
} from '@kuberone/shared-validation';

export { z } from 'zod';

import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const createTicketAttachmentBodySchema = z.object({
  messageId: z.string().uuid().optional(),
  fileName: z.string().min(1).max(255),
  s3Key: z.string().min(1).max(500),
  mimeType: z.string().min(3).max(100),
  fileSizeBytes: z.number().int().positive(),
});
