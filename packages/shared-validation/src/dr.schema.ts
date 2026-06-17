import { z } from 'zod';

import { drScenarios } from './backup.schema.js';

export const drDrillTypes = ['MONTHLY', 'QUARTERLY', 'ANNUAL'] as const;
export const failoverTypes = ['DNS', 'TRAFFIC_SWITCH', 'BLUE_GREEN', 'READ_REPLICA_PROMOTION'] as const;

export const createDrPlatformDrillSchema = z.object({
  drillType: z.enum(drDrillTypes),
  scenario: z.enum(drScenarios),
  scheduledAt: z.string().datetime().optional(),
});

export const startRecoverySchema = z.object({
  scenario: z.enum(drScenarios),
  runbookId: z.string().uuid().optional(),
});

export const startFailoverSchema = z.object({
  failoverType: z.enum(failoverTypes),
  primaryEnv: z.string().max(64).default('production-ap-south-1'),
  standbyEnv: z.string().max(64).default('standby-ap-south-2'),
});

export const drWebhookSchema = z.object({
  event: z.enum(['BACKUP_VALIDATED', 'RESTORE_TESTED', 'REPLICATION_OK', 'DRILL_COMPLETED', 'FAILOVER_TESTED']),
  scenario: z.enum(drScenarios).optional(),
  passed: z.boolean().optional(),
  rpoAchieved: z.coerce.number().int().optional(),
  rtoAchieved: z.coerce.number().int().optional(),
  details: z.record(z.unknown()).optional(),
});
