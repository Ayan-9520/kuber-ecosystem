import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { employeeService } from '../services/employee.service.js';
import type { RequestContext } from '../types/employees.types.js';

function ctx(req: Request): RequestContext {
  return { actorId: req.user!.id };
}

export const employeeController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await employeeService.health()));
  },

  list: async (req: Request, res: Response): Promise<void> => {
    const result = await employeeService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await employeeService.getById(req.params.id as string)));
  },

  create: async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(successResponse(await employeeService.create(req.body, ctx(req))));
  },

  update: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await employeeService.update(req.params.id as string, req.body, ctx(req))));
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    res.json(successResponse(await employeeService.remove(req.params.id as string, ctx(req))));
  },
};
