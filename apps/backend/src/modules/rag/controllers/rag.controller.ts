import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { ingestionService } from '../services/ingestion.service.js';
import { ragAnalyticsService } from '../services/rag-analytics.service.js';
import { ragContextService } from '../services/rag-context.service.js';
import { ragQueryService } from '../services/rag-query.service.js';
import { retrievalService } from '../services/retrieval.service.js';
import type { RequestContext } from '../types/rag.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const ragController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'rag', engine: 'KuberOne RAG Pipeline', status: 'ok', version: 'rag-v1.0' }));
  },

  ingest: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await ingestionService.ingest(req.body, req.user!.id, ctx(req))));
  },

  ingestArticle: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await ingestionService.ingestArticle(req.body, req.user!.id, ctx(req))));
  },

  ingestAllPublished: async (req: Request, res: Response) => {
    res.json(successResponse(await ingestionService.ingestAllPublished(req.body, req.user!.id, ctx(req))));
  },

  listDocuments: async (req: Request, res: Response) => {
    res.json(successResponse(await ingestionService.list(req.query as never)));
  },

  getDocument: async (req: Request, res: Response) => {
    res.json(successResponse(await ingestionService.getDocument(req.params.id as string)));
  },

  search: async (req: Request, res: Response) => {
    res.json(successResponse(await retrievalService.search(req.query as never, ctx(req))));
  },

  query: async (req: Request, res: Response) => {
    res.json(successResponse(await ragQueryService.query(req.body, ctx(req))));
  },

  context: async (req: Request, res: Response) => {
    res.json(successResponse(await ragContextService.build(req.query as never, req.user!.id)));
  },

  feedback: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(
      await ragQueryService.addFeedback(req.body.responseId, req.user!.id, req.body.rating, req.body.helpful, req.body.comment),
    ));
  },

  analytics: async (req: Request, res: Response) => {
    res.json(successResponse(await ragAnalyticsService.getAnalytics(req.query as never)));
  },
};
