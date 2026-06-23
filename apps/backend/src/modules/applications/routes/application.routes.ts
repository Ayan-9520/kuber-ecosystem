import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import {
  applicationController,
  applicationStatusController,
  applicationTimelineController,
  bankLoginController,
  creditReviewController,
  disbursementController,
  eligibilityResultController,
  sanctionController,
} from '../controllers/application.controller.js';
import {
  applicationTimelineQuerySchema,
  assignApplicationSchema,
  createApplicationSchema,
  createBankLoginSchema,
  createCreditReviewSchema,
  createDisbursementSchema,
  createSanctionSchema,
  evaluateEligibilityResultSchema,
  listApplicationsQuerySchema,
  listApplicationStatusQuerySchema,
  listBankLoginsQuerySchema,
  listCreditReviewsQuerySchema,
  listDisbursementsQuerySchema,
  listEligibilityResultsQuerySchema,
  listSanctionsQuerySchema,
  losAnalyticsQuerySchema,
  submitApplicationSchema,
  updateApplicationSchema,
  updateBankLoginSchema,
  updateCreditReviewSchema,
  updateDisbursementSchema,
  updateSanctionSchema,
  uuidParamSchema,
} from '../validators/application.validator.js';

const appsRead = requireAnyPermission(RBAC_PERMISSIONS.APPLICATIONS_READ, 'applications.read');
const appsWrite = requireAnyPermission(RBAC_PERMISSIONS.APPLICATIONS_WRITE, 'applications.write');
const appsAssign = requireAnyPermission(
  RBAC_PERMISSIONS.APPLICATIONS_ASSIGN,
  'applications.assign',
  RBAC_PERMISSIONS.APPLICATIONS_WRITE,
);
const appsApprove = requireAnyPermission(
  RBAC_PERMISSIONS.APPLICATIONS_APPROVE,
  'applications.approve',
  RBAC_PERMISSIONS.APPLICATIONS_WRITE,
);
const appsDisburse = requireAnyPermission(
  RBAC_PERMISSIONS.APPLICATIONS_DISBURSE,
  'applications.disburse',
  RBAC_PERMISSIONS.APPLICATIONS_APPROVE,
);

export const applicationRoutes = Router();
applicationRoutes.use(authenticateWithSessionMiddleware);
applicationRoutes.get('/analytics/summary', appsRead, validateMiddleware(losAnalyticsQuerySchema, 'query'), asyncHandler(applicationController.analytics));
applicationRoutes.get('/', appsRead, validateMiddleware(listApplicationsQuerySchema, 'query'), asyncHandler(applicationController.list));
applicationRoutes.post('/', appsWrite, validateMiddleware(createApplicationSchema), asyncHandler(applicationController.create));
applicationRoutes.get('/:id', appsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(applicationController.getById));
applicationRoutes.patch(
  '/:id',
  appsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateApplicationSchema),
  asyncHandler(applicationController.update),
);
applicationRoutes.delete('/:id', appsApprove, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(applicationController.remove));
applicationRoutes.post(
  '/:id/submit',
  appsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(submitApplicationSchema),
  asyncHandler(applicationController.submit),
);
applicationRoutes.post(
  '/:id/assign',
  appsAssign,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(assignApplicationSchema),
  asyncHandler(applicationController.assign),
);

export const applicationStatusRoutes = Router();
applicationStatusRoutes.use(authenticateWithSessionMiddleware);
applicationStatusRoutes.get(
  '/',
  appsRead,
  validateMiddleware(listApplicationStatusQuerySchema, 'query'),
  asyncHandler(applicationStatusController.list),
);

export const applicationTimelineRoutes = Router();
applicationTimelineRoutes.use(authenticateWithSessionMiddleware);
applicationTimelineRoutes.get(
  '/',
  appsRead,
  validateMiddleware(applicationTimelineQuerySchema, 'query'),
  asyncHandler(applicationTimelineController.get),
);

export const eligibilityResultRoutes = Router();
eligibilityResultRoutes.use(authenticateWithSessionMiddleware);
eligibilityResultRoutes.get(
  '/',
  appsRead,
  validateMiddleware(listEligibilityResultsQuerySchema, 'query'),
  asyncHandler(eligibilityResultController.list),
);
eligibilityResultRoutes.post('/evaluate', appsWrite, validateMiddleware(evaluateEligibilityResultSchema), asyncHandler(eligibilityResultController.evaluate));
eligibilityResultRoutes.get('/:id', appsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(eligibilityResultController.getById));

export const bankLoginRoutes = Router();
bankLoginRoutes.use(authenticateWithSessionMiddleware);
bankLoginRoutes.get('/', appsRead, validateMiddleware(listBankLoginsQuerySchema, 'query'), asyncHandler(bankLoginController.list));
bankLoginRoutes.post('/', appsWrite, validateMiddleware(createBankLoginSchema), asyncHandler(bankLoginController.create));
bankLoginRoutes.get('/:id', appsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(bankLoginController.getById));
bankLoginRoutes.patch(
  '/:id',
  appsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateBankLoginSchema),
  asyncHandler(bankLoginController.update),
);

export const creditReviewRoutes = Router();
creditReviewRoutes.use(authenticateWithSessionMiddleware);
creditReviewRoutes.get('/', appsRead, validateMiddleware(listCreditReviewsQuerySchema, 'query'), asyncHandler(creditReviewController.list));
creditReviewRoutes.post('/', appsApprove, validateMiddleware(createCreditReviewSchema), asyncHandler(creditReviewController.create));
creditReviewRoutes.get('/:id', appsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(creditReviewController.getById));
creditReviewRoutes.patch(
  '/:id',
  appsApprove,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCreditReviewSchema),
  asyncHandler(creditReviewController.update),
);

export const sanctionRoutes = Router();
sanctionRoutes.use(authenticateWithSessionMiddleware);
sanctionRoutes.get('/', appsRead, validateMiddleware(listSanctionsQuerySchema, 'query'), asyncHandler(sanctionController.list));
sanctionRoutes.post('/', appsApprove, validateMiddleware(createSanctionSchema), asyncHandler(sanctionController.create));
sanctionRoutes.get('/:id', appsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(sanctionController.getById));
sanctionRoutes.patch(
  '/:id',
  appsApprove,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateSanctionSchema),
  asyncHandler(sanctionController.update),
);

export const disbursementRoutes = Router();
disbursementRoutes.use(authenticateWithSessionMiddleware);
disbursementRoutes.get('/', appsRead, validateMiddleware(listDisbursementsQuerySchema, 'query'), asyncHandler(disbursementController.list));
disbursementRoutes.post('/', appsDisburse, validateMiddleware(createDisbursementSchema), asyncHandler(disbursementController.create));
disbursementRoutes.get('/:id', appsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(disbursementController.getById));
disbursementRoutes.patch(
  '/:id',
  appsDisburse,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateDisbursementSchema),
  asyncHandler(disbursementController.update),
);
