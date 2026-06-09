import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { ticketAnalyticsService } from '../services/ticket-analytics.service.js';
import { ticketAssignmentService } from '../services/ticket-assignment.service.js';
import { ticketAttachmentService } from '../services/ticket-attachment.service.js';
import { ticketCategoryService } from '../services/ticket-category.service.js';
import { ticketEscalationService } from '../services/ticket-escalation.service.js';
import { ticketMessageService } from '../services/ticket-message.service.js';
import { ticketResolutionService } from '../services/ticket-resolution.service.js';
import { ticketService } from '../services/ticket.service.js';
import type { RequestContext } from '../types/support.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const ticketController = {
  list: async (req: Request, res: Response) => {
    const result = await ticketService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await ticketService.getById(req.params.id as string)));
  },

  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await ticketService.create(req.body, ctx(req))));
  },

  update: async (req: Request, res: Response) => {
    res.json(successResponse(await ticketService.update(req.params.id as string, req.body, ctx(req))));
  },

  assign: async (req: Request, res: Response) => {
    res.json(successResponse(await ticketService.assign(req.params.id as string, req.body, ctx(req))));
  },

  escalate: async (req: Request, res: Response) => {
    res.json(successResponse(await ticketService.escalate(req.params.id as string, req.body, ctx(req))));
  },

  resolve: async (req: Request, res: Response) => {
    res.json(successResponse(await ticketService.resolve(req.params.id as string, req.body, ctx(req))));
  },

  close: async (req: Request, res: Response) => {
    res.json(successResponse(await ticketService.close(req.params.id as string, req.body, ctx(req))));
  },

  reject: async (req: Request, res: Response) => {
    res.json(successResponse(await ticketService.reject(req.params.id as string, req.body, ctx(req))));
  },

  remove: async (req: Request, res: Response) => {
    res.json(successResponse(await ticketService.remove(req.params.id as string, ctx(req))));
  },

  timeline: async (req: Request, res: Response) => {
    const result = await ticketService.getTimeline({
      ticketId: req.params.id as string,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 50),
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') ?? 'asc',
    });
    res.json(paginatedResponse(result.items, result.meta));
  },

  listAttachments: async (req: Request, res: Response) => {
    res.json(successResponse(await ticketAttachmentService.listByTicket(req.params.id as string)));
  },

  addAttachment: async (req: Request, res: Response) => {
    res.status(201).json(
      successResponse(
        await ticketAttachmentService.create({ ...req.body, ticketId: req.params.id as string }, ctx(req)),
      ),
    );
  },
};

export const ticketMessageController = {
  list: async (req: Request, res: Response) => {
    const result = await ticketMessageService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await ticketMessageService.getById(req.params.id as string)));
  },

  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await ticketMessageService.create(req.body, ctx(req))));
  },
};

export const ticketAssignmentController = {
  list: async (req: Request, res: Response) => {
    const result = await ticketAssignmentService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
};

export const ticketEscalationController = {
  list: async (req: Request, res: Response) => {
    const result = await ticketEscalationService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
};

export const ticketResolutionController = {
  list: async (req: Request, res: Response) => {
    const result = await ticketResolutionService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
};

export const ticketCategoryController = {
  list: async (req: Request, res: Response) => {
    const result = await ticketCategoryService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await ticketCategoryService.getById(req.params.id as string)));
  },

  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await ticketCategoryService.create(req.body)));
  },

  update: async (req: Request, res: Response) => {
    res.json(successResponse(await ticketCategoryService.update(req.params.id as string, req.body)));
  },
};

export const ticketAnalyticsController = {
  summary: async (req: Request, res: Response) => {
    res.json(successResponse(await ticketAnalyticsService.getSummary(req.user!, req.query as never)));
  },
};
