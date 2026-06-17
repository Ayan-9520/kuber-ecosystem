import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { uatController } from '../controllers/uat.controller.js';
import {
  createUatCycleSchema,
  createUatCommentSchema,
  createUatDefectSchema,
  createUatPlanSchema,
  createUatRiskSchema,
  createUatScenarioSchema,
  createUatTestCaseSchema,
  executeUatTestCaseSchema,
  listUatCyclesQuerySchema,
  listUatDefectsQuerySchema,
  listUatApprovalsQuerySchema,
  listUatReviewsQuerySchema,
  listUatRisksQuerySchema,
  listUatExecutionsQuerySchema,
  listUatPlansQuerySchema,
  listUatScenariosQuerySchema,
  listUatSignoffsQuerySchema,
  listUatTemplatesQuerySchema,
  listUatTestCasesQuerySchema,
  submitUatSignoffSchema,
  submitUatApprovalSchema,
  updateUatReviewSchema,
  uatStatusQuerySchema,
  uatAnalyticsQuerySchema,
  uatIdParamSchema,
  uatReportQuerySchema,
  updateUatCycleSchema,
  updateUatDefectSchema,
  updateUatPlanSchema,
} from '../validators/uat.validator.js';

export const uatRoutes: Router = Router();

const uatRead = requireAnyPermission(RBAC_PERMISSIONS.UAT_READ, 'uat.read');
const uatWrite = requireAnyPermission(RBAC_PERMISSIONS.UAT_WRITE, 'uat.write');
const uatExecute = requireAnyPermission(RBAC_PERMISSIONS.UAT_EXECUTE, 'uat.execute');
const uatApprove = requireAnyPermission(RBAC_PERMISSIONS.UAT_APPROVE, 'uat.approve');
const uatReview = requireAnyPermission(RBAC_PERMISSIONS.UAT_REVIEW, 'uat.review');
const uatSignoff = requireAnyPermission(RBAC_PERMISSIONS.UAT_SIGNOFF, 'uat.signoff');

uatRoutes.use(authenticateWithSessionMiddleware);

uatRoutes.get('/health', asyncHandler(uatController.health));
uatRoutes.get('/dashboard', uatRead, validateMiddleware(uatAnalyticsQuerySchema, 'query'), asyncHandler(uatController.dashboard));

// Plans
uatRoutes.get('/plans', uatRead, validateMiddleware(listUatPlansQuerySchema, 'query'), asyncHandler(uatController.listPlans));
uatRoutes.post('/plans', uatWrite, validateMiddleware(createUatPlanSchema), asyncHandler(uatController.createPlan));
uatRoutes.get('/plans/:id', uatRead, validateMiddleware(uatIdParamSchema, 'params'), asyncHandler(uatController.getPlan));
uatRoutes.patch('/plans/:id', uatWrite, validateMiddleware(updateUatPlanSchema), asyncHandler(uatController.updatePlan));

// Cycles
uatRoutes.get('/cycles', uatRead, validateMiddleware(listUatCyclesQuerySchema, 'query'), asyncHandler(uatController.listCycles));
uatRoutes.post('/cycles', uatWrite, validateMiddleware(createUatCycleSchema), asyncHandler(uatController.createCycle));
uatRoutes.get('/cycles/:id', uatRead, validateMiddleware(uatIdParamSchema, 'params'), asyncHandler(uatController.getCycle));
uatRoutes.patch('/cycles/:id', uatWrite, validateMiddleware(updateUatCycleSchema), asyncHandler(uatController.updateCycle));
uatRoutes.get('/cycles/:cycleId/quality-gates', uatRead, asyncHandler(uatController.qualityGates));
uatRoutes.get('/cycles/:cycleId/readiness', uatRead, asyncHandler(uatController.readiness));

// Scenarios
uatRoutes.get('/scenarios', uatRead, validateMiddleware(listUatScenariosQuerySchema, 'query'), asyncHandler(uatController.listScenarios));
uatRoutes.post('/scenarios', uatWrite, validateMiddleware(createUatScenarioSchema), asyncHandler(uatController.createScenario));
uatRoutes.get('/scenarios/:id', uatRead, validateMiddleware(uatIdParamSchema, 'params'), asyncHandler(uatController.getScenario));

