import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const monitoringComponents = [
  'SYSTEM', 'APPLICATION', 'DATABASE', 'QUEUE', 'AI', 'NOTIFICATION', 'AUTH', 'BUSINESS', 'ANALYTICS', 'INFRASTRUCTURE',
] as const;

export const monitoringAlertSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'] as const;
export const monitoringAlertStatuses = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'SILENCED'] as const;

export const monitoringAnalyticsQuerySchema = z.object({
  period: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const listMonitoringAlertsQuerySchema = paginationSchema.extend({
  status: z.enum(monitoringAlertStatuses).optional(),
  severity: z.enum(monitoringAlertSeverities).optional(),
  component: z.enum(monitoringComponents).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'severity', 'status']).default('createdAt'),
});

export const updateMonitoringAlertSchema = z.object({
  status: z.enum(['ACKNOWLEDGED', 'RESOLVED', 'SILENCED']).optional(),
  comments: z.string().max(2000).optional(),
});

export const monitoringIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type MonitoringAnalyticsQuery = z.infer<typeof monitoringAnalyticsQuerySchema>;
export type ListMonitoringAlertsQuery = z.infer<typeof listMonitoringAlertsQuerySchema>;
export type UpdateMonitoringAlertInput = z.infer<typeof updateMonitoringAlertSchema>;
