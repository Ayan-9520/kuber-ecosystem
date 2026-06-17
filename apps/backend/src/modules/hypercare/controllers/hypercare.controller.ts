import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { hypercareService } from '../services/hypercare.service.js';

export const hypercareController = {
  status: async (req: Request, res: Response) => {
    res.json(successResponse(await hypercareService.getStatus(req.user!, req.query as never)));
  },

  incidents: async (req: Request, res: Response) => {
    res.json(successResponse(await hypercareService.listIncidents(req.user!, req.query as never)));
  },

  createIncident: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await hypercareService.createIncident(req.user!, req.body)));
  },

  updateIncident: async (req: Request, res: Response) => {
    res.json(successResponse(await hypercareService.updateIncident(req.user!, String(req.params.incidentId), req.body)));
  },

  issues: async (req: Request, res: Response) => {
    res.json(successResponse(await hypercareService.listIssues(req.user!, req.query as never)));
  },

  createIssue: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await hypercareService.createIssue(req.user!, req.body)));
  },

  updateIssue: async (req: Request, res: Response) => {
    res.json(successResponse(await hypercareService.updateIssue(req.user!, String(req.params.issueId), req.body)));
  },

  metrics: async (req: Request, res: Response) => {
    res.json(successResponse(await hypercareService.listMetrics(req.user!, req.query as never)));
  },

  snapshotMetrics: async (req: Request, res: Response) => {
    res.json(successResponse(await hypercareService.snapshotMetrics(req.user!, req.body?.sessionId)));
  },

  reports: async (req: Request, res: Response) => {
    res.json(successResponse(await hypercareService.getReports(req.user!, req.query as never)));
  },

  createRca: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await hypercareService.createRca(req.user!, req.body)));
  },
};
