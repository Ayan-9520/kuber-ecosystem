import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { productService } from '../services/product.service.js';

export const productController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    const result = await productService.health();
    res.json(successResponse(result));
  },
};
