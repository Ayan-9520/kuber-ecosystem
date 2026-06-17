import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { metricsRegistryService } from '../services/metrics-registry.service.js';
import { monitoringAlertService } from '../services/monitoring-alert.service.js';
import { monitoringDataService } from '../services/monitoring-data.service.js';
import { monitoringHealthService } from '../services/monitoring-health.service.js';
import { deploymentReadinessService } from '../services/deployment-readiness.service.js';

export const monitoringController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'monitoring', status: 'ok' }));
  },

  metrics: async (_req: Request, res: Response) => {
    res.set('Content-Type', metricsRegistryService.getContentType());
    res.send(await metricsRegistryService.getMetrics());
  },

  overview: async (req: Request, res: Response) => {
    res.json(successResponse(await monitoringDataService.overview(req.query as never)));
  },

  system: async (req: Request, res: Response) => {
    res.json(successResponse(await monitoringDataService.system(req.query as never)));
  },

  database: async (req: Request, res: Response) => {
    res.json(successResponse(await monitoringDataService.database(req.query as never)));
  },

  queues: async (req: Request, res: Response) => {
    res.json(successResponse(await monitoringDataService.queues(req.query as never)));
  },

  ai: async (req: Request, res: Response) => {
    res.json(successResponse(await monitoringDataService.ai(req.query as never)));
  },

  business: async (req: Request, res: Response) => {
    res.json(successResponse(await monitoringDataService.business(req.query as never)));
  },

  notifications: async (req: Request, res: Response) => {
    res.json(successResponse(await monitoringDataService.notifications(req.query as never)));
  },

  authMetrics: async (req: Request, res: Response) => {
    res.json(successResponse(await monitoringDataService.authMetrics(req.query as never)));
  },

  application: async (req: Request, res: Response) => {
    res.json(successResponse(await monitoringDataService.application(req.query as never)));
  },

  sla: async (req: Request, res: Response) => {
    res.json(successResponse(await monitoringDataService.sla(req.query as never)));
  },

  deploymentReadiness: async (_req: Request, res: Response) => {
    res.json(successResponse(deploymentReadinessService.getReport()));
  },

  deepHealth: async (_req: Request, res: Response) => {
    const result = await monitoringHealthService.deepHealth();
    res.status(result.status === 'ok' ? 200 : 503).json(successResponse(result));
  },

  listAlerts: async (req: Request, res: Response) => {
    const result = await monitoringAlertService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getAlert: async (req: Request, res: Response) => {
    res.json(successResponse(await monitoringAlertService.getById(req.user!, req.params.id as string)));
  },

  updateAlert: async (req: Request, res: Response) => {
    res.json(successResponse(await monitoringAlertService.update(req.user!, req.params.id as string, req.body)));
  },

  alertsSummary: async (_req: Request, res: Response) => {
    res.json(successResponse(await monitoringAlertService.summary()));
  },
};
