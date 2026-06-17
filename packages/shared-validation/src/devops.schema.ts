import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const pipelineTypes = [
  'PR_VALIDATION', 'BUILD', 'TEST', 'SECURITY', 'STAGING_DEPLOY',
  'PRODUCTION_DEPLOY', 'ROLLBACK', 'RELEASE', 'MOBILE', 'DATABASE',
] as const;

export const deploymentEnvironments = ['DEVELOPMENT', 'QA', 'STAGING', 'PRODUCTION'] as const;
export const deploymentStatuses = ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'ROLLED_BACK'] as const;
export const pipelineStatuses = ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED'] as const;

export const listPipelinesQuerySchema = paginationSchema.extend({
  pipelineType: z.enum(pipelineTypes).optional(),
  status: z.enum(pipelineStatuses).optional(),
  branch: z.string().max(128).optional(),
});

export const listDeploymentsQuerySchema = paginationSchema.extend({
  environment: z.enum(deploymentEnvironments).optional(),
  status: z.enum(deploymentStatuses).optional(),
  component: z.string().max(64).optional(),
});

export const listReleasesQuerySchema = paginationSchema.extend({
  isPublished: z.coerce.boolean().optional(),
});

export const listRollbacksQuerySchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'RUNNING', 'SUCCESS', 'FAILED']).optional(),
});

export const createReleaseSchema = z.object({
  version: z.string().regex(/^v?\d+\.\d+\.\d+(-[\w.]+)?$/),
  name: z.string().min(2).max(200),
  branch: z.string().max(128).optional(),
  commitSha: z.string().max(64).optional(),
  changelog: z.string().max(10000).optional(),
});

export const createRollbackSchema = z.object({
  deploymentId: z.string().uuid().optional(),
  fromVersion: z.string().max(64),
  toVersion: z.string().max(64),
  reason: z.string().max(2000).optional(),
});

export const pipelineWebhookSchema = z.object({
  pipelineType: z.enum(pipelineTypes),
  name: z.string().max(200),
  branch: z.string().max(128).optional(),
  commitSha: z.string().max(64).optional(),
  prNumber: z.coerce.number().int().optional(),
  status: z.enum(pipelineStatuses),
  workflowUrl: z.string().url().optional(),
  triggeredBy: z.string().max(128).optional(),
  durationMs: z.coerce.number().int().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const devopsHistoryQuerySchema = paginationSchema.extend({
  type: z.enum(['all', 'pipelines', 'deployments', 'releases', 'rollbacks']).default('all'),
});

export const devopsIdParamSchema = z.object({ id: z.string().uuid() });
