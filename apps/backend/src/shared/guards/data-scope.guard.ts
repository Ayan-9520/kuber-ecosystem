import { DataScope } from '@kuberone/shared-types';
import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError } from '../errors/app-error.js';

const SCOPE_RANK: Record<DataScope, number> = {
  [DataScope.OWN]: 1,
  [DataScope.ASSIGNED]: 2,
  [DataScope.BRANCH]: 3,
  [DataScope.REGION]: 4,
  [DataScope.ORGANIZATION]: 5,
};

export function dataScopeGuard(minimumScope: DataScope) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }

    const userScope = req.user.dataScope ?? req.dataScope ?? DataScope.OWN;
    if (SCOPE_RANK[userScope] < SCOPE_RANK[minimumScope]) {
      next(new ForbiddenError('Insufficient data scope'));
      return;
    }

    req.dataScope = userScope;
    next();
  };
}

export function attachDataScope(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.dataScope) {
    req.dataScope = req.user.dataScope;
  }
  next();
}
