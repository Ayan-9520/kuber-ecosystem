import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { commissionAdjustmentService } from '../services/commission-adjustment.service.js';
import { commissionAnalyticsService } from '../services/commission-analytics.service.js';
import { commissionApprovalService } from '../services/commission-approval.service.js';
import { commissionLedgerService } from '../services/commission-ledger.service.js';
import { commissionPaymentService } from '../services/commission-payment.service.js';
import { commissionRecoveryService } from '../services/commission-recovery.service.js';
import { commissionRuleService } from '../services/commission-rule.service.js';
import type { RequestContext } from '../types/commissions.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const commissionRuleController = {
  list: async (req: Request, res: Response) => {
    const result = await commissionRuleService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionRuleService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await commissionRuleService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionRuleService.update(req.params.id as string, req.body, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionRuleService.remove(req.params.id as string, ctx(req))));
  },
};

export const commissionLedgerController = {
  list: async (req: Request, res: Response) => {
    const result = await commissionLedgerService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  export: async (req: Request, res: Response) => {
    const csv = await commissionLedgerService.exportCsv(req.user!, req.query as never);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=commission-ledger.csv');
    res.send(csv);
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionLedgerService.getById(req.params.id as string)));
  },
  calculate: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await commissionLedgerService.calculate(req.body, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionLedgerService.remove(req.params.id as string, ctx(req))));
  },
};

export const commissionApprovalController = {
  list: async (req: Request, res: Response) => {
    const result = await commissionApprovalService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionApprovalService.getById(req.params.id as string)));
  },
  request: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await commissionApprovalService.request(req.body, ctx(req))));
  },
  approve: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        await commissionApprovalService.approve(req.params.id as string, req.body.approvedAmount, req.body.notes, ctx(req)),
      ),
    );
  },
  reject: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionApprovalService.reject(req.params.id as string, req.body.rejectionReason, ctx(req))));
  },
};

export const commissionPaymentController = {
  list: async (req: Request, res: Response) => {
    const result = await commissionPaymentService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionPaymentService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await commissionPaymentService.createPayout(req.body, ctx(req))));
  },
  approve: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionPaymentService.approve(req.params.id as string, ctx(req))));
  },
  release: async (req: Request, res: Response) => {
    res.json(
      successResponse(
        await commissionPaymentService.release(req.params.id as string, req.body.paymentReference, req.body.notes, ctx(req)),
      ),
    );
  },
  report: async (req: Request, res: Response) => {
    const { partnerId, fromDate, toDate } = req.query as { partnerId: string; fromDate?: string; toDate?: string };
    res.json(
      successResponse(
        await commissionPaymentService.getReport(
          partnerId,
          fromDate ? new Date(fromDate) : undefined,
          toDate ? new Date(toDate) : undefined,
        ),
      ),
    );
  },
  remove: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionPaymentService.remove(req.params.id as string, ctx(req))));
  },
};

export const commissionAdjustmentController = {
  list: async (req: Request, res: Response) => {
    const result = await commissionAdjustmentService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionAdjustmentService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await commissionAdjustmentService.create(req.body, ctx(req))));
  },
  approve: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionAdjustmentService.approve(req.params.id as string, ctx(req))));
  },
  reject: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionAdjustmentService.reject(req.params.id as string, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionAdjustmentService.remove(req.params.id as string, ctx(req))));
  },
};

export const commissionRecoveryController = {
  list: async (req: Request, res: Response) => {
    const result = await commissionRecoveryService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionRecoveryService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await commissionRecoveryService.create(req.body, ctx(req))));
  },
  approve: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionRecoveryService.approve(req.params.id as string, ctx(req))));
  },
  reject: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionRecoveryService.reject(req.params.id as string, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionRecoveryService.remove(req.params.id as string, ctx(req))));
  },
};

export const commissionAnalyticsController = {
  summary: async (req: Request, res: Response) => {
    res.json(successResponse(await commissionAnalyticsService.getSummary(req.query as never)));
  },
};
