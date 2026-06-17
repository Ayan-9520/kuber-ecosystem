import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { observabilityRepository } from '../repositories/observability.repository.js';
import { observabilityDataService } from '../services/observability-data.service.js';

export const observabilityController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'observability', status: 'ok' }));
  },

  overview: async (req: Request, res: Response) => {
    res.json(successResponse(await observabilityDataService.overview(req.query as never)));
  },

  aiObservability: async (req: Request, res: Response) => {
    res.json(successResponse(await observabilityDataService.aiObservability(req.query as never)));
  },

  logs: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const result = await observabilityDataService.searchLogs({
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 20),
      sortOrder: String(q.sortOrder ?? 'desc'),
      level: q.level as string | undefined,
      category: q.category as string | undefined,
      module: q.module as string | undefined,
      userId: q.userId as string | undefined,
      requestId: q.requestId as string | undefined,
      traceId: q.traceId as string | undefined,
      correlationId: q.correlationId as string | undefined,
      search: q.search as string | undefined,
    });
    res.json(paginatedResponse(result.items, result.meta));
  },

  traces: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const result = await observabilityDataService.searchTraces({
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 20),
      sortOrder: String(q.sortOrder ?? 'desc'),
      sortBy: String(q.sortBy ?? 'startedAt'),
      status: q.status as string | undefined,
      userId: q.userId as string | undefined,
      requestId: q.requestId as string | undefined,
      traceId: q.traceId as string | undefined,
      correlationId: q.correlationId as string | undefined,
      search: q.search as string | undefined,
    });
    res.json(paginatedResponse(result.items, result.meta));
  },

  errors: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const result = await observabilityDataService.searchErrors({
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 20),
      sortOrder: String(q.sortOrder ?? 'desc'),
      source: q.source as string | undefined,
      resolved: q.resolved !== undefined ? q.resolved === 'true' : undefined,
      userId: q.userId as string | undefined,
      requestId: q.requestId as string | undefined,
      traceId: q.traceId as string | undefined,
      search: q.search as string | undefined,
    });
    res.json(paginatedResponse(result.items, result.meta));
  },

  events: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const result = await observabilityDataService.searchEvents({
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 20),
      sortOrder: String(q.sortOrder ?? 'desc'),
      eventType: q.eventType as string | undefined,
      eventName: q.eventName as string | undefined,
      category: q.category as string | undefined,
      userId: q.userId as string | undefined,
      workflowId: q.workflowId as string | undefined,
      search: q.search as string | undefined,
    });
    res.json(paginatedResponse(result.items, result.meta));
  },

  search: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    res.json(successResponse(await observabilityDataService.globalSearch({
      q: String(q.q ?? ''),
      type: String(q.type ?? 'all'),
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 20),
    })));
  },

  getTrace: async (req: Request, res: Response) => {
    const trace = await observabilityRepository.trace.findByTraceId(String(req.params.traceId));
    res.json(successResponse(trace));
  },

  getError: async (req: Request, res: Response) => {
    const error = await observabilityRepository.error.findById(String(req.params.id));
    res.json(successResponse(error));
  },
};
