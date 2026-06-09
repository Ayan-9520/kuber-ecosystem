import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { toAuthTokensResponse } from '../dtos/auth-response.dto.js';
import { authService } from '../services/auth.service.js';
import type { RequestContext } from '../types/auth.types.js';

function buildContext(req: Request): RequestContext {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const sessionController = {
  refresh: async (req: Request, res: Response): Promise<void> => {
    const result = await authService.refresh(req.body.refreshToken, buildContext(req));
    res.json(successResponse(toAuthTokensResponse(result)));
  },

  logout: async (req: Request, res: Response): Promise<void> => {
    await authService.logout(
      req.body.refreshToken,
      req.user?.sessionId,
      buildContext(req),
    );
    res.status(204).send();
  },

  logoutAll: async (req: Request, res: Response): Promise<void> => {
    await authService.logoutAll(req.user!.id, buildContext(req));
    res.status(204).send();
  },

  me: async (req: Request, res: Response): Promise<void> => {
    const result = await authService.getMe(req.user!.id);
    res.json(successResponse(result));
  },
};
