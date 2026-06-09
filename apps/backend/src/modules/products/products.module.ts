import { Router } from 'express';

import { productRoutes } from './routes/product.routes.js';

export function createProductsModule(): Router {
  const router = Router();
  router.use(productRoutes);
  return router;
}
