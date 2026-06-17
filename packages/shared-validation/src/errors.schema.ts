import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const errorTrackingSources = [
  'BACKEND', 'CRM', 'CUSTOMER_APP', 'DSA_APP', 'AI', 'NOTIFICATION',
  'DATABASE', 'QUEUE', 'INFRASTRUCTURE', 'VOICE_AI', 'RAG', 'OPENAI',
] as const;

export const errorLifecycleStatuses = [
  'NEW', 'INVESTIGATING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED', 'IGNORED',
] as const;

export const errorPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

export const errorCategories = [
  'UNHANDLED_EXCEPTION', 'VALIDATION', 'AUTHORIZATION', 'AUTHENTICATION', 'BUSINESS_RULE',
  'QUEUE_FAILURE', 'CRON_FAILURE', 'WORKER_FAILURE', 'PAGE_CRASH', 'COMPONENT_ERROR',
  'FORM_ERROR', 'CHART_ERROR', 'TABLE_ERROR', 'NAVIGATION_ERROR', 'THEME_ERROR',
  'API_ERROR', 'OFFLINE_ERROR', 'PUSH_ERROR', 'PROMPT_FAILURE', 'RATE_LIMIT', 'TIMEOUT',
  'RAG_RETRIEVAL_FAILURE', 'HALLUCINATION_REPORT', 'EMAIL_FAILURE', 'SMS_FAILURE',
  'WHATSAPP_FAILURE', 'RETRY_FAILURE', 'DEAD_LETTER', 'SLOW_QUERY', 'DEADLOCK',
  'MIGRATION_FAILURE', 'CONNECTION_FAILURE', 'CONSTRAINT_VIOLATION', 'PRISMA_ERROR', 'INFRASTRUCTURE',
] as const;

export const errorAnalyticsQuerySchema = z.object({
  period: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const listErrorsQuerySchema = paginationSchema.extend({
  source: z.enum(errorTrackingSources).optional(),
  category: z.enum(errorCategories).optional(),
  priority: z.enum(errorPriorities).optional(),
  status: z.enum(errorLifecycleStatuses).optional(),
  module: z.string().max(64).optional(),
  userId: z.string().uuid().optional(),
  traceId: z.string().max(64).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['lastSeenAt', 'occurrenceCount', 'priority', 'createdAt']).default('lastSeenAt'),
});

export const listErrorGroupsQuerySchema = listErrorsQuerySchema;

export const listErrorAlertsQuerySchema = paginationSchema.extend({
  status: z.enum(['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'SILENCED']).optional(),
  severity: z.enum(errorPriorities).optional(),
  source: z.enum(errorTrackingSources).optional(),
  search: z.string().max(200).optional(),
});

export const errorIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const captureErrorSchema = z.object({
  source: z.enum(errorTrackingSources).default('BACKEND'),
  category: z.enum(errorCategories).default('UNHANDLED_EXCEPTION'),
  errorCode: z.string().max(64).optional(),
  errorType: z.string().max(128),
  message: z.string().max(5000),
  stackTrace: z.string().max(50000).optional(),
  requestId: z.string().max(64).optional(),
  correlationId: z.string().max(64).optional(),
  traceId: z.string().max(64).optional(),
  sessionId: z.string().max(64).optional(),
  workflowId: z.string().max(64).optional(),
  userId: z.string().uuid().optional(),
  userRole: z.string().max(64).optional(),
  path: z.string().max(500).optional(),
  method: z.string().max(16).optional(),
  statusCode: z.coerce.number().int().optional(),
  device: z.string().max(128).optional(),
  browser: z.string().max(128).optional(),
  appVersion: z.string().max(32).optional(),
  osVersion: z.string().max(64).optional(),
  region: z.string().max(64).optional(),
  branch: z.string().max(64).optional(),
  module: z.string().max(64).optional(),
  requestPayload: z.record(z.unknown()).optional(),
  responsePayload: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const assignErrorSchema = z.object({
  groupId: z.string().uuid(),
  assignedToId: z.string().uuid(),
  notes: z.string().max(2000).optional(),
});

export const resolveErrorSchema = z.object({
  groupId: z.string().uuid(),
  resolutionType: z.enum(['FIXED', 'WONT_FIX', 'DUPLICATE', 'NOT_REPRODUCIBLE', 'ENVIRONMENT']),
  rootCause: z.string().max(5000).optional(),
  fixDescription: z.string().max(5000).optional(),
});

export const addErrorCommentSchema = z.object({
  groupId: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

export const updateErrorGroupSchema = z.object({
  status: z.enum(errorLifecycleStatuses).optional(),
  priority: z.enum(errorPriorities).optional(),
});

export type ErrorAnalyticsQuery = z.infer<typeof errorAnalyticsQuerySchema>;
export type ListErrorsQuery = z.infer<typeof listErrorsQuerySchema>;
export type CaptureErrorInput = z.infer<typeof captureErrorSchema>;
