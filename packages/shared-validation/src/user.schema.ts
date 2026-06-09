import { z } from 'zod';

const indianMobile = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number');

export const userTypeEnum = z.enum([
  'CUSTOMER',
  'PARTNER',
  'EMPLOYEE',
  'ADMIN',
]);

export const userStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED']);

export const createUserSchema = z
  .object({
    email: z.string().email().optional(),
    phone: indianMobile.optional(),
    password: z.string().min(8).optional(),
    userType: userTypeEnum,
    status: userStatusEnum.default('ACTIVE'),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email'],
  });

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  phone: indianMobile.optional(),
  password: z.string().min(8).optional(),
  status: userStatusEnum.optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'email', 'phone', 'userType', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  userType: userTypeEnum.optional(),
  status: userStatusEnum.optional(),
  search: z.string().max(100).optional(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
});

export const assignUserRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  isPrimary: z.boolean().default(false),
});

export const listUserRolesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().uuid().optional(),
  roleId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type AssignUserRoleInput = z.infer<typeof assignUserRoleSchema>;
export type ListUserRolesQuery = z.infer<typeof listUserRolesQuerySchema>;
