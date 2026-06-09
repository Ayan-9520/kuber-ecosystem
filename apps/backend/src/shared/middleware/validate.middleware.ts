import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

import { ValidationError } from '../errors/app-error.js';

type RequestSource = 'body' | 'query' | 'params';

export function validateMiddleware(schema: ZodSchema, source: RequestSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.flatten().fieldErrors as Record<string, string[]>;
      next(new ValidationError(details));
      return;
    }
    req[source] = result.data;
    next();
  };
}
