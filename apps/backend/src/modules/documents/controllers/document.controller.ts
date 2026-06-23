import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { documentDeficiencyService } from '../services/document-deficiency.service.js';
import { documentRequestService } from '../services/document-request.service.js';
import { documentTypeService } from '../services/document-type.service.js';
import { documentVersionService } from '../services/document-version.service.js';
import { documentService } from '../services/document.service.js';
import { ocrResultService } from '../services/ocr-result.service.js';
import { verificationResultService } from '../services/verification-result.service.js';
import type { RequestContext } from '../types/documents.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const documentController = {
  list: async (req: Request, res: Response) => {
    const result = await documentService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await documentService.getById(req.user!, req.params.id as string)));
  },
  upload: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await documentService.upload(req.body, ctx(req))));
  },
  presignUpload: async (req: Request, res: Response) => {
    res.json(successResponse(await documentService.presignUpload(req.body, ctx(req))));
  },
  confirmUpload: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await documentService.confirmUpload(req.body, ctx(req))));
  },
  replace: async (req: Request, res: Response) => {
    res.json(successResponse(await documentService.replace(req.user!, req.params.id as string, req.body, ctx(req))));
  },
  remove: async (req: Request, res: Response) => {
    res.json(successResponse(await documentService.remove(req.user!, req.params.id as string, ctx(req))));
  },
  downloadUrl: async (req: Request, res: Response) => {
    res.json(successResponse(await documentService.getDownloadUrl(req.user!, req.params.id as string, ctx(req))));
  },
  localDownload: async (req: Request, res: Response) => {
    const key = String(req.query.key ?? '');
    if (!key) {
      res.status(400).json({ success: false, error: { code: 'MISSING_KEY', message: 'Storage key is required' } });
      return;
    }
    const file = await documentService.streamLocalDownload(req.user!, key);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
    res.send(file.buffer);
  },
  verify: async (req: Request, res: Response) => {
    res.json(successResponse(await documentService.verify(req.user!, req.params.id as string, req.body, ctx(req))));
  },
  approve: async (req: Request, res: Response) => {
    res.json(successResponse(await documentService.approve(req.user!, req.params.id as string, ctx(req))));
  },
  reject: async (req: Request, res: Response) => {
    res.json(successResponse(await documentService.reject(req.user!, req.params.id as string, req.body.reason, ctx(req))));
  },
};

export const documentTypeController = {
  list: async (req: Request, res: Response) => {
    const result = await documentTypeService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await documentTypeService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await documentTypeService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await documentTypeService.update(req.params.id as string, req.body, ctx(req))));
  },
  deactivate: async (req: Request, res: Response) => {
    res.json(successResponse(await documentTypeService.deactivate(req.params.id as string, ctx(req))));
  },
};

export const documentRequestController = {
  list: async (req: Request, res: Response) => {
    const result = await documentRequestService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await documentRequestService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await documentRequestService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await documentRequestService.update(req.params.id as string, req.body, ctx(req))));
  },
};

export const documentVersionController = {
  list: async (req: Request, res: Response) => {
    const result = await documentVersionService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await documentVersionService.getById(req.params.id as string)));
  },
};

export const ocrResultController = {
  list: async (req: Request, res: Response) => {
    const result = await ocrResultService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await ocrResultService.getById(req.params.id as string)));
  },
  run: async (req: Request, res: Response) => {
    res.json(successResponse(await ocrResultService.run(req.body, ctx(req))));
  },
};

export const verificationResultController = {
  list: async (req: Request, res: Response) => {
    const result = await verificationResultService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await verificationResultService.getById(req.params.id as string)));
  },
  autoVerify: async (req: Request, res: Response) => {
    res.json(successResponse(await verificationResultService.autoVerify(req.body.documentId, ctx(req))));
  },
};

export const documentDeficiencyController = {
  list: async (req: Request, res: Response) => {
    const result = await documentDeficiencyService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await documentDeficiencyService.getById(req.params.id as string)));
  },
  create: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await documentDeficiencyService.create(req.body, ctx(req))));
  },
  update: async (req: Request, res: Response) => {
    res.json(successResponse(await documentDeficiencyService.update(req.params.id as string, req.body, ctx(req))));
  },
  scan: async (req: Request, res: Response) => {
    res.json(successResponse(await documentDeficiencyService.scan(req.body, ctx(req))));
  },
};
