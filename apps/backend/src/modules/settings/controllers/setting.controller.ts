import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { settingService } from '../services/setting.service.js';

export const settingController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    const result = await settingService.health();
    res.json(successResponse(result));
  },
};
