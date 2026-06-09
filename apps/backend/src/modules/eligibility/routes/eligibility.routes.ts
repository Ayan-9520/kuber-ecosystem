import { Router } from 'express';

import { eligibilityController } from '../controllers/eligibility.controller.js';

export const eligibilityRoutes: Router = Router();

eligibilityRoutes.get('/health', eligibilityController.health);