// Test Cases
uatRoutes.get('/test-cases', uatRead, validateMiddleware(listUatTestCasesQuerySchema, 'query'), asyncHandler(uatController.listTestCases));
uatRoutes.post('/test-cases', uatWrite, validateMiddleware(createUatTestCaseSchema), asyncHandler(uatController.createTestCase));
uatRoutes.get('/test-cases/:id', uatRead, validateMiddleware(uatIdParamSchema, 'params'), asyncHandler(uatController.getTestCase));

// Executions
uatRoutes.get('/executions', uatRead, validateMiddleware(listUatExecutionsQuerySchema, 'query'), asyncHandler(uatController.listExecutions));
uatRoutes.get('/executions/:id', uatRead, validateMiddleware(uatIdParamSchema, 'params'), asyncHandler(uatController.getExecution));
uatRoutes.post('/executions', uatExecute, validateMiddleware(executeUatTestCaseSchema), asyncHandler(uatController.executeTestCase));

// Defects
uatRoutes.get('/defects', uatRead, validateMiddleware(listUatDefectsQuerySchema, 'query'), asyncHandler(uatController.listDefects));
uatRoutes.post('/defects', uatExecute, validateMiddleware(createUatDefectSchema), asyncHandler(uatController.createDefect));
uatRoutes.get('/defects/:id', uatRead, validateMiddleware(uatIdParamSchema, 'params'), asyncHandler(uatController.getDefect));
uatRoutes.patch('/defects/:id', uatApprove, validateMiddleware(updateUatDefectSchema), asyncHandler(uatController.updateDefect));

// Signoffs
uatRoutes.get('/signoffs', uatRead, validateMiddleware(listUatSignoffsQuerySchema, 'query'), asyncHandler(uatController.listSignoffs));
uatRoutes.post('/signoffs', uatSignoff, validateMiddleware(submitUatSignoffSchema), asyncHandler(uatController.submitSignoff));

// Final UAT Signoff Framework
uatRoutes.get('/approvals', uatRead, validateMiddleware(listUatApprovalsQuerySchema, 'query'), asyncHandler(uatController.listApprovals));
uatRoutes.post('/approvals', uatSignoff, validateMiddleware(submitUatApprovalSchema), asyncHandler(uatController.submitApproval));
uatRoutes.get('/reviews', uatRead, validateMiddleware(listUatReviewsQuerySchema, 'query'), asyncHandler(uatController.listReviews));
uatRoutes.post('/reviews', uatReview, validateMiddleware(updateUatReviewSchema), asyncHandler(uatController.updateReview));
uatRoutes.get('/risks', uatRead, validateMiddleware(listUatRisksQuerySchema, 'query'), asyncHandler(uatController.listRisks));
uatRoutes.post('/risks', uatReview, validateMiddleware(createUatRiskSchema), asyncHandler(uatController.createRisk));
uatRoutes.get('/status', uatRead, validateMiddleware(uatStatusQuerySchema, 'query'), asyncHandler(uatController.getStatus));
uatRoutes.post('/comments', uatReview, validateMiddleware(createUatCommentSchema), asyncHandler(uatController.addComment));
uatRoutes.get('/reports/final-signoff', uatRead, validateMiddleware(uatStatusQuerySchema, 'query'), asyncHandler(uatController.finalSignoffReports));

// Templates
uatRoutes.get('/templates', uatRead, validateMiddleware(listUatTemplatesQuerySchema, 'query'), asyncHandler(uatController.listTemplates));
uatRoutes.get('/templates/:id', uatRead, validateMiddleware(uatIdParamSchema, 'params'), asyncHandler(uatController.getTemplate));

// Reports
uatRoutes.get('/reports/summary', uatRead, validateMiddleware(uatReportQuerySchema, 'query'), asyncHandler(uatController.uatSummaryReport));
uatRoutes.get('/reports/defects', uatRead, validateMiddleware(uatReportQuerySchema, 'query'), asyncHandler(uatController.defectSummaryReport));
uatRoutes.get('/reports/module-readiness', uatRead, validateMiddleware(uatReportQuerySchema, 'query'), asyncHandler(uatController.moduleReadinessReport));
uatRoutes.get('/reports/business-readiness', uatRead, validateMiddleware(uatReportQuerySchema, 'query'), asyncHandler(uatController.businessReadinessReport));
uatRoutes.get('/reports/signoff', uatRead, validateMiddleware(uatReportQuerySchema, 'query'), asyncHandler(uatController.signoffReport));
