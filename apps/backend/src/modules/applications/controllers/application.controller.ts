import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { applicationTimelineService } from '../services/application-timeline.service.js';
import { applicationService } from '../services/application.service.js';
import { bankLoginService } from '../services/bank-login.service.js';
import { creditReviewService } from '../services/credit-review.service.js';
import { disbursementService } from '../services/disbursement.service.js';
import { eligibilityResultService } from '../services/eligibility-result.service.js';
import { losAnalyticsService } from '../services/los-analytics.service.js';
import { sanctionService } from '../services/sanction.service.js';
import type { RequestContext } from '../types/applications.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const applicationController = {
  list: async (req: Request, res: Response) => {
    const result = await applicationService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await applicationService.getById(req.user!, req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await applicationService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await applicationService.update(req.user!, req.params.id as string, req.body, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    await applicationService.remove(req.user!, req.params.id as string, ctx(req));
    res.status(204).send();
  },
  submit: async (req: Request, res: Response) => {
    res.json(successResponse(await applicationService.submit(req.user!, req.params.id as string, req.body, ctx(req))));
  },
  assign: async (req: Request, res: Response) => {
    res.json(successResponse(await applicationService.assign(req.user!, req.params.id as string, req.body, ctx(req))));
  },
  analytics: async (req: Request, res: Response) => {
    res.json(successResponse(await losAnalyticsService.getSummary(req.query as never)));
  },
};

export const applicationStatusController = {
  list: async (req: Request, res: Response) => {
    const result = await applicationTimelineService.listStatusHistory(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
};

export const applicationTimelineController = {
  get: async (req: Request, res: Response) => {
    const result = await applicationTimelineService.getTimeline(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
};

export const eligibilityResultController = {
  list: async (req: Request, res: Response) => {
    const result = await eligibilityResultService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await eligibilityResultService.getById(req.params.id as string)));
  },
  evaluate: async (req: Request, res: Response) => {
    res.json(successResponse(await eligibilityResultService.evaluate(req.body, ctx(req))));
  },
};

export const bankLoginController = {
  list: async (req: Request, res: Response) => {
    const result = await bankLoginService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await bankLoginService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await bankLoginService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await bankLoginService.update(req.params.id as string, req.body, ctx(req))));
  },
};

export const creditReviewController = {
  list: async (req: Request, res: Response) => {
    const result = await creditReviewService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await creditReviewService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await creditReviewService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await creditReviewService.update(req.params.id as string, req.body, ctx(req))));
  },
};

export const sanctionController = {
  list: async (req: Request, res: Response) => {
    const result = await sanctionService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await sanctionService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await sanctionService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await sanctionService.update(req.params.id as string, req.body, ctx(req))));
  },
};

export const disbursementController = {
  list: async (req: Request, res: Response) => {
    const result = await disbursementService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await disbursementService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await disbursementService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await disbursementService.update(req.params.id as string, req.body, ctx(req))));
  },
};
