import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { aiService } from '../services/ai.service.js';

export const aiController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    const result = await aiService.health();
    res.json(successResponse(result));
  },
};
