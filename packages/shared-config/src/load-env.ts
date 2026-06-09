import type { z } from 'zod';

export function loadEnv<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.flatten().fieldErrors;
    const message = Object.entries(formatted)
      .map(([key, errors]) => `${key}: ${(errors ?? []).join(', ')}`)
      .join('; ');
    throw new Error(`Environment validation failed: ${message}`);
  }
  return result.data;
}
