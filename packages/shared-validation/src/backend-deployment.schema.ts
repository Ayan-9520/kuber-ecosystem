import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const backendDeployStrategies = ['ROLLING', 'BLUE_GREEN', 'CANARY'] as const;
export const backendDeployStatuses = ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'ROLLED_BACK'] as const;
export const deploymentVersionStatuses = ['DRAFT', 'CANDIDATE', 'RELEASED', 'SUPERSEDED', 'ROLLED_BACK'] as const;

export const listBackendDeploymentsQuerySchema = paginationSchema.extend({
  status: z.enum(backendDeployStatuses).optional(),
  strategy: z.enum(backendDeployStrategies).optional(),
});

export const listDeploymentVersionsQuerySchema = paginationSchema.extend({
  status: z.enum(deploymentVersionStatuses).optional(),
});

export const createBackendDeploymentSchema = z.object({
  version: z.string().min(1).max(64),
  strategy: z.enum(backendDeployStrategies).default('ROLLING'),
  branch: z.string().max(128).optional(),
  commitSha: z.string().max(64).optional(),
});

export const createDeploymentVersionSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  name: z.string().min(1).max(200),
  changelog: z.string().max(10000).optional(),
  commitSha: z.string().max(64).optional(),
});

export const backendDeploymentWebhookSchema = z.object({
  version: z.string().max(64),
  strategy: z.enum(['rolling', 'blue-green', 'canary', 'ROLLING', 'BLUE_GREEN', 'CANARY']).optional(),
  branch: z.string().max(128).optional(),
  commitSha: z.string().max(64).optional(),
  status: z.enum(backendDeployStatuses).optional(),
  validationReport: z.record(z.unknown()).optional(),
  services: z.array(z.object({
    code: z.string(),
    status: z.enum(['HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN']).optional(),
  })).optional(),
});
