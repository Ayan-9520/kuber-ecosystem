import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
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
applicationRoutes.get('/analytics/summary', appsRead, validateMiddleware(losAnalyticsQuerySchema, 'query'), applicationController.analytics);
applicationRoutes.get('/', appsRead, validateMiddleware(listApplicationsQuerySchema, 'query'), applicationController.list);
applicationRoutes.post('/', appsWrite, validateMiddleware(createApplicationSchema), applicationController.create);
applicationRoutes.get('/:id', appsRead, validateMiddleware(uuidParamSchema, 'params'), applicationController.getById);
applicationRoutes.patch(
  '/:id',
  appsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateApplicationSchema),
  applicationController.update,
);
applicationRoutes.delete('/:id', appsApprove, validateMiddleware(uuidParamSchema, 'params'), applicationController.remove);
applicationRoutes.post(
  '/:id/submit',
  appsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(submitApplicationSchema),
  applicationController.submit,
);
applicationRoutes.post(
  '/:id/assign',
  appsAssign,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(assignApplicationSchema),
  applicationController.assign,
);

export const applicationStatusRoutes = Router();
applicationStatusRoutes.use(authenticateWithSessionMiddleware);
applicationStatusRoutes.get(
  '/',
  appsRead,
  validateMiddleware(listApplicationStatusQuerySchema, 'query'),
  applicationStatusController.list,
);

export const applicationTimelineRoutes = Router();
applicationTimelineRoutes.use(authenticateWithSessionMiddleware);
applicationTimelineRoutes.get(
  '/',
  appsRead,
  validateMiddleware(applicationTimelineQuerySchema, 'query'),
  applicationTimelineController.get,
);

export const eligibilityResultRoutes = Router();
eligibilityResultRoutes.use(authenticateWithSessionMiddleware);
eligibilityResultRoutes.get(
  '/',
  appsRead,
  validateMiddleware(listEligibilityResultsQuerySchema, 'query'),
  eligibilityResultController.list,
);
eligibilityResultRoutes.post('/evaluate', appsWrite, validateMiddleware(evaluateEligibilityResultSchema), eligibilityResultController.evaluate);
eligibilityResultRoutes.get('/:id', appsRead, validateMiddleware(uuidParamSchema, 'params'), eligibilityResultController.getById);

export const bankLoginRoutes = Router();
bankLoginRoutes.use(authenticateWithSessionMiddleware);
bankLoginRoutes.get('/', appsRead, validateMiddleware(listBankLoginsQuerySchema, 'query'), bankLoginController.list);
bankLoginRoutes.post('/', appsWrite, validateMiddleware(createBankLoginSchema), bankLoginController.create);
bankLoginRoutes.get('/:id', appsRead, validateMiddleware(uuidParamSchema, 'params'), bankLoginController.getById);
bankLoginRoutes.patch(
  '/:id',
  appsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateBankLoginSchema),
  bankLoginController.update,
);

export const creditReviewRoutes = Router();
creditReviewRoutes.use(authenticateWithSessionMiddleware);
creditReviewRoutes.get('/', appsRead, validateMiddleware(listCreditReviewsQuerySchema, 'query'), creditReviewController.list);
creditReviewRoutes.post('/', appsApprove, validateMiddleware(createCreditReviewSchema), creditReviewController.create);
creditReviewRoutes.get('/:id', appsRead, validateMiddleware(uuidParamSchema, 'params'), creditReviewController.getById);
creditReviewRoutes.patch(
  '/:id',
  appsApprove,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCreditReviewSchema),
  creditReviewController.update,
);

export const sanctionRoutes = Router();
sanctionRoutes.use(authenticateWithSessionMiddleware);
sanctionRoutes.get('/', appsRead, validateMiddleware(listSanctionsQuerySchema, 'query'), sanctionController.list);
sanctionRoutes.post('/', appsApprove, validateMiddleware(createSanctionSchema), sanctionController.create);
sanctionRoutes.get('/:id', appsRead, validateMiddleware(uuidParamSchema, 'params'), sanctionController.getById);
sanctionRoutes.patch(
  '/:id',
  appsApprove,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateSanctionSchema),
  sanctionController.update,
);

export const disbursementRoutes = Router();
disbursementRoutes.use(authenticateWithSessionMiddleware);
disbursementRoutes.get('/', appsRead, validateMiddleware(listDisbursementsQuerySchema, 'query'), disbursementController.list);
disbursementRoutes.post('/', appsDisburse, validateMiddleware(createDisbursementSchema), disbursementController.create);
disbursementRoutes.get('/:id', appsRead, validateMiddleware(uuidParamSchema, 'params'), disbursementController.getById);
disbursementRoutes.patch(
  '/:id',
  appsDisburse,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateDisbursementSchema),
  disbursementController.update,
);
