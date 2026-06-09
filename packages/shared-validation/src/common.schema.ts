import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});
