import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { referralTypeService } from '../services/referral-type.service.js';
import { referralService } from '../services/referral.service.js';
import type { RequestContext } from '../types/referrals.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const referralController = {
  list: async (req: Request, res: Response) => {
    const result = await referralService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await referralService.getById(req.params.id as string)));
  },

  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await referralService.create(req.body, ctx(req))));
  },

  update: async (req: Request, res: Response) => {
    res.json(successResponse(await referralService.update(req.params.id as string, req.body, ctx(req))));
  },

  convert: async (req: Request, res: Response) => {
    res.json(successResponse(await referralService.convert(req.params.id as string, req.body, ctx(req))));
  },

  approveReward: async (req: Request, res: Response) => {
    res.json(successResponse(await referralService.approveReward(req.params.id as string, ctx(req))));
  },

  markRewardPaid: async (req: Request, res: Response) => {
    res.json(successResponse(await referralService.markRewardPaid(req.params.id as string, ctx(req))));
  },

  reject: async (req: Request, res: Response) => {
    res.json(successResponse(await referralService.reject(req.params.id as string, req.body.reason, ctx(req))));
  },

  cancel: async (req: Request, res: Response) => {
    res.json(successResponse(await referralService.cancel(req.params.id as string, ctx(req))));
  },

  remove: async (req: Request, res: Response) => {
    res.json(successResponse(await referralService.remove(req.params.id as string, ctx(req))));
  },

  validateCode: async (req: Request, res: Response) => {
    res.json(successResponse(await referralService.validateCode(req.body.referralCode)));
  },
};

export const referralTypeController = {
  list: async (req: Request, res: Response) => {
    const result = await referralTypeService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await referralTypeService.getById(req.params.id as string)));
  },

  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await referralTypeService.create(req.body, ctx(req))));
  },

  update: async (req: Request, res: Response) => {
    res.json(successResponse(await referralTypeService.update(req.params.id as string, req.body, ctx(req))));
  },

  deactivate: async (req: Request, res: Response) => {
    res.json(successResponse(await referralTypeService.deactivate(req.params.id as string, ctx(req))));
  },
};
