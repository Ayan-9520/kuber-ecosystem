import type { Request, Response } from 'express';

import { paginatedResponse, successResponse } from '../../../shared/responses/success-response.js';
import { auditEventService } from '../services/audit-event.service.js';
import { auditReportService } from '../services/audit-report.service.js';
import { complianceService } from '../services/compliance.service.js';
import { riskService } from '../services/risk.service.js';
import { securityService } from '../services/security.service.js';

export const governanceController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'governance', status: 'ok' }));
  },

  // Audit
  auditDashboard: async (req: Request, res: Response) => {
    res.json(successResponse(await auditEventService.dashboard(req.query as never)));
  },
  listAuditEvents: async (req: Request, res: Response) => {
    const result = await auditEventService.searchUnified(req.query as never);
    res.json(paginatedResponse(result.items as never, result.meta));
  },
  getAuditEvent: async (req: Request, res: Response) => {
    res.json(successResponse(await auditEventService.getById(req.params.id as string)));
  },
  exportAuditEvents: async (req: Request, res: Response) => {
    const result = await auditEventService.export(req.query as never, req.user!.id);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.data);
  },
  listAuditReports: async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await auditReportService.list(req.user!, page, limit);
    res.json(paginatedResponse(result.items as never, result.meta));
  },
  createAuditReport: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await auditReportService.create(req.user!, req.body)));
  },

  // Compliance
  complianceDashboard: async (req: Request, res: Response) => {
    res.json(successResponse(await complianceService.dashboard(req.user!, req.query as never)));
  },
  listViolations: async (req: Request, res: Response) => {
    const result = await complianceService.listViolations(req.user!, req.query as never);
    res.json(paginatedResponse(result.items as never, result.meta));
  },
  resolveViolation: async (req: Request, res: Response) => {
    const { violationId, status, comments } = req.body;
    res.json(successResponse(await complianceService.resolveViolation(req.user!, violationId, status, comments)));
  },
  listComplianceReports: async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await complianceService.listReports(req.user!, page, limit);
    res.json(paginatedResponse(result.items as never, result.meta));
  },
  generateComplianceReport: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await complianceService.generateReport(req.user!, req.body)));
  },
  listComplianceRules: async (req: Request, res: Response) => {
    res.json(successResponse(await complianceService.listRules(req.user!)));
  },
  listRetentionPolicies: async (req: Request, res: Response) => {
    res.json(successResponse(await complianceService.listRetentionPolicies(req.user!)));
  },

  // Risk
  riskDashboard: async (req: Request, res: Response) => {
    res.json(successResponse(await riskService.dashboard(req.user!, req.query as never)));
  },
  listRiskRegister: async (req: Request, res: Response) => {
    const result = await riskService.listRegister(req.user!, req.query as never);
    res.json(paginatedResponse(result.items as never, result.meta));
  },
  createRiskRegister: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await riskService.createRegister(req.user!, req.body)));
  },
  getRiskRegister: async (req: Request, res: Response) => {
    res.json(successResponse(await riskService.getRegister(req.user!, req.params.id as string)));
  },
  createRiskAssessment: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await riskService.createAssessment(req.user!, req.body)));
  },
  listRiskEvents: async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await riskService.listEvents(req.user!, page, limit);
    res.json(paginatedResponse(result.items as never, result.meta));
  },

  // Security
  securityDashboard: async (req: Request, res: Response) => {
    res.json(successResponse(await securityService.dashboard(req.user!, req.query as never)));
  },
  listSecurityEvents: async (req: Request, res: Response) => {
    const result = await securityService.listEvents(req.user!, req.query as never);
    res.json(paginatedResponse(result.items as never, result.meta));
  },
  listSecurityAlerts: async (req: Request, res: Response) => {
    const result = await securityService.listAlerts(req.user!, req.query as never);
    res.json(paginatedResponse(result.items as never, result.meta));
  },
  updateSecurityAlert: async (req: Request, res: Response) => {
    const { alertId, status, assignedToId } = req.body;
    res.json(successResponse(await securityService.updateAlert(req.user!, alertId, status, assignedToId)));
  },
  aiGovernance: async (req: Request, res: Response) => {
    res.json(successResponse(await securityService.aiGovernance(req.user!, req.query as never)));
  },
  threatDashboard: async (req: Request, res: Response) => {
    res.json(successResponse(await securityService.threatDashboard(req.user!, req.query as never)));
  },
};
