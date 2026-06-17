import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { partnerController } from '../controllers/partner.controller.js';
import {
  createPartnerSchema,
  listPartnersQuerySchema,
  registerPartnerSchema,
  updatePartnerSchema,
  uuidParamSchema,
} from '../validators/partner.validator.js';

const read = requireAnyPermission(RBAC_PERMISSIONS.PARTNERS_READ, 'partners.read');
const write = requireAnyPermission(RBAC_PERMISSIONS.PARTNERS_WRITE, 'partners.write');

export const partnerRoutes: Router = Router();

partnerRoutes.post('/register', validateMiddleware(registerPartnerSchema), asyncHandler(partnerController.register));

partnerRoutes.use(authenticateWithSessionMiddleware);
partnerRoutes.get('/health', asyncHandler(partnerController.health));
partnerRoutes.get('/', read, validateMiddleware(listPartnersQuerySchema, 'query'), asyncHandler(partnerController.list));
partnerRoutes.post('/', write, validateMiddleware(createPartnerSchema), asyncHandler(partnerController.create));
partnerRoutes.get('/:id', read, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(partnerController.getById));
partnerRoutes.patch(
  '/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updatePartnerSchema),
  asyncHandler(partnerController.update),
);
partnerRoutes.delete(
  '/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(partnerController.remove),
);
