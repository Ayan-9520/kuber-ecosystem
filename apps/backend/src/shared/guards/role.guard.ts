import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError } from '../errors/app-error.js';

export function roleGuard(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    const userRoles = req.user.roles ?? [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      next(new ForbiddenError('Insufficient role privileges'));
      return;
    }

    next();
  };
}
