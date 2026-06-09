import type { NextFunction, Request, Response } from 'express';

import { SUPER_ADMIN_ROLE } from '../constants/rbac.constants.js';
import { ForbiddenError } from '../errors/app-error.js';
import { matchesPermission } from '../utils/permission-match.js';

import { permissionMiddleware } from './authorize.middleware.js';

export function requirePermissions(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user?.roles?.includes(SUPER_ADMIN_ROLE)) {
      next();
      return;
    }

    permissionMiddleware(...requiredPermissions)(req, res, next);
  };
}

export function requireAnyPermission(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    if (req.user.roles?.includes(SUPER_ADMIN_ROLE)) {
      next();
      return;
    }

    const userPermissions = req.user.permissions ?? [];
    const allowed = requiredPermissions.some((permission) =>
      matchesPermission(userPermissions, permission),
    );

    if (!allowed) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
}
