import { z } from 'zod';

export const createPermissionSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z][a-z0-9_.:]*$/, 'Permission code must be lowercase dot/colon notation'),
  name: z.string().min(2).max(150),
  module: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
});

export const updatePermissionSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  module: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional(),
});

export const listPermissionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  module: z.string().max(50).optional(),
  search: z.string().max(100).optional(),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type ListPermissionsQuery = z.infer<typeof listPermissionsQuerySchema>;
