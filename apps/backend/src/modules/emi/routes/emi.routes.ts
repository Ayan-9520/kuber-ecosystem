import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';

import { emiController } from '../controllers/emi.controller.js';

export const emiRoutes: Router = Router();

emiRoutes.get('/health', asyncHandler(emiController.health));
