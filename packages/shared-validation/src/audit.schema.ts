import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const listAuditLogsQuerySchema = paginationSchema.extend({
  userId: z.string().uuid().optional(),
  action: z.string().max(50).optional(),
  entityType: z.string().max(50).optional(),
  entityId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['createdAt', 'action', 'entityType']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const exportAuditLogsQuerySchema = listAuditLogsQuerySchema.omit({
  page: true,
  limit: true,
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
export type ExportAuditLogsQuery = z.infer<typeof exportAuditLogsQuerySchema>;
