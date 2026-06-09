import { Router } from 'express';

import { emiController } from '../controllers/emi.controller.js';

export const emiRoutes: Router = Router();

emiRoutes.get('/health', emiController.health);
