import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { loanFulfillmentService } from '../services/loan-fulfillment.service.js';
import type { RequestContext } from '../types/loan-fulfillment.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    actorName: req.user!.email ?? req.user!.phone ?? req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const loanFulfillmentController = {
  dashboard: async (req: Request, res: Response) => {
    res.json(successResponse(loanFulfillmentService.dashboard(req.user!)));
  },

  listCases: async (req: Request, res: Response) => {
    const result = loanFulfillmentService.listCases(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getCase: async (req: Request, res: Response) => {
    res.json(successResponse(loanFulfillmentService.getCase(req.user!, req.params.id as string)));
  },

  createCase: async (req: Request, res: Response) => {
    res
      .status(201)
      .json(successResponse(loanFulfillmentService.createCase(req.user!, req.body, ctx(req))));
  },

  updateCase: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        loanFulfillmentService.updateCase(req.user!, req.params.id as string, req.body, ctx(req)),
      ),
    );
  },

  advanceStage: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        loanFulfillmentService.advanceStage(req.user!, req.params.id as string, req.body, ctx(req)),
      ),
    );
  },

  setStakeholders: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        loanFulfillmentService.setStakeholders(
          req.user!,
          req.params.id as string,
          req.body.stakeholders,
          ctx(req),
        ),
      ),
    );
  },

  addDocument: async (req: Request, res: Response) => {
    res
      .status(201)
      .json(
        successResponse(
          loanFulfillmentService.addDocument(req.user!, req.params.id as string, req.body, ctx(req)),
        ),
      );
  },

  addTask: async (req: Request, res: Response) => {
    res
      .status(201)
      .json(
        successResponse(
          loanFulfillmentService.addTask(req.user!, req.params.id as string, req.body, ctx(req)),
        ),
      );
  },

  updateTask: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        loanFulfillmentService.updateTask(
          req.user!,
          req.params.id as string,
          req.params.taskId as string,
          req.body,
          ctx(req),
        ),
      ),
    );
  },

  verifyDocument: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        loanFulfillmentService.verifyDocument(
          req.user!,
          req.params.id as string,
          req.params.documentId as string,
          ctx(req),
        ),
      ),
    );
  },

  decideApproval: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        loanFulfillmentService.decideApproval(
          req.user!,
          req.params.id as string,
          req.params.approvalId as string,
          req.body,
          ctx(req),
        ),
      ),
    );
  },

  listRevenueRules: async (req: Request, res: Response) => {
    const result = loanFulfillmentService.listRevenueRules(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getRevenueRule: async (req: Request, res: Response) => {
    res.json(
      successResponse(loanFulfillmentService.getRevenueRule(req.user!, req.params.id as string)),
    );
  },

  createRevenueRule: async (req: Request, res: Response) => {
    res
      .status(201)
      .json(
        successResponse(loanFulfillmentService.createRevenueRule(req.user!, req.body, ctx(req))),
      );
  },

  updateRevenueRule: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        loanFulfillmentService.updateRevenueRule(
          req.user!,
          req.params.id as string,
          req.body,
          ctx(req),
        ),
      ),
    );
  },
};
