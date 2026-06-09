import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError } from '../errors/app-error.js';
import { matchesPermission } from '../utils/permission-match.js';

export function permissionMiddleware(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    const userPermissions = req.user.permissions ?? [];
    const hasPermission = requiredPermissions.every((permission) =>
      matchesPermission(userPermissions, permission),
    );

    if (!hasPermission) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
}

export const authorizeMiddleware = permissionMiddleware;

export function roleMiddleware(...requiredRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    const userRoles = req.user.roles ?? [];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      next(new ForbiddenError('Insufficient role privileges'));
      return;
    }

    next();
  };
}

export function dataScopeMiddleware(minimumScope?: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    req.dataScope = req.user.dataScope;
    if (minimumScope && req.user.dataScope !== minimumScope) {
      const rank: Record<string, number> = {
        OWN: 1,
        ASSIGNED: 2,
        BRANCH: 3,
        REGION: 4,
        ORGANIZATION: 5,
      };
      const userRank = rank[req.user.dataScope] ?? 0;
      const requiredRank = rank[minimumScope] ?? 0;
      if (userRank < requiredRank) {
        next(new ForbiddenError('Insufficient data scope'));
        return;
      }
    }

    next();
  };
}
