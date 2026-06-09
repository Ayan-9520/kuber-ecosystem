import { Router } from 'express';

import {
  ticketAnalyticsRoutes,
  ticketAssignmentRoutes,
  ticketCategoryRoutes,
  ticketEscalationRoutes,
  ticketMessageRoutes,
  ticketResolutionRoutes,
  ticketRoutes,
} from './routes/ticket.routes.js';

export function createTicketsModule(): Router {
  const router = Router();
  router.use(ticketRoutes);
  return router;
}

export function createTicketMessagesModule(): Router {
  const router = Router();
  router.use(ticketMessageRoutes);
  return router;
}

export function createTicketAssignmentsModule(): Router {
  const router = Router();
  router.use(ticketAssignmentRoutes);
  return router;
}

export function createTicketEscalationsModule(): Router {
  const router = Router();
  router.use(ticketEscalationRoutes);
  return router;
}

export function createTicketResolutionsModule(): Router {
  const router = Router();
  router.use(ticketResolutionRoutes);
  return router;
}

export function createTicketCategoriesModule(): Router {
  const router = Router();
  router.use(ticketCategoryRoutes);
  return router;
}

export function createTicketAnalyticsModule(): Router {
  const router = Router();
  router.use(ticketAnalyticsRoutes);
  return router;
}

export { ticketService } from './services/ticket.service.js';
