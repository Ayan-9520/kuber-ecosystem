import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { auditLogService } from '../services/audit-log.service.js';

export const auditLogController = {
  list: async (req: Request, res: Response) => {
    const result = await auditLogService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await auditLogService.getById(req.params.id as string)));
  },

  export: async (req: Request, res: Response) => {
    const result = await auditLogService.export(req.query as never);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.data);
  },
};
