import { Router } from 'express';

import { employeeRoutes } from './routes/employee.routes.js';

export function createEmployeesModule(): Router {
  const router = Router();
  router.use(employeeRoutes);
  return router;
}
