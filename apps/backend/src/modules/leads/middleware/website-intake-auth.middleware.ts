import type { NextFunction, Request, Response } from 'express';

import { env } from '../../../config/env.js';
import { AppError } from '../../../shared/errors/app-error.js';

/**
 * When WEBSITE_INTAKE_API_KEY is set, require matching X-Website-Api-Key header.
 * In development with no key configured, allow open intake for local dual-write testing.
 */
export function requireWebsiteIntakeKey(req: Request, _res: Response, next: NextFunction): void {
  const configured = env.WEBSITE_INTAKE_API_KEY?.trim();
  if (!configured) {
    if (env.APP_ENV === 'production') {
      next(new AppError(503, 'WEBSITE_INTAKE_DISABLED', 'Website intake API key is not configured'));
      return;
    }
    next();
    return;
  }

  const provided =
    req.header('x-website-api-key')?.trim() ||
    req.header('authorization')?.replace(/^Bearer\s+/i, '').trim();

  if (!provided || provided !== configured) {
    next(new AppError(401, 'UNAUTHORIZED', 'Invalid website intake API key'));
    return;
  }

  next();
}
