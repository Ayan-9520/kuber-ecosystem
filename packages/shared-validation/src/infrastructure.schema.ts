import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const infraEnvironmentTypes = ['DEVELOPMENT', 'QA', 'STAGING', 'PRODUCTION'] as const;
export const infraHealthStatuses = ['HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN'] as const;

export const listEnvironmentsQuerySchema = paginationSchema.extend({
  type: z.enum(infraEnvironmentTypes).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const listServicesQuerySchema = paginationSchema.extend({
  environmentId: z.string().uuid().optional(),
  serviceType: z.string().max(64).optional(),
  status: z.enum(infraHealthStatuses).optional(),
});

export const listDomainsQuerySchema = paginationSchema.extend({
  environmentId: z.string().uuid().optional(),
});

export const listHealthQuerySchema = paginationSchema.extend({
  environmentId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  hours: z.coerce.number().int().min(1).max(168).default(24),
});

export const infrastructureIdParamSchema = z.object({ id: z.string().uuid() });

export const environmentCodeParamSchema = z.object({ code: z.string().max(32) });
