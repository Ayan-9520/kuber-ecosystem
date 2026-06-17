import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { automationAiService } from '../services/automation-ai.service.js';
import { automationAnalyticsService } from '../services/automation-analytics.service.js';
import { automationExecutionService } from '../services/automation-execution.service.js';
import { automationExportService } from '../services/automation-export.service.js';
import { automationLogService } from '../services/automation-log.service.js';
import { automationTemplateService } from '../services/automation-template.service.js';
import { automationTriggerService } from '../services/automation-trigger.service.js';
import { automationWorkflowService } from '../services/automation-workflow.service.js';

function ctx(req: Request) {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
}

export const automationController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'automation', status: 'ok' }));
  },

  listWorkflows: async (req: Request, res: Response) => {
    const result = await automationWorkflowService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getWorkflow: async (req: Request, res: Response) => {
    res.json(successResponse(await automationWorkflowService.getById(req.user!, req.params.id as string)));
  },

  createWorkflow: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await automationWorkflowService.create(req.user!, req.body, ctx(req))));
  },

  updateWorkflow: async (req: Request, res: Response) => {
    res.json(successResponse(await automationWorkflowService.update(req.user!, req.params.id as string, req.body, ctx(req))));
  },

  approveWorkflow: async (req: Request, res: Response) => {
    res.json(successResponse(await automationWorkflowService.approve(req.user!, req.params.id as string, ctx(req))));
  },

  deleteWorkflow: async (req: Request, res: Response) => {
    await automationWorkflowService.remove(req.user!, req.params.id as string, ctx(req));
    res.status(204).send();
  },

  createFromTemplate: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await automationWorkflowService.createFromTemplate(req.user!, req.params.id as string, ctx(req))));
  },

  listTemplates: async (req: Request, res: Response) => {
    const result = await automationTemplateService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getTemplate: async (req: Request, res: Response) => {
    res.json(successResponse(await automationTemplateService.getById(req.user!, req.params.id as string)));
  },

  createTemplate: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await automationTemplateService.create(req.user!, req.body)));
  },

  listExecutions: async (req: Request, res: Response) => {
    const result = await automationExecutionService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  getExecution: async (req: Request, res: Response) => {
    res.json(successResponse(await automationExecutionService.getById(req.user!, req.params.id as string)));
  },

  cancelExecution: async (req: Request, res: Response) => {
    res.json(successResponse(await automationExecutionService.cancel(req.user!, req.params.id as string)));
  },

  retryExecution: async (req: Request, res: Response) => {
    res.json(successResponse(await automationExecutionService.retry(req.user!, req.params.id as string)));
  },

  listTriggers: async (req: Request, res: Response) => {
    const result = await automationTriggerService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  createTrigger: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await automationTriggerService.create(req.body)));
  },

  updateTrigger: async (req: Request, res: Response) => {
    res.json(successResponse(await automationTriggerService.update(req.params.id as string, req.body)));
  },

  deleteTrigger: async (req: Request, res: Response) => {
    await automationTriggerService.remove(req.params.id as string);
    res.status(204).send();
  },

  emitTrigger: async (req: Request, res: Response) => {
    res.json(successResponse(await automationTriggerService.emit(req.body)));
  },

  analyticsDashboard: async (req: Request, res: Response) => {
    res.json(successResponse(await automationAnalyticsService.dashboard(req.user!, req.query as never)));
  },

  listAnalytics: async (req: Request, res: Response) => {
    const result = await automationAnalyticsService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  listLogs: async (req: Request, res: Response) => {
    const result = await automationLogService.list(req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },

  export: async (req: Request, res: Response) => {
    const result = await automationExportService.export(req.user!, req.query as never);
    if (result.format === 'csv') {
      res.setHeader('Content-Type', result.contentType!);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
      return;
    }
    res.json(successResponse(result));
  },

  aiSuggest: async (req: Request, res: Response) => {
    res.json(successResponse(await automationAiService.suggest(req.user!, req.body)));
  },
};
