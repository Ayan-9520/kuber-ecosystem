import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';

import { eligibilityController } from '../controllers/eligibility.controller.js';

export const eligibilityRoutes: Router = Router();

eligibilityRoutes.get('/health', asyncHandler(eligibilityController.health));
