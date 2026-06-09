import { Router } from 'express';

import { productController } from '../controllers/product.controller.js';

export const productRoutes: Router = Router();

productRoutes.get('/health', productController.health);
