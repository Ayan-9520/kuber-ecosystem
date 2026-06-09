import { Router } from 'express';

import { auditController } from '../controllers/audit.controller.js';

export const auditRoutes: Router = Router();

auditRoutes.get('/health', auditController.health);
