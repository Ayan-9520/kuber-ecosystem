import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { centralAuditService } from '../../governance/services/central-audit.service.js';
import { errorAlertService } from '../services/error-alert.service.js';
import { errorAnalyticsService } from '../services/error-analytics.service.js';
import { errorAssignmentService } from '../services/error-assignment.service.js';
import { errorCaptureService } from '../services/error-capture.service.js';
import { errorDataService } from '../services/error-data.service.js';
import { errorResolutionService } from '../services/error-resolution.service.js';

export const errorTrackingController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'errors', status: 'ok' }));
  },

  capture: async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const result = await errorCaptureService.capture({
      ...body,
      userId: (body.userId as string | undefined) ?? req.user?.id,
      userRole: (body.userRole as string | undefined) ?? req.user?.roles?.[0],
      requestId: (body.requestId as string | undefined) ?? req.requestId,
      correlationId: (body.correlationId as string | undefined) ?? req.correlationId,
      traceId: (body.traceId as string | undefined) ?? req.traceId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    } as never);
    res.status(201).json(successResponse(result));
  },

  list: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const result = await errorDataService.listGroups({
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 20),
      sortOrder: String(q.sortOrder ?? 'desc'),
      sortBy: String(q.sortBy ?? 'lastSeenAt'),
      source: q.source as string | undefined,
      category: q.category as string | undefined,
      priority: q.priority as string | undefined,
      status: q.status as string | undefined,
      module: q.module as string | undefined,
      traceId: q.traceId as string | undefined,
      search: q.search as string | undefined,
    });
    res.json(paginatedResponse(result.items, result.meta));
  },

  groups: async (req: Request, res: Response) => errorTrackingController.list(req, res),

  getById: async (req: Request, res: Response) => {
    res.json(successResponse(await errorDataService.getGroup(String(req.params.id))));
  },

  analytics: async (req: Request, res: Response) => {
    res.json(successResponse(await errorAnalyticsService.overview(req.query as never)));
  },

  deploymentGate: async (req: Request, res: Response) => {
    const gate = await errorAnalyticsService.deploymentGate();
    void centralAuditService.log({
      userId: req.user?.id,
      userRole: req.user?.roles?.[0],
      sessionId: req.sessionId,
      action: 'VIEW_DEPLOYMENT_GATE',
      entityType: 'error_deployment_gate',
      newValues: gate as never,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
      requestId: req.requestId,
      source: 'ERRORS',
    });
    res.status(gate.passed ? 200 : 503).json(successResponse(gate));
  },

  alerts: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const result = await errorAlertService.list({
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 20),
      status: q.status as string | undefined,
      severity: q.severity as string | undefined,
      source: q.source as string | undefined,
      search: q.search as string | undefined,
    });
    res.json(paginatedResponse(result.items, result.meta));
  },

  assign: async (req: Request, res: Response) => {
    const body = req.body as { groupId: string; assignedToId: string; notes?: string };
    res.json(successResponse(await errorAssignmentService.assign({
      ...body,
      assignedById: req.user!.id,
    })));
  },

  resolve: async (req: Request, res: Response) => {
    const body = req.body as { groupId: string; resolutionType: string; rootCause?: string; fixDescription?: string };
    res.json(successResponse(await errorResolutionService.resolve({
      ...body,
      resolvedById: req.user!.id,
    })));
  },

  comment: async (req: Request, res: Response) => {
    const body = req.body as { groupId: string; content: string };
    res.json(successResponse(await errorResolutionService.addComment({
      ...body,
      authorId: req.user!.id,
    })));
  },

  assignments: async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const result = await errorDataService.listAssignments({
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 20),
      assignedToId: q.assignedToId as string | undefined,
    });
    res.json(paginatedResponse(result.items, result.meta));
  },
};
