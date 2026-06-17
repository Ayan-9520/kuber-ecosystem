import type { Request, Response } from 'express';
import { Router } from 'express';
import type { z } from 'zod';

import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
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
  router.get('/', readPerm, validateMiddleware(listSchema, 'query'), controller.list);
  router.post('/', writePerm, validateMiddleware(createSchema as never), controller.create);
  router.get('/:id', readPerm, validateMiddleware(uuidParamSchema, 'params'), controller.getById);
  router.patch(
    '/:id',
    writePerm,
    validateMiddleware(uuidParamSchema, 'params'),
    validateMiddleware(updateSchema as never),
    controller.update,
  );
}

export const leadRoutes = Router();
leadRoutes.use(authenticateWithSessionMiddleware);
leadRoutes.get('/export', leadsExport, validateMiddleware(exportLeadsQuerySchema, 'query'), leadController.export);
leadRoutes.post('/score', leadsWrite, validateMiddleware(scoreLeadSchema), leadController.score);
leadRoutes.get('/', leadsRead, validateMiddleware(listLeadsQuerySchema, 'query'), leadController.list);
leadRoutes.post('/', leadsWrite, validateMiddleware(createLeadSchema), leadController.create);
leadRoutes.get('/:id', leadsRead, validateMiddleware(uuidParamSchema, 'params'), leadController.getById);
leadRoutes.patch(
  '/:id',
  leadsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateLeadSchema),
  leadController.update,
);
leadRoutes.delete('/:id', leadsApprove, validateMiddleware(uuidParamSchema, 'params'), leadController.remove);
leadRoutes.post(
  '/:id/assign',
  leadsAssign,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(assignLeadSchema),
  leadController.assign,
);
leadRoutes.post(
  '/:id/reassign',
  leadsAssign,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(assignLeadSchema),
  leadController.reassign,
);
leadRoutes.post(
  '/:id/auto-assign',
  leadsAssign,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(autoAssignLeadSchema),
  leadController.autoAssign,
);
leadRoutes.post(
  '/:id/schedule-followup',
  leadsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  leadController.scheduleFollowUp,
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
  leadSourceController.deactivate,
);

export const leadScoreRoutes = Router();
leadScoreRoutes.use(authenticateWithSessionMiddleware);
leadScoreRoutes.get('/', leadsRead, validateMiddleware(listLeadScoresQuerySchema, 'query'), leadScoreController.list);
leadScoreRoutes.post('/score', leadsWrite, validateMiddleware(scoreLeadSchema), leadScoreController.score);
leadScoreRoutes.get('/:id', leadsRead, validateMiddleware(uuidParamSchema, 'params'), leadScoreController.getById);

export const leadAssignmentRoutes = Router();
leadAssignmentRoutes.use(authenticateWithSessionMiddleware);
leadAssignmentRoutes.get(
  '/',
  leadsRead,
  validateMiddleware(listLeadAssignmentsQuerySchema, 'query'),
  leadAssignmentController.list,
);
leadAssignmentRoutes.get(
  '/:id',
  leadsRead,
  validateMiddleware(uuidParamSchema, 'params'),
  leadAssignmentController.getById,
);

export const leadActivityRoutes = Router();
leadActivityRoutes.use(authenticateWithSessionMiddleware);
leadActivityRoutes.get(
  '/',
  leadsRead,
  validateMiddleware(listLeadActivitiesQuerySchema, 'query'),
  leadActivityController.list,
);
leadActivityRoutes.post('/', leadsWrite, validateMiddleware(createLeadActivitySchema), leadActivityController.create);
leadActivityRoutes.get(
  '/:id',
  leadsRead,
  validateMiddleware(uuidParamSchema, 'params'),
  leadActivityController.getById,
);

export const leadNoteRoutes = Router();
leadNoteRoutes.use(authenticateWithSessionMiddleware);
leadNoteRoutes.get('/', leadsRead, validateMiddleware(listLeadNotesQuerySchema, 'query'), leadNoteController.list);
leadNoteRoutes.post('/', leadsWrite, validateMiddleware(createLeadNoteSchema), leadNoteController.create);
leadNoteRoutes.get('/:id', leadsRead, validateMiddleware(uuidParamSchema, 'params'), leadNoteController.getById);
leadNoteRoutes.patch(
  '/:id',
  leadsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateLeadNoteSchema),
  leadNoteController.update,
);
leadNoteRoutes.delete(
  '/:id',
  leadsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  leadNoteController.remove,
);

export const leadFollowUpRoutes = Router();
leadFollowUpRoutes.use(authenticateWithSessionMiddleware);
leadFollowUpRoutes.post('/process-reminders', leadsApprove, leadFollowUpController.processReminders);
leadFollowUpRoutes.get(
  '/',
  leadsRead,
  validateMiddleware(listLeadFollowUpsQuerySchema, 'query'),
  leadFollowUpController.list,
);
leadFollowUpRoutes.post('/', leadsWrite, validateMiddleware(createLeadFollowUpSchema), leadFollowUpController.create);
leadFollowUpRoutes.get(
  '/:id',
  leadsRead,
  validateMiddleware(uuidParamSchema, 'params'),
  leadFollowUpController.getById,
);
leadFollowUpRoutes.patch(
  '/:id',
  leadsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateLeadFollowUpSchema),
  leadFollowUpController.update,
);

export const leadTimelineRoutes = Router();
leadTimelineRoutes.use(authenticateWithSessionMiddleware);
leadTimelineRoutes.get('/', leadsRead, validateMiddleware(leadTimelineQuerySchema, 'query'), leadTimelineController.get);

export const leadAnalyticsRoutes = Router();
leadAnalyticsRoutes.use(authenticateWithSessionMiddleware);
const leadAnalyticsHandler = [
  leadsRead,
  validateMiddleware(leadAnalyticsQuerySchema, 'query'),
  leadAnalyticsController.summary,
] as const;

leadAnalyticsRoutes.get('/summary', ...leadAnalyticsHandler);
leadAnalyticsRoutes.get('/', ...leadAnalyticsHandler);
