import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const backupScopes = ['DATABASE', 'DOCUMENTS', 'MEDIA', 'AI_KNOWLEDGE', 'CONFIGURATION', 'LOGS', 'APPLICATION'] as const;
export const backupTypes = ['FULL', 'INCREMENTAL', 'DIFFERENTIAL', 'PITR'] as const;
export const backupSchedules = ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'MANUAL'] as const;
export const restoreScopes = ['SINGLE_RECORD', 'CUSTOMER', 'LEAD', 'APPLICATION', 'DOCUMENT', 'TABLE', 'DATABASE', 'PLATFORM'] as const;
export const drScenarios = [
  'DATABASE_FAILURE', 'APPLICATION_FAILURE', 'SERVER_FAILURE', 'LOAD_BALANCER_FAILURE',
  'REDIS_FAILURE', 'STORAGE_FAILURE', 'AI_SERVICE_FAILURE', 'NOTIFICATION_PROVIDER_FAILURE',
  'REGION_FAILURE', 'CLOUD_FAILURE', 'SECURITY_INCIDENT', 'CREDENTIAL_LEAK', 'RANSOMWARE',
  'ACCIDENTAL_DELETION', 'FAILED_PRODUCTION_DEPLOYMENT',
] as const;

export const backupQuerySchema = z.object({
  period: z.enum(['hour', 'day', 'week', 'month']).default('day'),
});

export const listBackupJobsQuerySchema = paginationSchema.extend({
  scope: z.enum(backupScopes).optional(),
  schedule: z.enum(backupSchedules).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'DISABLED']).optional(),
  search: z.string().max(200).optional(),
});

export const listBackupHistoryQuerySchema = paginationSchema.extend({
  scope: z.enum(backupScopes).optional(),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'VERIFIED']).optional(),
  jobId: z.string().uuid().optional(),
});

export const createBackupJobSchema = z.object({
  code: z.string().min(2).max(64),
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  scope: z.enum(backupScopes),
  backupType: z.enum(backupTypes),
  schedule: z.enum(backupSchedules),
  retentionCode: z.string().max(64).optional(),
  isEncrypted: z.boolean().default(true),
  isImmutable: z.boolean().default(false),
});

export const triggerBackupSchema = z.object({
  jobId: z.string().uuid().optional(),
  scope: z.enum(backupScopes).optional(),
  backupType: z.enum(backupTypes).default('FULL'),
});

export const restoreRequestSchema = z.object({
  scope: z.enum(restoreScopes),
  targetType: z.string().max(64).optional(),
  targetId: z.string().uuid().optional(),
  executionId: z.string().uuid().optional(),
  reason: z.string().max(2000).optional(),
});

export const listDrDrillsQuerySchema = paginationSchema.extend({
  status: z.enum(['SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED']).optional(),
  scenario: z.enum(drScenarios).optional(),
});

export const createDrDrillSchema = z.object({
  planId: z.string().uuid().optional(),
  scenario: z.enum(drScenarios),
  auditType: z.enum(['WEEKLY_RESTORE', 'MONTHLY_FULL_RESTORE', 'QUARTERLY_DR_DRILL', 'MONTHLY_DR_DRILL', 'ANNUAL_DR_DRILL']).default('QUARTERLY_DR_DRILL'),
  drillType: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']).optional(),
});

export const backupIdParamSchema = z.object({ id: z.string().uuid() });

export type BackupQuery = z.infer<typeof backupQuerySchema>;
export type RestoreRequestInput = z.infer<typeof restoreRequestSchema>;
