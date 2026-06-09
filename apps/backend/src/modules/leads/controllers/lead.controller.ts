import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { leadActivityService } from '../services/lead-activity.service.js';
import { leadAnalyticsService } from '../services/lead-analytics.service.js';
import { leadAssignmentService } from '../services/lead-assignment.service.js';
import { leadFollowUpService } from '../services/lead-followup.service.js';
import { leadNoteService } from '../services/lead-note.service.js';
import { leadScoreService } from '../services/lead-score.service.js';
import { leadSourceService } from '../services/lead-source.service.js';
import { leadTimelineService } from '../services/lead-timeline.service.js';
import { leadService } from '../services/lead.service.js';
import type { RequestContext } from '../types/leads.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const leadController = {
  list: async (req: Request, res: Response) => {
    const result = await leadService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await leadService.getById(req.user!, req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await leadService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await leadService.update(req.user!, req.params.id as string, req.body, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    await leadService.remove(req.user!, req.params.id as string, ctx(req));
    res.status(204).send();
  },
  export: async (req: Request, res: Response) => {
    const result = await leadService.export(req.user!, req.query as never);
    if (result.format === 'csv') {
      res.setHeader('Content-Type', result.contentType!);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
      return;
    }
    res.json(successResponse(result));
  },
  assign: async (req: Request, res: Response) => {
    res.json(successResponse(await leadAssignmentService.assign(req.params.id as string, req.body, ctx(req))));
  },
  reassign: async (req: Request, res: Response) => {
    res.json(successResponse(await leadAssignmentService.reassign(req.params.id as string, req.body, ctx(req))));
  },
  autoAssign: async (req: Request, res: Response) => {
    res.json(successResponse(await leadAssignmentService.autoAssign(req.params.id as string, req.body, ctx(req))));
  },
  score: async (req: Request, res: Response) => {
    res.json(successResponse(await leadScoreService.scoreLead(req.body, ctx(req))));
  },
  scheduleFollowUp: async (req: Request, res: Response) => {
    res.json(successResponse(await leadService.scheduleFollowUp(req.params.id as string, ctx(req))));
  },
};

export const leadSourceController = {
  list: async (req: Request, res: Response) => {
    const result = await leadSourceService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await leadSourceService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await leadSourceService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await leadSourceService.update(req.params.id as string, req.body, ctx(req))));
  },
  deactivate: async (req: Request, res: Response) => {
    res.json(successResponse(await leadSourceService.deactivate(req.params.id as string, ctx(req))));
  },
};

export const leadScoreController = {
  list: async (req: Request, res: Response) => {
    const result = await leadScoreService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await leadScoreService.getById(req.params.id as string)));
  },
  score: async (req: Request, res: Response) => {
    res.json(successResponse(await leadScoreService.scoreLead(req.body, ctx(req))));
  },
};

export const leadAssignmentController = {
  list: async (req: Request, res: Response) => {
    const result = await leadAssignmentService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await leadAssignmentService.getById(req.params.id as string)));
  },
};

export const leadActivityController = {
  list: async (req: Request, res: Response) => {
    const result = await leadActivityService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await leadActivityService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await leadActivityService.create(req.body, ctx(req))));
  },
};

export const leadNoteController = {
  list: async (req: Request, res: Response) => {
    const result = await leadNoteService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await leadNoteService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await leadNoteService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await leadNoteService.update(req.params.id as string, req.body, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    await leadNoteService.remove(req.params.id as string, ctx(req));
    res.status(204).send();
  },
};

export const leadFollowUpController = {
  list: async (req: Request, res: Response) => {
    const result = await leadFollowUpService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await leadFollowUpService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await leadFollowUpService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await leadFollowUpService.update(req.params.id as string, req.body, ctx(req))));
  },
  processReminders: async (_req: Request, res: Response) => {
    res.json(successResponse(await leadFollowUpService.processReminders()));
  },
};

export const leadTimelineController = {
  get: async (req: Request, res: Response) => {
    const result = await leadTimelineService.getTimeline(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
};

export const leadAnalyticsController = {
  summary: async (req: Request, res: Response) => {
    res.json(successResponse(await leadAnalyticsService.getSummary(req.query as never)));
  },
};
