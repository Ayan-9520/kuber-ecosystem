import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { branchService } from '../services/branch.service.js';

export const branchController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    const result = await branchService.health();
    res.json(successResponse(result));
  },
};
