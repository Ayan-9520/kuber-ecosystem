import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { uatAnalyticsService, uatTemplateService } from '../services/uat-analytics.service.js';
import { uatCycleService } from '../services/uat-cycle.service.js';
import { uatDefectService } from '../services/uat-defect.service.js';
import { uatExecutionService } from '../services/uat-execution.service.js';
import { uatFinalSignoffService } from '../services/uat-final-signoff.service.js';
import { uatPlanService } from '../services/uat-plan.service.js';
import { uatScenarioService } from '../services/uat-scenario.service.js';
import { uatSignoffService } from '../services/uat-signoff.service.js';
import { uatTestCaseService } from '../services/uat-test-case.service.js';

export const uatController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'uat', status: 'ok' }));
  },

  dashboard: async (req: Request, res: Response) => {
    res.json(successResponse(await uatAnalyticsService.dashboard(req.user!, req.query as never)));
  },

  // Plans
  listPlans: async (req: Request, res: Response) => {
    const result = await uatPlanService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getPlan: async (req: Request, res: Response) => {
    res.json(successResponse(await uatPlanService.getById(req.user!, req.params.id as string)));
  },
  createPlan: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await uatPlanService.create(req.user!, req.body)));
  },
  updatePlan: async (req: Request, res: Response) => {
    res.json(successResponse(await uatPlanService.update(req.user!, req.params.id as string, req.body)));
  },

  // Cycles
  listCycles: async (req: Request, res: Response) => {
    const result = await uatCycleService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getCycle: async (req: Request, res: Response) => {
    res.json(successResponse(await uatCycleService.getById(req.user!, req.params.id as string)));
  },
  createCycle: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await uatCycleService.create(req.user!, req.body)));
  },
  updateCycle: async (req: Request, res: Response) => {
    res.json(successResponse(await uatCycleService.update(req.user!, req.params.id as string, req.body)));
  },

  // Scenarios
  listScenarios: async (req: Request, res: Response) => {
    const result = await uatScenarioService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getScenario: async (req: Request, res: Response) => {
    res.json(successResponse(await uatScenarioService.getById(req.user!, req.params.id as string)));
  },
  createScenario: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await uatScenarioService.create(req.user!, req.body)));
  },

  // Test Cases
  listTestCases: async (req: Request, res: Response) => {
    const result = await uatTestCaseService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getTestCase: async (req: Request, res: Response) => {
    res.json(successResponse(await uatTestCaseService.getById(req.user!, req.params.id as string)));
  },
  createTestCase: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await uatTestCaseService.create(req.user!, req.body)));
  },

  // Executions
  listExecutions: async (req: Request, res: Response) => {
    const result = await uatExecutionService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getExecution: async (req: Request, res: Response) => {
    res.json(successResponse(await uatExecutionService.getById(req.user!, req.params.id as string)));
  },
  executeTestCase: async (req: Request, res: Response) => {
    res.json(successResponse(await uatExecutionService.execute(req.user!, req.body)));
  },

  // Defects
  listDefects: async (req: Request, res: Response) => {
    const result = await uatDefectService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getDefect: async (req: Request, res: Response) => {
    res.json(successResponse(await uatDefectService.getById(req.user!, req.params.id as string)));
  },
  createDefect: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await uatDefectService.create(req.user!, req.body)));
  },
  updateDefect: async (req: Request, res: Response) => {
    res.json(successResponse(await uatDefectService.update(req.user!, req.params.id as string, req.body)));
  },

  // Signoffs
  listSignoffs: async (req: Request, res: Response) => {
    const result = await uatSignoffService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  submitSignoff: async (req: Request, res: Response) => {
    res.json(successResponse(await uatSignoffService.submit(req.user!, req.body)));
  },
  qualityGates: async (req: Request, res: Response) => {
    res.json(successResponse(await uatSignoffService.checkQualityGates(req.params.cycleId as string)));
  },
  readiness: async (req: Request, res: Response) => {
    res.json(successResponse(await uatSignoffService.readiness(req.params.cycleId as string)));
  },

  // Templates
  listTemplates: async (req: Request, res: Response) => {
    const result = await uatTemplateService.list(req.user!, req.query as never);
    res.json(paginatedResponse(result.items, result.meta));
  },
  getTemplate: async (req: Request, res: Response) => {
    res.json(successResponse(await uatTemplateService.getById(req.user!, req.params.id as string)));
  },

  // Reports
  uatSummaryReport: async (req: Request, res: Response) => {
    res.json(successResponse(await uatAnalyticsService.uatSummaryReport(req.user!, req.query as never)));
  },
  defectSummaryReport: async (req: Request, res: Response) => {
    res.json(successResponse(await uatAnalyticsService.defectSummaryReport(req.user!, req.query as never)));
  },
  moduleReadinessReport: async (req: Request, res: Response) => {
    res.json(successResponse(await uatAnalyticsService.moduleReadinessReport(req.user!, req.query as never)));
  },
  businessReadinessReport: async (req: Request, res: Response) => {
    res.json(successResponse(await uatAnalyticsService.businessReadinessReport(req.user!, req.query as never)));
  },
  signoffReport: async (req: Request, res: Response) => {
    res.json(successResponse(await uatAnalyticsService.signoffReport(req.user!, req.query as never)));
  },

  // Final UAT Signoff Framework
  listApprovals: async (req: Request, res: Response) => {
    const result = await uatFinalSignoffService.listApprovals(req.user!, req.query as never);
    res.json({ success: true, data: result.items, meta: result.meta, cycleId: result.cycleId });
  },
  submitApproval: async (req: Request, res: Response) => {
    res.json(successResponse(await uatFinalSignoffService.submitApproval(req.user!, req.body)));
  },
  listReviews: async (req: Request, res: Response) => {
    res.json(successResponse(await uatFinalSignoffService.listReviews(req.user!, req.query as never)));
  },
  updateReview: async (req: Request, res: Response) => {
    res.json(successResponse(await uatFinalSignoffService.updateReview(req.user!, req.body)));
  },
  listRisks: async (req: Request, res: Response) => {
    const result = await uatFinalSignoffService.listRisks(req.user!, req.query as never);
    res.json({ success: true, data: result.items, meta: result.meta, cycleId: result.cycleId });
  },
  createRisk: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await uatFinalSignoffService.createRisk(req.user!, req.body)));
  },
  getStatus: async (req: Request, res: Response) => {
    res.json(successResponse(await uatFinalSignoffService.getStatus(req.user!, req.query as never)));
  },
  finalSignoffReports: async (req: Request, res: Response) => {
    res.json(successResponse(await uatFinalSignoffService.getReports(req.user!, req.query as never)));
  },
  addComment: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await uatFinalSignoffService.addComment(req.user!, req.body)));
  },
};
