import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';

import { productController } from '../controllers/product.controller.js';

export const productRoutes: Router = Router();

productRoutes.get('/health', asyncHandler(productController.health));
