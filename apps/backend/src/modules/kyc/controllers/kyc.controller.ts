import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import {
  aadhaarVerificationService,
  kycProfileService,
  panVerificationService,
} from '../services/kyc.service.js';
import type { RequestContext } from '../types/kyc.types.js';

function buildContext(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const kycProfileController = {
  get: async (req: Request, res: Response): Promise<void> => {
    const customerId = req.query.customerId as string | undefined;
    const result = await kycProfileService.get(req.user!, customerId);
    res.json(successResponse(result));
  },

  upsert: async (req: Request, res: Response): Promise<void> => {
    const result = await kycProfileService.upsert(req.user!, req.body, buildContext(req));
    res.json(successResponse(result));
  },

  listAudit: async (req: Request, res: Response): Promise<void> => {
    const { customerId, page, limit } = req.query as never;
    const result = await kycProfileService.listAudit(req.user!, customerId, page, limit);
    res.json(paginatedResponse(result.items, result.meta));
  },
};

export const panController = {
  submit: async (req: Request, res: Response): Promise<void> => {
    const result = await panVerificationService.submit(req.user!, req.body, buildContext(req));
    res.status(201).json(successResponse(result));
  },

  list: async (req: Request, res: Response): Promise<void> => {
    const customerId = req.query.customerId as string | undefined;
    const result = await panVerificationService.list(req.user!, customerId);
    res.json(successResponse(result));
  },
};

export const aadhaarController = {
  sendOtp: async (req: Request, res: Response): Promise<void> => {
    const { customerId, aadhaar } = req.body;
    const result = await aadhaarVerificationService.sendOtp(
      req.user!,
      customerId,
      aadhaar,
      buildContext(req),
    );
    res.json(successResponse(result));
  },

  verify: async (req: Request, res: Response): Promise<void> => {
    const { customerId, aadhaar, otp } = req.body;
    const result = await aadhaarVerificationService.verify(
      req.user!,
      customerId,
      aadhaar,
      otp,
      buildContext(req),
    );
    res.json(successResponse(result));
  },

  list: async (req: Request, res: Response): Promise<void> => {
    const customerId = req.query.customerId as string | undefined;
    const result = await aadhaarVerificationService.list(req.user!, customerId);
    res.json(successResponse(result));
  },
};
