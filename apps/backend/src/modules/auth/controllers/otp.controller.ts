import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { toAuthTokensResponse } from '../dtos/auth-response.dto.js';
import { otpService } from '../services/otp.service.js';
import type { RequestContext } from '../types/auth.types.js';

function buildContext(req: Request): RequestContext {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const otpController = {
  sendOtp: async (req: Request, res: Response): Promise<void> => {
    const result = await otpService.sendOtp(req.body, buildContext(req));
    res.json(successResponse(result));
  },

  verifyOtp: async (req: Request, res: Response): Promise<void> => {
    const result = await otpService.verifyOtpAndLogin(req.body, buildContext(req));
    res.json(successResponse(toAuthTokensResponse(result)));
  },

  changeMobileSendOtp: async (req: Request, res: Response): Promise<void> => {
    const result = await otpService.sendChangeMobileOtp(
      req.user!.id,
      req.body.newPhone,
      buildContext(req),
    );
    res.json(successResponse(result));
  },

  changeMobileVerify: async (req: Request, res: Response): Promise<void> => {
    const result = await otpService.verifyChangeMobile(
      req.user!.id,
      req.body.newPhone,
      req.body.otp,
      buildContext(req),
    );
    res.json(successResponse(result));
  },
};
