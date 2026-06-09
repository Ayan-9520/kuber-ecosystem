import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { userRoleService, userService } from '../services/user.service.js';
import type { RequestContext } from '../types/users.types.js';

function buildContext(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const userController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const result = await userService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const result = await userService.getById(req.user!, req.params.id as string);
    res.json(successResponse(result));
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const result = await userService.create(req.body, buildContext(req));
    res.status(201).json(successResponse(result));
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const result = await userService.update(req.user!, req.params.id as string, req.body, buildContext(req));
    res.json(successResponse(result));
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    await userService.remove(req.user!, req.params.id as string, buildContext(req));
    res.status(204).send();
  },

  listUserRoles: async (req: Request, res: Response): Promise<void> => {
    const result = await userService.listUserRoles(req.user!, req.params.id as string);
    res.json(successResponse(result));
  },
};

export const userRoleController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const result = await userRoleService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  assign: async (req: Request, res: Response): Promise<void> => {
    const result = await userRoleService.assign(req.user!, req.body, buildContext(req));
    res.status(201).json(successResponse(result));
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    await userRoleService.remove(req.user!, req.params.id as string, buildContext(req));
    res.status(204).send();
  },
};
