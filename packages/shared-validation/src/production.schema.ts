import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const productionEnvStatuses = ['PROVISIONING', 'LIVE', 'DEGRADED', 'MAINTENANCE', 'INCIDENT'] as const;
export const productionDeployStatuses = ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'ROLLED_BACK'] as const;
export const releaseRecordStatuses = ['PLANNED', 'IN_PROGRESS', 'RELEASED', 'FAILED', 'ROLLED_BACK'] as const;
export const incidentSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export const incidentStatuses = ['OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED', 'CLOSED'] as const;

export const listProductionDeploymentsQuerySchema = paginationSchema.extend({
  component: z.string().max(64).optional(),
  status: z.enum(productionDeployStatuses).optional(),
});

export const listReleaseRecordsQuerySchema = paginationSchema.extend({
  status: z.enum(releaseRecordStatuses).optional(),
  version: z.string().max(32).optional(),
});

export const listIncidentsQuerySchema = paginationSchema.extend({
  severity: z.enum(incidentSeverities).optional(),
  status: z.enum(incidentStatuses).optional(),
});

export const createReleaseRecordSchema = z.object({
  version: z.string().regex(/^v?\d+\.\d+\.\d+(-[\w.]+)?$/),
  name: z.string().min(2).max(200),
  branch: z.string().max(128).optional(),
  changelog: z.string().max(10000).optional(),
});

export const createIncidentSchema = z.object({
  title: z.string().min(3).max(255),
  severity: z.enum(incidentSeverities).default('MEDIUM'),
  description: z.string().max(5000).optional(),
});

export const productionWebhookSchema = z.object({
  component: z.string().max(64),
  version: z.string().max(64),
  strategy: z.string().max(32).optional(),
  branch: z.string().max(128).optional(),
  commitSha: z.string().max(64).optional(),
  status: z.enum(productionDeployStatuses).optional(),
  validationReport: z.record(z.unknown()).optional(),
});

export const productionIdParamSchema = z.object({ id: z.string().uuid() });
