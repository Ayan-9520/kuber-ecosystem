import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { financeEngineService } from '../services/finance-engine.service.js';
import type { RequestContext } from '../types/finance-engine.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const financeEngineController = {
  calculateEmi: async (req: Request, res: Response) => {
    res.json(successResponse(await financeEngineService.calculateEmi(req.body, ctx(req))));
  },

  calculateEligibility: async (req: Request, res: Response) => {
    res.json(successResponse(await financeEngineService.calculateEligibility(req.body, ctx(req))));
  },

  calculateSavings: async (req: Request, res: Response) => {
    res.json(successResponse(await financeEngineService.calculateSavings(req.body, ctx(req))));
  },

  compareLoans: async (req: Request, res: Response) => {
    res.json(successResponse(await financeEngineService.compareLoans(req.body, ctx(req))));
  },

  calculateApprovalProbability: async (req: Request, res: Response) => {
    res.json(successResponse(await financeEngineService.calculateApprovalProbability(req.body, ctx(req))));
  },

  listCalculations: async (req: Request, res: Response) => {
    const result = await financeEngineService.listCalculations(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getCalculationById: async (req: Request, res: Response) => {
    res.json(successResponse(await financeEngineService.getCalculationById(req.params.id as string)));
  },

  getProductRecommendations: async (req: Request, res: Response) => {
    res.json(successResponse(await financeEngineService.ai.getProductRecommendations(req.body)));
  },

  getLenderRecommendations: async (req: Request, res: Response) => {
    const { productId, loanAmount, interestRate, tenureMonths } = req.body;
    res.json(
      successResponse(
        await financeEngineService.ai.getLenderRecommendations(productId, loanAmount, interestRate, tenureMonths),
      ),
    );
  },
};
