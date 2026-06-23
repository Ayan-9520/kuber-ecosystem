import { Router } from 'express';

import { asyncHandler } from '../../../shared/middleware/async-handler.middleware.js';
import { RBAC_PERMISSIONS } from '../../../shared/constants/rbac.constants.js';
import { authenticateWithSessionMiddleware } from '../../../shared/middleware/authenticate.middleware.js';
import { requireAnyPermission } from '../../../shared/middleware/rbac.middleware.js';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware.js';
import {
  ticketAnalyticsController,
  ticketAssignmentController,
  ticketCategoryController,
  ticketController,
  ticketEscalationController,
  ticketMessageController,
  ticketResolutionController,
} from '../controllers/ticket.controller.js';
import {
  assignTicketSchema,
  closeTicketSchema,
  createTicketAttachmentBodySchema,
  createTicketCategorySchema,
  createTicketMessageSchema,
  createTicketSchema,
  escalateTicketSchema,
  listTicketAssignmentsQuerySchema,
  listTicketCategoriesQuerySchema,
  listTicketEscalationsQuerySchema,
  listTicketMessagesQuerySchema,
  listTicketResolutionsQuerySchema,
  listTicketsQuerySchema,
  rejectTicketSchema,
  resolveTicketSchema,
  ticketAnalyticsQuerySchema,
  updateTicketCategorySchema,
  updateTicketSchema,
  uuidParamSchema,
} from '../validators/support.validator.js';

const ticketsRead = requireAnyPermission(RBAC_PERMISSIONS.TICKETS_READ, 'tickets.read');
const ticketsWrite = requireAnyPermission(RBAC_PERMISSIONS.TICKETS_WRITE, 'tickets.write');
const ticketsAssign = requireAnyPermission(
  RBAC_PERMISSIONS.TICKETS_ASSIGN,
  'tickets.assign',
  RBAC_PERMISSIONS.TICKETS_WRITE,
);
const ticketsResolve = requireAnyPermission(
  RBAC_PERMISSIONS.TICKETS_RESOLVE,
  'tickets.resolve',
  RBAC_PERMISSIONS.TICKETS_WRITE,
);
const ticketsClose = requireAnyPermission(
  RBAC_PERMISSIONS.TICKETS_CLOSE,
  'tickets.close',
  RBAC_PERMISSIONS.TICKETS_RESOLVE,
);
const ticketsEscalate = requireAnyPermission(
  RBAC_PERMISSIONS.TICKETS_ESCALATE,
  'tickets.escalate',
  RBAC_PERMISSIONS.TICKETS_ASSIGN,
);

export const ticketRoutes = Router();
ticketRoutes.use(authenticateWithSessionMiddleware);
ticketRoutes.get('/', ticketsRead, validateMiddleware(listTicketsQuerySchema, 'query'), asyncHandler(ticketController.list));
ticketRoutes.post('/', ticketsWrite, validateMiddleware(createTicketSchema), asyncHandler(ticketController.create));
ticketRoutes.get('/:id', ticketsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(ticketController.getById));
ticketRoutes.patch(
  '/:id',
  ticketsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateTicketSchema),
  asyncHandler(ticketController.update),
);
ticketRoutes.delete('/:id', ticketsWrite, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(ticketController.remove));
ticketRoutes.post(
  '/:id/assign',
  ticketsAssign,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(assignTicketSchema),
  asyncHandler(ticketController.assign),
);
ticketRoutes.post(
  '/:id/escalate',
  ticketsEscalate,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(escalateTicketSchema),
  asyncHandler(ticketController.escalate),
);
ticketRoutes.post(
  '/:id/resolve',
  ticketsResolve,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(resolveTicketSchema),
  asyncHandler(ticketController.resolve),
);
ticketRoutes.post(
  '/:id/close',
  ticketsClose,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(closeTicketSchema),
  asyncHandler(ticketController.close),
);
ticketRoutes.post(
  '/:id/reject',
  ticketsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(rejectTicketSchema),
  asyncHandler(ticketController.reject),
);
ticketRoutes.get('/:id/timeline', ticketsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(ticketController.timeline));
ticketRoutes.get('/:id/attachments', ticketsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(ticketController.listAttachments));
ticketRoutes.post(
  '/:id/attachments',
  ticketsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(createTicketAttachmentBodySchema),
  asyncHandler(ticketController.addAttachment),
);

export const ticketMessageRoutes = Router();
ticketMessageRoutes.use(authenticateWithSessionMiddleware);
ticketMessageRoutes.get('/', ticketsRead, validateMiddleware(listTicketMessagesQuerySchema, 'query'), asyncHandler(ticketMessageController.list));
ticketMessageRoutes.post('/', ticketsWrite, validateMiddleware(createTicketMessageSchema), asyncHandler(ticketMessageController.create));
ticketMessageRoutes.get('/:id', ticketsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(ticketMessageController.getById));

export const ticketAssignmentRoutes = Router();
ticketAssignmentRoutes.use(authenticateWithSessionMiddleware);
ticketAssignmentRoutes.get(
  '/',
  ticketsRead,
  validateMiddleware(listTicketAssignmentsQuerySchema, 'query'),
  asyncHandler(ticketAssignmentController.list),
);

export const ticketEscalationRoutes = Router();
ticketEscalationRoutes.use(authenticateWithSessionMiddleware);
ticketEscalationRoutes.get(
  '/',
  ticketsRead,
  validateMiddleware(listTicketEscalationsQuerySchema, 'query'),
  asyncHandler(ticketEscalationController.list),
);

export const ticketResolutionRoutes = Router();
ticketResolutionRoutes.use(authenticateWithSessionMiddleware);
ticketResolutionRoutes.get(
  '/',
  ticketsRead,
  validateMiddleware(listTicketResolutionsQuerySchema, 'query'),
  asyncHandler(ticketResolutionController.list),
);

export const ticketCategoryRoutes = Router();
ticketCategoryRoutes.use(authenticateWithSessionMiddleware);
ticketCategoryRoutes.get(
  '/',
  ticketsRead,
  validateMiddleware(listTicketCategoriesQuerySchema, 'query'),
  asyncHandler(ticketCategoryController.list),
);
ticketCategoryRoutes.post('/', ticketsWrite, validateMiddleware(createTicketCategorySchema), asyncHandler(ticketCategoryController.create));
ticketCategoryRoutes.get('/:id', ticketsRead, validateMiddleware(uuidParamSchema, 'params'), asyncHandler(ticketCategoryController.getById));
ticketCategoryRoutes.patch(
  '/:id',
  ticketsWrite,
  validateMiddleware(uuidParamSchema, 'params'),
  validateMiddleware(updateTicketCategorySchema),
  asyncHandler(ticketCategoryController.update),
);

export const ticketAnalyticsRoutes = Router();
ticketAnalyticsRoutes.use(authenticateWithSessionMiddleware);
ticketAnalyticsRoutes.get(
  '/',
  ticketsRead,
  validateMiddleware(ticketAnalyticsQuerySchema, 'query'),
  asyncHandler(ticketAnalyticsController.summary),
);
