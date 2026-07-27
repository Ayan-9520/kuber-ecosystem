import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { loanFulfillmentController } from '../controllers/loan-fulfillment.controller.js';
import {
  addDocumentSchema,
  addTaskSchema,
  advanceStageSchema,
  approvalDecideParamsSchema,
  createCaseSchema,
  createRevenueRuleSchema,
  decideApprovalSchema,
  documentParamsSchema,
  listCasesQuerySchema,
  listRevenueRulesQuerySchema,
  setStakeholdersSchema,
  taskParamsSchema,
  updateCaseSchema,
  updateRevenueRuleSchema,
  updateTaskSchema,
  uuidParamSchema,
} from '../validators/loan-fulfillment.validator.js';

const read = requireAnyPermission(
  RBAC_PERMISSIONS.LOAN_FULFILLMENT_READ,
  'loan_fulfillment.read',
  RBAC_PERMISSIONS.APPLICATIONS_READ,
  'applications.read',
  RBAC_PERMISSIONS.COMMISSIONS_READ,
  'commissions.read',
);
const write = requireAnyPermission(
  RBAC_PERMISSIONS.LOAN_FULFILLMENT_WRITE,
  'loan_fulfillment.write',
  RBAC_PERMISSIONS.APPLICATIONS_WRITE,
  'applications.write',
);
const approve = requireAnyPermission(
  RBAC_PERMISSIONS.LOAN_FULFILLMENT_APPROVE,
  'loan_fulfillment.approve',
  RBAC_PERMISSIONS.APPLICATIONS_APPROVE,
  'applications.approve',
);
const writeOrApprove = requireAnyPermission(
  RBAC_PERMISSIONS.LOAN_FULFILLMENT_WRITE,
  'loan_fulfillment.write',
  RBAC_PERMISSIONS.LOAN_FULFILLMENT_APPROVE,
  'loan_fulfillment.approve',
  RBAC_PERMISSIONS.APPLICATIONS_WRITE,
  'applications.write',
);
const configure = requireAnyPermission(
  RBAC_PERMISSIONS.LOAN_FULFILLMENT_CONFIGURE,
  'loan_fulfillment.configure',
  RBAC_PERMISSIONS.COMMISSIONS_WRITE,
  'commissions.write',
);

export const loanFulfillmentRoutes = Router();
loanFulfillmentRoutes.use(authenticateWithSessionMiddleware);

loanFulfillmentRoutes.get('/dashboard', read, asyncHandler(loanFulfillmentController.dashboard));

loanFulfillmentRoutes.get(
  '/cases',
  read,
  validateMiddleware(listCasesQuerySchema, 'query'),
  asyncHandler(loanFulfillmentController.listCases),
);
loanFulfillmentRoutes.post(
  '/cases',
  write,
  validateMiddleware(createCaseSchema),
  asyncHandler(loanFulfillmentController.createCase),
);
loanFulfillmentRoutes.get(
  '/cases/:id',
  read,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(loanFulfillmentController.getCase),
);
loanFulfillmentRoutes.patch(
  '/cases/:id',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateCaseSchema),
  asyncHandler(loanFulfillmentController.updateCase),
);
loanFulfillmentRoutes.post(
  '/cases/:id/advance-stage',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(advanceStageSchema),
  asyncHandler(loanFulfillmentController.advanceStage),
);
loanFulfillmentRoutes.put(
  '/cases/:id/stakeholders',
  writeOrApprove,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(setStakeholdersSchema),
  asyncHandler(loanFulfillmentController.setStakeholders),
);
loanFulfillmentRoutes.post(
  '/cases/:id/documents',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(addDocumentSchema),
  asyncHandler(loanFulfillmentController.addDocument),
);
loanFulfillmentRoutes.post(
  '/cases/:id/tasks',
  write,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(addTaskSchema),
  asyncHandler(loanFulfillmentController.addTask),
);
loanFulfillmentRoutes.patch(
  '/cases/:id/tasks/:taskId',
  write,
  validateMiddleware(taskParamsSchema, 'params'),
  validateMiddleware(updateTaskSchema),
  asyncHandler(loanFulfillmentController.updateTask),
);
loanFulfillmentRoutes.post(
  '/cases/:id/documents/:documentId/verify',
  writeOrApprove,
  validateMiddleware(documentParamsSchema, 'params'),
  asyncHandler(loanFulfillmentController.verifyDocument),
);
loanFulfillmentRoutes.post(
  '/cases/:id/approvals/:approvalId/decide',
  approve,
  validateMiddleware(approvalDecideParamsSchema, 'params'),
  validateMiddleware(decideApprovalSchema),
  asyncHandler(loanFulfillmentController.decideApproval),
);

loanFulfillmentRoutes.get(
  '/revenue-rules',
  read,
  validateMiddleware(listRevenueRulesQuerySchema, 'query'),
  asyncHandler(loanFulfillmentController.listRevenueRules),
);
loanFulfillmentRoutes.get(
  '/revenue-rules/:id',
  read,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(loanFulfillmentController.getRevenueRule),
);
loanFulfillmentRoutes.post(
  '/revenue-rules',
  configure,
  validateMiddleware(createRevenueRuleSchema),
  asyncHandler(loanFulfillmentController.createRevenueRule),
);
loanFulfillmentRoutes.patch(
  '/revenue-rules/:id',
  configure,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateRevenueRuleSchema),
  asyncHandler(loanFulfillmentController.updateRevenueRule),
);
