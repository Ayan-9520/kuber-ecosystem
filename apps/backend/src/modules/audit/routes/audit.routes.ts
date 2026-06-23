import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';

import { auditController } from '../controllers/audit.controller.js';

export const auditRoutes: Router = Router();

auditRoutes.get('/health', asyncHandler(auditController.health));
