import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const observabilityLogLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'] as const;
export const observabilityLogCategories = [
  'APPLICATION', 'AUTH', 'RBAC', 'CUSTOMER', 'LMS', 'LOS', 'DOCUMENT',
  'REFERRAL', 'COMMISSION', 'SUPPORT', 'NOTIFICATION', 'AI', 'DATABASE', 'SYSTEM', 'SECURITY', 'BUSINESS',
] as const;
export const observabilityErrorSources = ['BACKEND', 'FRONTEND', 'MOBILE', 'AI', 'NOTIFICATION', 'DATABASE'] as const;
export const observabilityEventTypes = ['BUSINESS', 'AUTH', 'SECURITY', 'WORKFLOW', 'AI', 'NOTIFICATION'] as const;

export const observabilityQuerySchema = z.object({
  period: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const listObservabilityLogsQuerySchema = paginationSchema.extend({
  level: z.enum(observabilityLogLevels).optional(),
  category: z.enum(observabilityLogCategories).optional(),
  module: z.string().max(64).optional(),
  userId: z.string().uuid().optional(),
  requestId: z.string().max(64).optional(),
  traceId: z.string().max(64).optional(),
  correlationId: z.string().max(64).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'level', 'module']).default('createdAt'),
});

export const listObservabilityTracesQuerySchema = paginationSchema.extend({
  status: z.enum(['OK', 'ERROR', 'UNSET']).optional(),
  userId: z.string().uuid().optional(),
  requestId: z.string().max(64).optional(),
  traceId: z.string().max(64).optional(),
  correlationId: z.string().max(64).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['startedAt', 'durationMs']).default('startedAt'),
});

export const listObservabilityErrorsQuerySchema = paginationSchema.extend({
  source: z.enum(observabilityErrorSources).optional(),
  resolved: z.coerce.boolean().optional(),
  userId: z.string().uuid().optional(),
  requestId: z.string().max(64).optional(),
  traceId: z.string().max(64).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'errorType']).default('createdAt'),
});

export const listObservabilityEventsQuerySchema = paginationSchema.extend({
  eventType: z.enum(observabilityEventTypes).optional(),
  eventName: z.string().max(128).optional(),
  category: z.enum(observabilityLogCategories).optional(),
  userId: z.string().uuid().optional(),
  workflowId: z.string().max(64).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'eventName']).default('createdAt'),
});

export const observabilitySearchQuerySchema = paginationSchema.extend({
  q: z.string().min(1).max(200),
  type: z.enum(['all', 'logs', 'traces', 'errors', 'events']).default('all'),
});

export const observabilityIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type ObservabilityQuery = z.infer<typeof observabilityQuerySchema>;
export type ListObservabilityLogsQuery = z.infer<typeof listObservabilityLogsQuerySchema>;
export type ListObservabilityTracesQuery = z.infer<typeof listObservabilityTracesQuerySchema>;
export type ListObservabilityErrorsQuery = z.infer<typeof listObservabilityErrorsQuerySchema>;
export type ListObservabilityEventsQuery = z.infer<typeof listObservabilityEventsQuerySchema>;
export type ObservabilitySearchQuery = z.infer<typeof observabilitySearchQuerySchema>;
