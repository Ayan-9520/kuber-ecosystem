import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { analyticsRepository } from '../repositories/analytics.repository.js';
import { analyticsOrchestratorService } from '../services/analytics-orchestrator.service.js';
import { reportEngineService } from '../services/report-engine.service.js';
import { scheduleEngineService } from '../services/schedule-engine.service.js';
import type { AnalyticsContext } from '../types/analytics.types.js';

function ctx(req: Request): AnalyticsContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const analyticsController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'analytics', status: 'ok', engine: 'enterprise' }));
  },

  overview: async (req: Request, res: Response) => {
    const data = await analyticsOrchestratorService.overview(req.user!, req.query as never);
    await analyticsRepository.createAudit({
      userId: req.user!.id,
      action: 'VIEW_OVERVIEW',
      resource: 'analytics',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.json(successResponse(data));
  },

  kpis: async (req: Request, res: Response) => {
    res.json(successResponse(await analyticsOrchestratorService.kpis(req.user!, req.query as never)));
  },

  revenue: async (req: Request, res: Response) => {
    res.json(successResponse(await analyticsOrchestratorService.revenue(req.user!, req.query as never)));
  },

  leads: async (req: Request, res: Response) => {
    res.json(successResponse(await analyticsOrchestratorService.leads(req.user!, req.query as never)));
  },

  applications: async (req: Request, res: Response) => {
    res.json(successResponse(await analyticsOrchestratorService.applications(req.user!, req.query as never)));
  },

  commissions: async (req: Request, res: Response) => {
    res.json(successResponse(await analyticsOrchestratorService.commissions(req.user!, req.query as never)));
  },

  ai: async (req: Request, res: Response) => {
    res.json(successResponse(await analyticsOrchestratorService.ai(req.user!, req.query as never)));
  },

  export: async (req: Request, res: Response) => {
    const result = await analyticsOrchestratorService.export(req.user!, req.query as never);
    await analyticsRepository.createAudit({
      userId: req.user!.id,
      action: 'EXPORT',
      resource: 'analytics',
      metadata: { format: (req.query as { format?: string }).format, reportType: (req.query as { reportType?: string }).reportType },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  },

  listReports: async (req: Request, res: Response) => {
    const q = req.query as { page?: string; limit?: string; reportType?: string; isActive?: string };
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const result = await reportEngineService.list({
      page,
      limit,
      reportType: q.reportType,
      isActive: q.isActive === undefined ? undefined : q.isActive === 'true',
    });
    res.json(paginatedResponse(result.items, result.meta));
  },

  createReport: async (req: Request, res: Response) => {
    const report = await reportEngineService.create(req.user!, req.body);
    res.status(201).json(successResponse(report));
  },

  runReport: async (req: Request, res: Response) => {
    const { execution, export: exportResult } = await reportEngineService.run(req.user!, req.body, ctx(req));
    res.json(successResponse({ execution, preview: exportResult.content.slice(0, 500) }));
  },

  reportExecutions: async (req: Request, res: Response) => {
    res.json(successResponse(await reportEngineService.executions(req.params.id as string)));
  },

  createSchedule: async (req: Request, res: Response) => {
    const schedule = await scheduleEngineService.create(req.user!, req.body);
    res.status(201).json(successResponse(schedule));
  },

  listDashboards: async (req: Request, res: Response) => {
    const q = req.query as { page?: string; limit?: string; dashboardType?: string };
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const skip = (page - 1) * limit;
    const { items, total } = await analyticsRepository.listDashboards({
      skip,
      take: limit,
      dashboardType: q.dashboardType,
    });
    res.json(paginatedResponse(items, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  },
};
