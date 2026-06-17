import type { NextFunction, Request, Response } from 'express';

import { metricsRegistryService } from '../services/metrics-registry.service.js';

function normalizeRoute(path: string): string {
  return path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+/g, '/:id');
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const elapsed = Number(process.hrtime.bigint() - start) / 1e9;
    const route = normalizeRoute(req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path);
    metricsRegistryService.recordHttpRequest(req.method, route, res.statusCode, elapsed);
  });

  next();
}
