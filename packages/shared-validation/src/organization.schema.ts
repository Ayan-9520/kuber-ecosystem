import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const listEmployeesQuerySchema = paginationSchema.extend({
  branchId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  sortBy: z
    .enum(['employeeCode', 'firstName', 'lastName', 'createdAt', 'updatedAt', 'joinedAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createEmployeeSchema = z.object({
  userId: z.string().uuid(),
  branchId: z.string().uuid(),
  employeeCode: z.string().min(2).max(30),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  designation: z.string().max(100).optional(),
  department: z.string().max(50).optional(),
  reportsToId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
  joinedAt: z.coerce.date().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema
  .omit({ userId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

export const listRegionsQuerySchema = paginationSchema.extend({
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['code', 'name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createRegionSchema = z.object({
  code: z.string().min(2).max(20),
  name: z.string().min(2).max(100),
  isActive: z.boolean().default(true),
});

export const updateRegionSchema = createRegionSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

export const listBranchesQuerySchema = paginationSchema.extend({
  regionId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['code', 'name', 'city', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createBranchSchema = z.object({
  regionId: z.string().uuid(),
  code: z.string().min(2).max(20),
  name: z.string().min(2).max(150),
  address: z.string().max(2000).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode').optional(),
  isActive: z.boolean().default(true),
});

export const updateBranchSchema = createBranchSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type ListRegionsQuery = z.infer<typeof listRegionsQuerySchema>;
export type CreateRegionInput = z.infer<typeof createRegionSchema>;
export type UpdateRegionInput = z.infer<typeof updateRegionSchema>;
export type ListBranchesQuery = z.infer<typeof listBranchesQuerySchema>;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
