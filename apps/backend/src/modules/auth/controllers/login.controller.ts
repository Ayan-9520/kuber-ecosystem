import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { toAuthTokensResponse } from '../dtos/auth-response.dto.js';
import { loginService } from '../services/login.service.js';
import type { RequestContext } from '../types/auth.types.js';

function buildContext(req: Request): RequestContext {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const loginController = {
  login: async (req: Request, res: Response): Promise<void> => {
    const result = await loginService.login(req.body, buildContext(req));
    res.json(successResponse(toAuthTokensResponse(result)));
  },
};
