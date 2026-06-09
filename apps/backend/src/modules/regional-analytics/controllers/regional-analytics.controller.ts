import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { regionalAnalyticsRepository } from '../repositories/regional-analytics.repository.js';
import { regionalAnalyticsOrchestratorService } from '../services/regional-analytics-orchestrator.service.js';

export const regionalAnalyticsController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'regional-analytics', status: 'ok', engine: 'enterprise' }));
  },

  dashboard: async (req: Request, res: Response) => {
    const data = await regionalAnalyticsOrchestratorService.dashboard(req.user!, req.query as never);
    await regionalAnalyticsRepository.createAudit({
      user: { connect: { id: req.user!.id } },
      action: 'VIEW_DASHBOARD',
      resource: 'regional-analytics',
      metadata: { regionId: (req.query as { regionId?: string }).regionId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.json(successResponse(data));
  },

  performance: async (req: Request, res: Response) => {
    res.json(successResponse(await regionalAnalyticsOrchestratorService.performance(req.user!, req.query as never)));
  },

  revenue: async (req: Request, res: Response) => {
    res.json(successResponse(await regionalAnalyticsOrchestratorService.revenue(req.user!, req.query as never)));
  },

  leads: async (req: Request, res: Response) => {
    res.json(successResponse(await regionalAnalyticsOrchestratorService.leads(req.user!, req.query as never)));
  },

  applications: async (req: Request, res: Response) => {
    res.json(successResponse(await regionalAnalyticsOrchestratorService.applications(req.user!, req.query as never)));
  },

  branches: async (req: Request, res: Response) => {
    res.json(successResponse(await regionalAnalyticsOrchestratorService.branches(req.user!, req.query as never)));
  },

  partners: async (req: Request, res: Response) => {
    res.json(successResponse(await regionalAnalyticsOrchestratorService.partners(req.user!, req.query as never)));
  },

  forecast: async (req: Request, res: Response) => {
    res.json(successResponse(await regionalAnalyticsOrchestratorService.forecast(req.user!, req.query as never)));
  },

  rankings: async (req: Request, res: Response) => {
    res.json(successResponse(await regionalAnalyticsOrchestratorService.rankings(req.user!, req.query as never)));
  },

  targets: async (req: Request, res: Response) => {
    const q = req.query as Record<string, string | undefined>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const result = await regionalAnalyticsOrchestratorService.targets(req.user!, {
      timePreset: q.timePreset as never,
      periodType: q.periodType as never,
      fromDate: q.fromDate ? new Date(q.fromDate) : undefined,
      toDate: q.toDate ? new Date(q.toDate) : undefined,
      regionId: q.regionId,
      branchId: q.branchId,
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
    const target = await regionalAnalyticsOrchestratorService.createTarget(req.user!, req.body);
    await regionalAnalyticsRepository.createAudit({
      user: { connect: { id: req.user!.id } },
      action: 'CREATE_TARGET',
      resource: 'regional-target',
      resourceId: target.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(201).json(successResponse(target));
  },

  export: async (req: Request, res: Response) => {
    const result = await regionalAnalyticsOrchestratorService.export(req.user!, req.query as never);
    await regionalAnalyticsRepository.createAudit({
      user: { connect: { id: req.user!.id } },
      action: 'EXPORT',
      resource: 'regional-analytics',
      metadata: {
        format: (req.query as { format?: string }).format,
        reportType: (req.query as { reportType?: string }).reportType,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  },
};
