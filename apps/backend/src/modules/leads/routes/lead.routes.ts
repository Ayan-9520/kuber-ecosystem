import type { Request, Response } from 'express';
import { Router } from 'express';
import type { z } from 'zod';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import {
  leadActivityController,
  leadAnalyticsController,
  leadAssignmentController,
  leadController,
  leadFollowUpController,
  leadNoteController,
  leadScoreController,
  leadSourceController,
  leadTimelineController,
} from '../controllers/lead.controller.js';
import {
  assignLeadSchema,
  autoAssignLeadSchema,
  createLeadActivitySchema,
  createLeadFollowUpSchema,
  createLeadNoteSchema,
  createLeadSchema,
  createLeadSourceSchema,
  exportLeadsQuerySchema,
  leadAnalyticsQuerySchema,
  leadTimelineQuerySchema,
  listLeadActivitiesQuerySchema,
  listLeadAssignmentsQuerySchema,
  listLeadFollowUpsQuerySchema,
  listLeadNotesQuerySchema,
  listLeadScoresQuerySchema,
  listLeadSourcesQuerySchema,
  listLeadsQuerySchema,
  scoreLeadSchema,
  updateLeadFollowUpSchema,
  updateLeadNoteSchema,
  updateLeadSchema,
  updateLeadSourceSchema,
  uuidParamSchema,
} from '../validators/lead.validator.js';

const leadsRead = requireAnyPermission(RBAC_PERMISSIONS.LEADS_READ, 'leads.read');
const leadsWrite = requireAnyPermission(RBAC_PERMISSIONS.LEADS_WRITE, 'leads.write');
const leadsAssign = requireAnyPermission(
  RBAC_PERMISSIONS.LEADS_ASSIGN,
  'leads.assign',
  RBAC_PERMISSIONS.LEADS_WRITE,
);
const leadsExport = requireAnyPermission(
  RBAC_PERMISSIONS.LEADS_EXPORT,
  'leads.export',
  RBAC_PERMISSIONS.LEADS_READ,
);
const leadsApprove = requireAnyPermission(
  RBAC_PERMISSIONS.LEADS_APPROVE,
  'leads.approve',
  RBAC_PERMISSIONS.LEADS_WRITE,
);

function crudRoutes(
  router: Router,
  readPerm: ReturnType<typeof requireAnyPermission>,
  writePerm: ReturnType<typeof requireAnyPermission>,
  controller: {
    list: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<void>;
  },
  listSchema: z.ZodTypeAny,
  createSchema: unknown,
  updateSchema: unknown,
) {
  router.get('/', readPerm, validateMiddleware(listSchema, 'query'), asyncHandler(controller.list));
  router.post('/', writePerm, validateMiddleware(createSchema as never), asyncHandler(controller.create));
  router.get('/:id', readPerm, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(controller.getById));
  router.patch(
    '/:id',
    writePerm,
    validateMiddleware(uuidParamSchema, 'params'),
    validateMiddleware(updateSchema as never),
    asyncHandler(controller.update),
  );
}

export const leadRoutes = Router();
leadRoutes.use(authenticateWithSessionMiddleware);
leadRoutes.get('/export', leadsExport, validateMiddleware(exportLeadsQuerySchema, 'query'), asyncHandler(leadController.export));
leadRoutes.post('/score', leadsWrite, validateMiddleware(scoreLeadSchema), asyncHandler(leadController.score));
leadRoutes.get('/', leadsRead, validateMiddleware(listLeadsQuerySchema, 'query'), asyncHandler(leadController.list));
leadRoutes.post('/', leadsWrite, validateMiddleware(createLeadSchema), asyncHandler(leadController.create));
leadRoutes.get('/:id', leadsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(leadController.getById));
leadRoutes.patch(
  '/:id',
  leadsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateLeadSchema),
  asyncHandler(leadController.update),
);
leadRoutes.delete('/:id', leadsApprove, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(leadController.remove));
leadRoutes.post(
  '/:id/assign',
  leadsAssign,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(assignLeadSchema),
  asyncHandler(leadController.assign),
);
leadRoutes.post(
  '/:id/reassign',
  leadsAssign,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(assignLeadSchema),
  asyncHandler(leadController.reassign),
);
leadRoutes.post(
  '/:id/auto-assign',
  leadsAssign,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(autoAssignLeadSchema),
  asyncHandler(leadController.autoAssign),
);
leadRoutes.post(
  '/:id/schedule-followup',
  leadsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(leadController.scheduleFollowUp),
);

