import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { automationController } from '../controllers/automation.controller.js';
import {
  automationAiSuggestSchema,
  automationAnalyticsQuerySchema,
  automationExportQuerySchema,
  createTemplateSchema,
  createTriggerSchema,
  createWorkflowSchema,
  emitTriggerSchema,
  listAutomationLogsQuerySchema,
  listExecutionsQuerySchema,
  listTemplatesQuerySchema,
  listTriggersQuerySchema,
  listWorkflowsQuerySchema,
  updateTriggerSchema,
  updateWorkflowSchema,
  workflowIdParamSchema,
} from '../validators/automation.validator.js';

export const automationRoutes: Router = Router();

const autoRead = requireAnyPermission(RBAC_PERMISSIONS.AUTOMATION_READ, 'automation.read');
const autoWrite = requireAnyPermission(RBAC_PERMISSIONS.AUTOMATION_WRITE, 'automation.write');
const autoApprove = requireAnyPermission(RBAC_PERMISSIONS.AUTOMATION_APPROVE, 'automation.approve');
const autoExecute = requireAnyPermission(RBAC_PERMISSIONS.AUTOMATION_EXECUTE, 'automation.execute');
const autoAnalytics = requireAnyPermission(RBAC_PERMISSIONS.AUTOMATION_ANALYTICS, 'automation.analytics');
const autoManage = requireAnyPermission(RBAC_PERMISSIONS.AUTOMATION_MANAGE, 'automation.manage');

automationRoutes.use(authenticateWithSessionMiddleware);

automationRoutes.get('/health', asyncHandler(automationController.health));

automationRoutes.get('/workflows', autoRead, validateMiddleware(listWorkflowsQuerySchema, 'query'), asyncHandler(automationController.listWorkflows));
automationRoutes.post('/workflows', autoWrite, validateMiddleware(createWorkflowSchema), asyncHandler(automationController.createWorkflow));
automationRoutes.get('/workflows/:id', autoRead, validateMiddleware(workflowIdParamSchema, 'params'), asyncHandler(automationController.getWorkflow));
automationRoutes.patch('/workflows/:id', autoWrite, validateMiddleware(updateWorkflowSchema), asyncHandler(automationController.updateWorkflow));
automationRoutes.post('/workflows/:id/approve', autoApprove, validateMiddleware(workflowIdParamSchema, 'params'), asyncHandler(automationController.approveWorkflow));
automationRoutes.delete('/workflows/:id', autoManage, validateMiddleware(workflowIdParamSchema, 'params'), asyncHandler(automationController.deleteWorkflow));
automationRoutes.post('/templates/:id/use', autoWrite, validateMiddleware(workflowIdParamSchema, 'params'), asyncHandler(automationController.createFromTemplate));

automationRoutes.get('/templates', autoRead, validateMiddleware(listTemplatesQuerySchema, 'query'), asyncHandler(automationController.listTemplates));
automationRoutes.post('/templates', autoWrite, validateMiddleware(createTemplateSchema), asyncHandler(automationController.createTemplate));
automationRoutes.get('/templates/:id', autoRead, validateMiddleware(workflowIdParamSchema, 'params'), asyncHandler(automationController.getTemplate));

automationRoutes.get('/executions', autoRead, validateMiddleware(listExecutionsQuerySchema, 'query'), asyncHandler(automationController.listExecutions));
automationRoutes.get('/executions/:id', autoRead, validateMiddleware(workflowIdParamSchema, 'params'), asyncHandler(automationController.getExecution));
automationRoutes.post('/executions/:id/cancel', autoExecute, validateMiddleware(workflowIdParamSchema, 'params'), asyncHandler(automationController.cancelExecution));
automationRoutes.post('/executions/:id/retry', autoExecute, validateMiddleware(workflowIdParamSchema, 'params'), asyncHandler(automationController.retryExecution));

automationRoutes.get('/triggers', autoRead, validateMiddleware(listTriggersQuerySchema, 'query'), asyncHandler(automationController.listTriggers));
automationRoutes.post('/triggers', autoWrite, validateMiddleware(createTriggerSchema), asyncHandler(automationController.createTrigger));
automationRoutes.patch('/triggers/:id', autoWrite, validateMiddleware(updateTriggerSchema), asyncHandler(automationController.updateTrigger));
automationRoutes.delete('/triggers/:id', autoWrite, validateMiddleware(workflowIdParamSchema, 'params'), asyncHandler(automationController.deleteTrigger));
automationRoutes.post('/triggers/emit', autoExecute, validateMiddleware(emitTriggerSchema), asyncHandler(automationController.emitTrigger));

automationRoutes.get('/analytics/dashboard', autoAnalytics, validateMiddleware(automationAnalyticsQuerySchema, 'query'), asyncHandler(automationController.analyticsDashboard));
automationRoutes.get('/analytics', autoAnalytics, validateMiddleware(automationAnalyticsQuerySchema, 'query'), asyncHandler(automationController.listAnalytics));

automationRoutes.get('/logs', autoRead, validateMiddleware(listAutomationLogsQuerySchema, 'query'), asyncHandler(automationController.listLogs));

automationRoutes.get('/export', autoAnalytics, validateMiddleware(automationExportQuerySchema, 'query'), asyncHandler(automationController.export));

automationRoutes.post('/ai/suggest', autoWrite, validateMiddleware(automationAiSuggestSchema), asyncHandler(automationController.aiSuggest));
