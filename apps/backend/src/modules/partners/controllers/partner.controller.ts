import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { partnerService } from '../services/partner.service.js';

export const partnerController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    const result = await partnerService.health();
    res.json(successResponse(result));
  },
};
