import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { branchAnalyticsRepository } from '../repositories/branch-analytics.repository.js';
import { branchAnalyticsOrchestratorService } from '../services/branch-analytics-orchestrator.service.js';

export const branchAnalyticsController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'branch-analytics', status: 'ok', engine: 'enterprise' }));
  },

  dashboard: async (req: Request, res: Response) => {
    const data = await branchAnalyticsOrchestratorService.dashboard(req.user!, req.query as never);
    await branchAnalyticsRepository.createAudit({
      user: { connect: { id: req.user!.id } },
      action: 'VIEW_DASHBOARD',
      resource: 'branch-analytics',
      metadata: { branchId: (req.query as { branchId?: string }).branchId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.json(successResponse(data));
  },

  performance: async (req: Request, res: Response) => {
    res.json(successResponse(await branchAnalyticsOrchestratorService.performance(req.user!, req.query as never)));
  },

  revenue: async (req: Request, res: Response) => {
    res.json(successResponse(await branchAnalyticsOrchestratorService.revenue(req.user!, req.query as never)));
  },

  leads: async (req: Request, res: Response) => {
    res.json(successResponse(await branchAnalyticsOrchestratorService.leads(req.user!, req.query as never)));
  },

  applications: async (req: Request, res: Response) => {
    res.json(successResponse(await branchAnalyticsOrchestratorService.applications(req.user!, req.query as never)));
  },

  partners: async (req: Request, res: Response) => {
    res.json(successResponse(await branchAnalyticsOrchestratorService.partners(req.user!, req.query as never)));
  },

  forecast: async (req: Request, res: Response) => {
    res.json(successResponse(await branchAnalyticsOrchestratorService.forecast(req.user!, req.query as never)));
  },

  rankings: async (req: Request, res: Response) => {
    res.json(successResponse(await branchAnalyticsOrchestratorService.rankings(req.user!, req.query as never)));
  },

  targets: async (req: Request, res: Response) => {
    const q = req.query as Record<string, string | undefined>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const result = await branchAnalyticsOrchestratorService.targets(req.user!, {
      timePreset: q.timePreset as never,
      periodType: q.periodType as never,
      fromDate: q.fromDate ? new Date(q.fromDate) : undefined,
      toDate: q.toDate ? new Date(q.toDate) : undefined,
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
    const target = await branchAnalyticsOrchestratorService.createTarget(req.user!, req.body);
    await branchAnalyticsRepository.createAudit({
      user: { connect: { id: req.user!.id } },
      action: 'CREATE_TARGET',
      resource: 'branch-target',
      resourceId: target.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(201).json(successResponse(target));
  },

  export: async (req: Request, res: Response) => {
    const result = await branchAnalyticsOrchestratorService.export(req.user!, req.query as never);
    await branchAnalyticsRepository.createAudit({
      user: { connect: { id: req.user!.id } },
      action: 'EXPORT',
      resource: 'branch-analytics',
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
