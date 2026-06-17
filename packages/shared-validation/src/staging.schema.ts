import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const stagingEnvStatuses = ['PROVISIONING', 'ACTIVE', 'VALIDATING', 'DEGRADED', 'MAINTENANCE'] as const;
export const deploymentValidationStatuses = ['PENDING', 'RUNNING', 'PASSED', 'FAILED', 'SKIPPED'] as const;
export const releaseValidationStatuses = ['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'BLOCKED'] as const;

export const listStagingDeploymentsQuerySchema = paginationSchema.extend({
  environmentId: z.string().uuid().optional(),
  component: z.string().max(64).optional(),
  status: z.enum(deploymentValidationStatuses).optional(),
});

export const listReleaseValidationsQuerySchema = paginationSchema.extend({
  environmentId: z.string().uuid().optional(),
  status: z.enum(releaseValidationStatuses).optional(),
  releaseVersion: z.string().max(32).optional(),
});

export const createReleaseValidationSchema = z.object({
  releaseVersion: z.string().regex(/^v?\d+\.\d+\.\d+(-[\w.]+)?$/),
  branch: z.string().max(128).optional(),
});

export const stagingIdParamSchema = z.object({ id: z.string().uuid() });

export const stagingWebhookSchema = z.object({
  component: z.string().max(64),
  version: z.string().max(64),
  branch: z.string().max(128).optional(),
  commitSha: z.string().max(64).optional(),
  buildStatus: z.enum(deploymentValidationStatuses).optional(),
  testStatus: z.enum(deploymentValidationStatuses).optional(),
  migrationStatus: z.enum(deploymentValidationStatuses).optional(),
  healthStatus: z.enum(deploymentValidationStatuses).optional(),
  report: z.record(z.unknown()).optional(),
});
