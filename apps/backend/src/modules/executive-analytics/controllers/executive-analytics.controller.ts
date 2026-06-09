import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { executiveAnalyticsRepository } from '../repositories/executive-analytics.repository.js';
import { executiveAnalyticsOrchestratorService } from '../services/executive-analytics-orchestrator.service.js';

export const executiveAnalyticsController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'executive-analytics', status: 'ok', engine: 'enterprise' }));
  },

  dashboard: async (req: Request, res: Response) => {
    const data = await executiveAnalyticsOrchestratorService.dashboard(req.user!, req.query as never);
    await executiveAnalyticsRepository.createAudit({
      user: { connect: { id: req.user!.id } },
      action: 'VIEW_DASHBOARD',
      resource: 'executive-analytics',
      metadata: { employeeId: (req.query as { employeeId?: string }).employeeId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.json(successResponse(data));
  },

  performance: async (req: Request, res: Response) => {
    res.json(successResponse(await executiveAnalyticsOrchestratorService.performance(req.user!, req.query as never)));
  },

  targets: async (req: Request, res: Response) => {
    const q = req.query as Record<string, string | undefined>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const result = await executiveAnalyticsOrchestratorService.targets(req.user!, {
      timePreset: q.timePreset as never,
      periodType: q.periodType as never,
      fromDate: q.fromDate ? new Date(q.fromDate) : undefined,
      toDate: q.toDate ? new Date(q.toDate) : undefined,
      employeeId: q.employeeId,
      executiveRole: q.executiveRole as never,
      branchId: q.branchId,
      regionId: q.regionId,
      productId: q.productId,
      isActive: q.isActive != null ? q.isActive === 'true' : undefined,
      page,
      limit,
    });
    res.json(
      paginatedResponse(result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit) || 1,
      }),
    );
  },

  createTarget: async (req: Request, res: Response) => {
    const target = await executiveAnalyticsOrchestratorService.createTarget(req.user!, req.body);
    await executiveAnalyticsRepository.createAudit({
      user: { connect: { id: req.user!.id } },
      action: 'CREATE_TARGET',
      resource: 'executive-target',
      resourceId: target.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(201).json(successResponse(target));
  },

  leaderboard: async (req: Request, res: Response) => {
    res.json(successResponse(await executiveAnalyticsOrchestratorService.leaderboard(req.user!, req.query as never)));
  },

  forecast: async (req: Request, res: Response) => {
    res.json(successResponse(await executiveAnalyticsOrchestratorService.forecast(req.user!, req.query as never)));
  },

  export: async (req: Request, res: Response) => {
    const result = await executiveAnalyticsOrchestratorService.export(req.user!, req.query as never);
    await executiveAnalyticsRepository.createAudit({
      user: { connect: { id: req.user!.id } },
      action: 'EXPORT',
      resource: 'executive-analytics',
      metadata: { format: (req.query as { format?: string }).format, reportType: (req.query as { reportType?: string }).reportType },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  },
};
