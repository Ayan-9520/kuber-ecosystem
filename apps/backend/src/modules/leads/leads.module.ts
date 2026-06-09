import { Router } from 'express';

import {
  leadActivityRoutes,
  leadAnalyticsRoutes,
  leadAssignmentRoutes,
  leadFollowUpRoutes,
  leadNoteRoutes,
  leadRoutes,
  leadScoreRoutes,
  leadSourceRoutes,
  leadTimelineRoutes,
} from './routes/lead.routes.js';

export function createLeadsModule(): Router {
  const router = Router();
  router.use(leadRoutes);
  return router;
}

export function createLeadSourcesModule(): Router {
  const router = Router();
  router.use(leadSourceRoutes);
  return router;
}

export function createLeadScoresModule(): Router {
  const router = Router();
  router.use(leadScoreRoutes);
  return router;
}

export function createLeadAssignmentsModule(): Router {
  const router = Router();
  router.use(leadAssignmentRoutes);
  return router;
}

export function createLeadActivitiesModule(): Router {
  const router = Router();
  router.use(leadActivityRoutes);
  return router;
}

export function createLeadNotesModule(): Router {
  const router = Router();
  router.use(leadNoteRoutes);
  return router;
}

export function createLeadFollowUpsModule(): Router {
  const router = Router();
  router.use(leadFollowUpRoutes);
  return router;
}

export function createLeadTimelineModule(): Router {
  const router = Router();
  router.use(leadTimelineRoutes);
  return router;
}

export function createLeadAnalyticsModule(): Router {
  const router = Router();
  router.use(leadAnalyticsRoutes);
  return router;
}
