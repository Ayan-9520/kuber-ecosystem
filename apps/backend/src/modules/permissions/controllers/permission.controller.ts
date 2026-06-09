import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { permissionService } from '../services/permission.service.js';
import type { RequestContext } from '../types/permissions.types.js';

function buildContext(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const permissionController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const result = await permissionService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const result = await permissionService.getById(req.params.id as string);
    res.json(successResponse(result));
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const result = await permissionService.create(req.user!, req.body, buildContext(req));
    res.status(201).json(successResponse(result));
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const result = await permissionService.update(req.user!, req.params.id as string, req.body, buildContext(req));
    res.json(successResponse(result));
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    await permissionService.remove(req.user!, req.params.id as string, buildContext(req));
    res.status(204).send();
  },
};
