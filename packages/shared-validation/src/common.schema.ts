import { z } from 'zod';

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

/** Routes with no query parameters */
export const emptyQuerySchema = z.object({}).strict();

/** Routes with no request body */
export const emptyBodySchema = z.object({}).strict();
