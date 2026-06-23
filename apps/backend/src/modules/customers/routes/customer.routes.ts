import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
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
customerRoutes.get('/', readPerm, validateMiddleware(listCustomersQuerySchema, 'query'), asyncHandler(customerController.list));
customerRoutes.post('/', writePerm, validateMiddleware(createCustomerSchema), asyncHandler(customerController.create));
customerRoutes.get('/:id', readPerm, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(customerController.getById));
customerRoutes.patch(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCustomerSchema),
  asyncHandler(customerController.update),
);
customerRoutes.delete(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(customerController.remove),
);

export const customerProfileRoutes: Router = Router();
customerProfileRoutes.use(authenticateWithSessionMiddleware);
customerProfileRoutes.get('/', readPerm, validateMiddleware(customerIdQuerySchema, 'query'), asyncHandler(customerProfileController.get));
customerProfileRoutes.put('/', writePerm, validateMiddleware(upsertCustomerProfileSchema), asyncHandler(customerProfileController.upsert));
customerProfileRoutes.post('/', writePerm, validateMiddleware(upsertCustomerProfileSchema), asyncHandler(customerProfileController.upsert));

export const customerAddressRoutes: Router = Router();
customerAddressRoutes.use(authenticateWithSessionMiddleware);
customerAddressRoutes.get('/', readPerm, validateMiddleware(listCustomerAddressesQuerySchema, 'query'), asyncHandler(customerAddressController.list));
customerAddressRoutes.post('/', writePerm, validateMiddleware(createCustomerAddressSchema), asyncHandler(customerAddressController.create));
customerAddressRoutes.patch(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCustomerAddressSchema),
  asyncHandler(customerAddressController.update),
);
customerAddressRoutes.delete(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(customerAddressController.remove),
);

export const customerEmploymentRoutes: Router = Router();
customerEmploymentRoutes.use(authenticateWithSessionMiddleware);
customerEmploymentRoutes.get('/', readPerm, validateMiddleware(listCustomerEmploymentQuerySchema, 'query'), asyncHandler(customerEmploymentController.list));
customerEmploymentRoutes.post('/', writePerm, validateMiddleware(createCustomerEmploymentSchema), asyncHandler(customerEmploymentController.create));
customerEmploymentRoutes.patch(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCustomerEmploymentSchema),
  asyncHandler(customerEmploymentController.update),
);
customerEmploymentRoutes.delete(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(customerEmploymentController.remove),
);

export const customerIncomeRoutes: Router = Router();
customerIncomeRoutes.use(authenticateWithSessionMiddleware);
customerIncomeRoutes.get('/', readPerm, validateMiddleware(listCustomerIncomeQuerySchema, 'query'), asyncHandler(customerIncomeController.list));
customerIncomeRoutes.post('/', writePerm, validateMiddleware(createCustomerIncomeSchema), asyncHandler(customerIncomeController.create));
customerIncomeRoutes.patch(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCustomerIncomeSchema),
  asyncHandler(customerIncomeController.update),
);
customerIncomeRoutes.delete(
  '/:id',
  writePerm,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(customerIncomeController.remove),
);

export const customerPreferencesRoutes: Router = Router();
customerPreferencesRoutes.use(authenticateWithSessionMiddleware);
customerPreferencesRoutes.get('/', readPerm, validateMiddleware(customerIdQuerySchema, 'query'), asyncHandler(customerPreferencesController.get));
customerPreferencesRoutes.put('/', writePerm, validateMiddleware(upsertCustomerPreferencesSchema), asyncHandler(customerPreferencesController.upsert));
customerPreferencesRoutes.post('/', writePerm, validateMiddleware(upsertCustomerPreferencesSchema), asyncHandler(customerPreferencesController.upsert));

export const customerConsentRoutes: Router = Router();
customerConsentRoutes.use(authenticateWithSessionMiddleware);
customerConsentRoutes.get('/', readPerm, validateMiddleware(listCustomerConsentsQuerySchema, 'query'), asyncHandler(customerConsentController.list));
customerConsentRoutes.post('/', writePerm, validateMiddleware(createCustomerConsentSchema), asyncHandler(customerConsentController.create));
