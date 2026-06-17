import { Router } from 'express';

import { errorTrackingRoutes } from './routes/error-tracking.routes.js';

export function createErrorTrackingModule(): Router {
  const router = Router();
  router.use(errorTrackingRoutes);
  return router;
}

export { errorCaptureService } from './services/error-capture.service.js';
