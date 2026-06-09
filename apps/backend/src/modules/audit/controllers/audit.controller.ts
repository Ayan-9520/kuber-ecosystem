import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { auditService } from '../services/audit.service.js';

export const auditController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    const result = await auditService.health();
    res.json(successResponse(result));
  },
};