export const leadSourceRoutes = Router();
leadSourceRoutes.use(authenticateWithSessionMiddleware);
crudRoutes(
  leadSourceRoutes,
  leadsRead,
  leadsWrite,
  leadSourceController,
  listLeadSourcesQuerySchema,
  createLeadSourceSchema,
  updateLeadSourceSchema,
);
leadSourceRoutes.post(
  '/:id/deactivate',
  leadsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(leadSourceController.deactivate),
);

export const leadScoreRoutes = Router();
leadScoreRoutes.use(authenticateWithSessionMiddleware);
leadScoreRoutes.get('/', leadsRead, validateMiddleware(listLeadScoresQuerySchema, 'query'), asyncHandler(leadScoreController.list));
leadScoreRoutes.post('/score', leadsWrite, validateMiddleware(scoreLeadSchema), asyncHandler(leadScoreController.score));
leadScoreRoutes.get('/:id', leadsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(leadScoreController.getById));

export const leadAssignmentRoutes = Router();
leadAssignmentRoutes.use(authenticateWithSessionMiddleware);
leadAssignmentRoutes.get(
  '/',
  leadsRead,
  validateMiddleware(listLeadAssignmentsQuerySchema, 'query'),
  asyncHandler(leadAssignmentController.list),
);
leadAssignmentRoutes.get(
  '/:id',
  leadsRead,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(leadAssignmentController.getById),
);

export const leadActivityRoutes = Router();
leadActivityRoutes.use(authenticateWithSessionMiddleware);
leadActivityRoutes.get(
  '/',
  leadsRead,
  validateMiddleware(listLeadActivitiesQuerySchema, 'query'),
  asyncHandler(leadActivityController.list),
);
leadActivityRoutes.post('/', leadsWrite, validateMiddleware(createLeadActivitySchema), asyncHandler(leadActivityController.create));
leadActivityRoutes.get(
  '/:id',
  leadsRead,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(leadActivityController.getById),
);

export const leadNoteRoutes = Router();
leadNoteRoutes.use(authenticateWithSessionMiddleware);
leadNoteRoutes.get('/', leadsRead, validateMiddleware(listLeadNotesQuerySchema, 'query'), asyncHandler(leadNoteController.list));
leadNoteRoutes.post('/', leadsWrite, validateMiddleware(createLeadNoteSchema), asyncHandler(leadNoteController.create));
leadNoteRoutes.get('/:id', leadsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(leadNoteController.getById));
leadNoteRoutes.patch(
  '/:id',
  leadsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateLeadNoteSchema),
  asyncHandler(leadNoteController.update),
);
leadNoteRoutes.delete(
  '/:id',
  leadsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(leadNoteController.remove),
);

export const leadFollowUpRoutes = Router();
leadFollowUpRoutes.use(authenticateWithSessionMiddleware);
leadFollowUpRoutes.post('/process-reminders', leadsApprove, asyncHandler(leadFollowUpController.processReminders));
leadFollowUpRoutes.get(
  '/',
  leadsRead,
  validateMiddleware(listLeadFollowUpsQuerySchema, 'query'),
  asyncHandler(leadFollowUpController.list),
);
leadFollowUpRoutes.post('/', leadsWrite, validateMiddleware(createLeadFollowUpSchema), asyncHandler(leadFollowUpController.create));
leadFollowUpRoutes.get(
  '/:id',
  leadsRead,
  validateMiddleware(uuidParamSchema, 'params'),
  asyncHandler(leadFollowUpController.getById),
);
leadFollowUpRoutes.patch(
  '/:id',
  leadsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateLeadFollowUpSchema),
  asyncHandler(leadFollowUpController.update),
);

export const leadTimelineRoutes = Router();
leadTimelineRoutes.use(authenticateWithSessionMiddleware);
leadTimelineRoutes.get('/', leadsRead, validateMiddleware(leadTimelineQuerySchema, 'query'), asyncHandler(leadTimelineController.get));

export const leadAnalyticsRoutes = Router();
leadAnalyticsRoutes.use(authenticateWithSessionMiddleware);
const leadAnalyticsHandler = [
  leadsRead,
  validateMiddleware(leadAnalyticsQuerySchema, 'query'),
  asyncHandler(leadAnalyticsController.summary),
] as const;

leadAnalyticsRoutes.get('/summary', ...leadAnalyticsHandler);
leadAnalyticsRoutes.get('/', ...leadAnalyticsHandler);
