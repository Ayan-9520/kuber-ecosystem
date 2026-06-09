import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { employeeService } from '../services/employee.service.js';

export const employeeController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    const result = await employeeService.health();
    res.json(successResponse(result));
  },
};
