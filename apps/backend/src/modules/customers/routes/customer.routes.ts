import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import {
  customerAddressController,
  customerConsentController,
  customerController,
  customerEmploymentController,
  customerIncomeController,
  customerPreferencesController,
  customerProfileController,
} from '../controllers/customer.controller.js';
import {
  createCustomerAddressSchema,
  createCustomerConsentSchema,
  createCustomerEmploymentSchema,
  createCustomerIncomeSchema,
  createCustomerSchema,
  customerIdQuerySchema,
  listCustomerAddressesQuerySchema,
  listCustomerConsentsQuerySchema,
  listCustomerEmploymentQuerySchema,
  listCustomerIncomeQuerySchema,
  listCustomersQuerySchema,
  updateCustomerAddressSchema,
  updateCustomerEmploymentSchema,
  updateCustomerIncomeSchema,
  updateCustomerSchema,
  upsertCustomerPreferencesSchema,
  upsertCustomerProfileSchema,
  uuidParamSchema,
} from '../validators/customer.validator.js';

const readPerm = requireAnyPermission(
  RBAC_PERMISSIONS.CUSTOMERS_READ,
  'customers.read:own',
  'customers.read:branch',
  'customers.read:all',
);
const writePerm = requireAnyPermission(
  RBAC_PERMISSIONS.CUSTOMERS_WRITE,
  'customers.update:own',
  'customers.write',
  'customers.create:all',
);

export const customerRoutes: Router = Router();
customerRoutes.use(authenticateWithSessionMiddleware);
customerRoutes.get('/', readPerm, validateMiddleware(listCustomersQuerySchema, 'query'), customerController.list);
customerRoutes.post('/', writePerm, validateMiddleware(createCustomerSchema), customerController.create);
customerRoutes.get('/:id', readPerm, validateMiddleware(uuidParamSchema, 'params'), customerController.getById);
customerRoutes.patch(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCustomerSchema),
  customerController.update,
);
customerRoutes.delete(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  customerController.remove,
);

export const customerProfileRoutes: Router = Router();
customerProfileRoutes.use(authenticateWithSessionMiddleware);
customerProfileRoutes.get('/', readPerm, validateMiddleware(customerIdQuerySchema, 'query'), customerProfileController.get);
customerProfileRoutes.put('/', writePerm, validateMiddleware(upsertCustomerProfileSchema), customerProfileController.upsert);
customerProfileRoutes.post('/', writePerm, validateMiddleware(upsertCustomerProfileSchema), customerProfileController.upsert);

export const customerAddressRoutes: Router = Router();
customerAddressRoutes.use(authenticateWithSessionMiddleware);
customerAddressRoutes.get('/', readPerm, validateMiddleware(listCustomerAddressesQuerySchema, 'query'), customerAddressController.list);
customerAddressRoutes.post('/', writePerm, validateMiddleware(createCustomerAddressSchema), customerAddressController.create);
customerAddressRoutes.patch(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCustomerAddressSchema),
  customerAddressController.update,
);
customerAddressRoutes.delete(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  customerAddressController.remove,
);

export const customerEmploymentRoutes: Router = Router();
customerEmploymentRoutes.use(authenticateWithSessionMiddleware);
customerEmploymentRoutes.get('/', readPerm, validateMiddleware(listCustomerEmploymentQuerySchema, 'query'), customerEmploymentController.list);
customerEmploymentRoutes.post('/', writePerm, validateMiddleware(createCustomerEmploymentSchema), customerEmploymentController.create);
customerEmploymentRoutes.patch(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCustomerEmploymentSchema),
  customerEmploymentController.update,
);
customerEmploymentRoutes.delete(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  customerEmploymentController.remove,
);

export const customerIncomeRoutes: Router = Router();
customerIncomeRoutes.use(authenticateWithSessionMiddleware);
customerIncomeRoutes.get('/', readPerm, validateMiddleware(listCustomerIncomeQuerySchema, 'query'), customerIncomeController.list);
customerIncomeRoutes.post('/', writePerm, validateMiddleware(createCustomerIncomeSchema), customerIncomeController.create);
customerIncomeRoutes.patch(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCustomerIncomeSchema),
  customerIncomeController.update,
);
customerIncomeRoutes.delete(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  customerIncomeController.remove,
);

export const customerPreferencesRoutes: Router = Router();
customerPreferencesRoutes.use(authenticateWithSessionMiddleware);
customerPreferencesRoutes.get('/', readPerm, validateMiddleware(customerIdQuerySchema, 'query'), customerPreferencesController.get);
customerPreferencesRoutes.put('/', writePerm, validateMiddleware(upsertCustomerPreferencesSchema), customerPreferencesController.upsert);
customerPreferencesRoutes.post('/', writePerm, validateMiddleware(upsertCustomerPreferencesSchema), customerPreferencesController.upsert);

export const customerConsentRoutes: Router = Router();
customerConsentRoutes.use(authenticateWithSessionMiddleware);
customerConsentRoutes.get('/', readPerm, validateMiddleware(listCustomerConsentsQuerySchema, 'query'), customerConsentController.list);
customerConsentRoutes.post('/', writePerm, validateMiddleware(createCustomerConsentSchema), customerConsentController.create);
