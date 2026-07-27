import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { bankReconciliationService } from '../services/bank-reconciliation.service.js';
import type { RequestContext } from '../types/bank-reconciliation.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    actorName: req.user!.email ?? req.user!.phone ?? req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const bankReconciliationController = {
  summary: async (req: Request, res: Response) => {
    res.json(successResponse(bankReconciliationService.summary(req.user!)));
  },

  listStatements: async (req: Request, res: Response) => {
    const result = bankReconciliationService.listStatements(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getStatement: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        bankReconciliationService.getStatement(req.user!, req.params.id as string),
      ),
    );
  },

  createStatement: async (req: Request, res: Response) => {
    res
      .status(201)
      .json(
        successResponse(
          bankReconciliationService.createStatement(req.user!, req.body, ctx(req)),
        ),
      );
  },

  reconcileStatement: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        bankReconciliationService.reconcileStatement(
          req.user!,
          req.params.id as string,
          ctx(req),
        ),
      ),
    );
  },

  listMatches: async (req: Request, res: Response) => {
    const result = bankReconciliationService.listMatches(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  reviewMatch: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        bankReconciliationService.reviewMatch(
          req.user!,
          req.params.id as string,
          req.body,
          ctx(req),
        ),
      ),
    );
  },

  createDispute: async (req: Request, res: Response) => {
    res
      .status(201)
      .json(
        successResponse(
          bankReconciliationService.createDispute(
            req.user!,
            req.params.id as string,
            req.body,
            ctx(req),
          ),
        ),
      );
  },

  listDisputes: async (req: Request, res: Response) => {
    const result = bankReconciliationService.listDisputes(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  updateDispute: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        bankReconciliationService.updateDispute(
          req.user!,
          req.params.id as string,
          req.body,
          ctx(req),
        ),
      ),
    );
  },

  listAudit: async (req: Request, res: Response) => {
    const result = bankReconciliationService.listAudit(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
};
