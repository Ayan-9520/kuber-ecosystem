import { Router } from 'express';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import { goLiveController } from '../controllers/go-live.controller.js';
import {
  activateWarRoomSchema,
  advanceWorkflowSchema,
  completeLaunchSchema,
  createLaunchEventSchema,
  createLaunchIncidentSchema,
  decideGoLiveApprovalSchema,
  goLiveStatusQuerySchema,
  goLiveWebhookSchema,
  launchIncidentIdParamSchema,
  listGoLiveChecklistQuerySchema,
  listLaunchEventsQuerySchema,
  listLaunchIncidentsQuerySchema,
  listLaunchMetricsQuerySchema,
  startLaunchSchema,
  updateGoLiveChecklistSchema,
  updateLaunchIncidentSchema,
} from '../validators/go-live.validator.js';

const goLiveRead = requireAnyPermission(
  RBAC_PERMISSIONS.GOLIVE_READ,
  'golive.read',
  RBAC_PERMISSIONS.LAUNCH_READ,
  'launch.read',
  RBAC_PERMISSIONS.PRODUCTION_READ,
  'production.read',
);

const goLiveManage = requireAnyPermission(
  RBAC_PERMISSIONS.GOLIVE_MANAGE,
  'golive.manage',
  RBAC_PERMISSIONS.LAUNCH_MANAGE,
  'launch.manage',
  RBAC_PERMISSIONS.PRODUCTION_MANAGE,
  'production.manage',
);

const goLiveApprove = requireAnyPermission(
  RBAC_PERMISSIONS.GOLIVE_APPROVE,
  'golive.approve',
  RBAC_PERMISSIONS.LAUNCH_APPROVE,
  'launch.approve',
  RBAC_PERMISSIONS.RELEASE_APPROVE,
  'release.approve',
);

const incidentManage = requireAnyPermission(
  RBAC_PERMISSIONS.INCIDENT_MANAGE,
  'incident.manage',
  RBAC_PERMISSIONS.LAUNCH_MANAGE,
  'launch.manage',
);

export const goLiveRoutes = Router();

goLiveRoutes.post('/webhook', validateMiddleware(goLiveWebhookSchema), asyncHandler(goLiveController.webhook));

goLiveRoutes.use(authenticateWithSessionMiddleware);

goLiveRoutes.get('/readiness', goLiveRead, asyncHandler(goLiveController.readiness));
goLiveRoutes.get('/dashboard', goLiveRead, asyncHandler(goLiveController.dashboard));
goLiveRoutes.get('/reports', goLiveRead, asyncHandler(goLiveController.reports));
goLiveRoutes.get('/reports/execution', goLiveRead, validateMiddleware(goLiveStatusQuerySchema, 'query'), asyncHandler(goLiveController.executionReports));

goLiveRoutes.get('/status', goLiveRead, validateMiddleware(goLiveStatusQuerySchema, 'query'), asyncHandler(goLiveController.status));

goLiveRoutes.get('/checklist', goLiveRead, validateMiddleware(listGoLiveChecklistQuerySchema, 'query'), asyncHandler(goLiveController.checklist));
goLiveRoutes.patch('/checklist/:itemCode', goLiveManage, validateMiddleware(updateGoLiveChecklistSchema), asyncHandler(goLiveController.updateChecklistItem));

goLiveRoutes.get('/approvals', goLiveRead, asyncHandler(goLiveController.approvals));
goLiveRoutes.post(
  '/approvals/:launchId/:approvalType',
  goLiveApprove,
  validateMiddleware(decideGoLiveApprovalSchema),
  asyncHandler(goLiveController.decideApproval),
);

goLiveRoutes.get('/events', goLiveRead, validateMiddleware(listLaunchEventsQuerySchema, 'query'), asyncHandler(goLiveController.events));
goLiveRoutes.post('/events', goLiveManage, validateMiddleware(createLaunchEventSchema), asyncHandler(goLiveController.createEvent));

goLiveRoutes.get('/incidents', goLiveRead, validateMiddleware(listLaunchIncidentsQuerySchema, 'query'), asyncHandler(goLiveController.incidents));
goLiveRoutes.post('/incidents', incidentManage, validateMiddleware(createLaunchIncidentSchema), asyncHandler(goLiveController.createIncident));
goLiveRoutes.patch('/incidents/:incidentId', incidentManage, validateMiddleware(launchIncidentIdParamSchema, 'params'), validateMiddleware(updateLaunchIncidentSchema), asyncHandler(goLiveController.updateIncident));

goLiveRoutes.get('/metrics', goLiveRead, validateMiddleware(listLaunchMetricsQuerySchema, 'query'), asyncHandler(goLiveController.metrics));
goLiveRoutes.post('/metrics/snapshot', goLiveManage, asyncHandler(goLiveController.snapshotMetrics));

goLiveRoutes.get('/war-room', goLiveRead, validateMiddleware(goLiveStatusQuerySchema, 'query'), asyncHandler(goLiveController.warRoom));
goLiveRoutes.post('/war-room/activate', goLiveManage, validateMiddleware(activateWarRoomSchema), asyncHandler(goLiveController.activateWarRoom));

goLiveRoutes.post('/launch', goLiveApprove, validateMiddleware(startLaunchSchema), asyncHandler(goLiveController.startLaunch));
goLiveRoutes.post('/launch/complete', goLiveManage, validateMiddleware(completeLaunchSchema), asyncHandler(goLiveController.completeLaunch));
goLiveRoutes.post('/launch/advance', goLiveManage, validateMiddleware(advanceWorkflowSchema), asyncHandler(goLiveController.advanceWorkflow));
goLiveRoutes.post('/launch/smoke-tests', goLiveManage, asyncHandler(goLiveController.runSmokeTests));
