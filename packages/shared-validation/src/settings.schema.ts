import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const listSettingsQuerySchema = paginationSchema.extend({
  category: z.string().max(50).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['key', 'category', 'updatedAt']).default('key'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const updateSettingSchema = z.object({
  value: z.unknown(),
  category: z.string().max(50).optional(),
});

export type ListSettingsQuery = z.infer<typeof listSettingsQuerySchema>;
export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
