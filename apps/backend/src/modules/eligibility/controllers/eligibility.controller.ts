import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { eligibilityService } from '../services/eligibility.service.js';

export const eligibilityController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    const result = await eligibilityService.health();
    res.json(successResponse(result));
  },
};
