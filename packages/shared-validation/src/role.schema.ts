import { z } from 'zod';

export const createRoleSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[A-Z][A-Z0-9_]*$/, 'Role code must be UPPER_SNAKE_CASE'),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  isSystem: z.boolean().default(false),
  parentRoleCode: z.string().max(50).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  parentRoleCode: z.string().max(50).nullable().optional(),
});

export const listRolesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  isSystem: z.coerce.boolean().optional(),
});

export const assignRolePermissionSchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
});

export const removeRolePermissionSchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
});

export const listRolePermissionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  roleId: z.string().uuid().optional(),
  permissionId: z.string().uuid().optional(),
  module: z.string().max(50).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type ListRolesQuery = z.infer<typeof listRolesQuerySchema>;
export type AssignRolePermissionInput = z.infer<typeof assignRolePermissionSchema>;
export type RemoveRolePermissionInput = z.infer<typeof removeRolePermissionSchema>;
export type ListRolePermissionsQuery = z.infer<typeof listRolePermissionsQuerySchema>;
