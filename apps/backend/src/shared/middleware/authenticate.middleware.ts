import type { NextFunction, Request, Response } from 'express';

import { sessionService } from '../../modules/auth/services/session.service.js';
import { tokenService } from '../../modules/auth/services/token.service.js';
import { UnauthorizedError } from '../errors/app-error.js';

export function authenticateMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next(new UnauthorizedError('Missing or invalid authorization header'));
      return;
    }

    const token = authHeader.slice(7);
    const payload = tokenService.verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      ...payload,
    };
    req.sessionId = payload.sessionId;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

export async function authenticateWithSessionMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  authenticateMiddleware(req, _res, async (err) => {
    if (err) {
      next(err);
      return;
    }

    if (!req.user?.sessionId) {
      next(new UnauthorizedError('Invalid session'));
      return;
    }

    try {
      await sessionService.assertActiveSession(req.user.sessionId);
      next();
    } catch (error) {
      next(error);
    }
  });
}
