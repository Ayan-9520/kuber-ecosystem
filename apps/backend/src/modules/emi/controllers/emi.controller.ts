import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { emiService } from '../services/emi.service.js';

export const emiController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    const result = await emiService.health();
    res.json(successResponse(result));
  },
};
