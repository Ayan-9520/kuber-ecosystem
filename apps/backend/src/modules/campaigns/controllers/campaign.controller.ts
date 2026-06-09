import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { campaignService } from '../services/campaign.service.js';

export const campaignController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    const result = await campaignService.health();
    res.json(successResponse(result));
  },
};
