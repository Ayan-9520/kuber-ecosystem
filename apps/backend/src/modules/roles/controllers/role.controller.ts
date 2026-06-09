import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { rolePermissionService, roleService } from '../services/role.service.js';
import type { RequestContext } from '../types/roles.types.js';

function buildContext(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const roleController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const result = await roleService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const result = await roleService.getById(req.params.id as string);
    res.json(successResponse(result));
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const result = await roleService.create(req.user!, req.body, buildContext(req));
    res.status(201).json(successResponse(result));
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const result = await roleService.update(req.user!, req.params.id as string, req.body, buildContext(req));
    res.json(successResponse(result));
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    await roleService.remove(req.user!, req.params.id as string, buildContext(req));
    res.status(204).send();
  },
};

export const rolePermissionController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const result = await rolePermissionService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  assign: async (req: Request, res: Response): Promise<void> => {
    const result = await rolePermissionService.assign(req.user!, req.body, buildContext(req));
    res.status(201).json(successResponse(result));
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    await rolePermissionService.remove(req.user!, req.body, buildContext(req));
    res.status(204).send();
  },
};
