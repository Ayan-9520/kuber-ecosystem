import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { goLiveExecutionService } from '../services/go-live-execution.service.js';
import { goLivePlatformService } from '../services/go-live-platform.service.js';

export const goLiveController = {
  async webhook(req: Request, res: Response) {
    res.json(successResponse(await goLivePlatformService.handleWebhook(req.body)));
  },

  async readiness(_req: Request, res: Response) {
    res.json(successResponse(await goLivePlatformService.getReadiness()));
  },

  async dashboard(_req: Request, res: Response) {
    res.json(successResponse(await goLivePlatformService.getDashboard()));
  },

  async checklist(req: Request, res: Response) {
    res.json(successResponse(await goLivePlatformService.listChecklist(req.query as never)));
  },

  async updateChecklistItem(req: Request, res: Response) {
    const actorId = req.user?.id;
    res.json(
      successResponse(
        await goLivePlatformService.updateChecklistItem(
          String(req.params.itemCode),
          req.body,
          actorId,
        ),
      ),
    );
  },

  async approvals(req: Request, res: Response) {
    res.json(successResponse(await goLivePlatformService.listApprovals(req.query.launchId as string | undefined)));
  },

  async decideApproval(req: Request, res: Response) {
    const actorId = req.user!.id;
    res.json(
      successResponse(
        await goLivePlatformService.decideApproval(
          String(req.params.launchId),
          String(req.params.approvalType),
          req.body,
          actorId,
        ),
      ),
    );
  },

  async startLaunch(req: Request, res: Response) {
    const actorId = req.user!.id;
    res.json(successResponse(await goLivePlatformService.startLaunch(actorId, req.body.launchExecutionId)));
  },

  async completeLaunch(req: Request, res: Response) {
    const actorId = req.user!.id;
    res.json(
      successResponse(
        await goLivePlatformService.completeLaunch(req.body.launchExecutionId, req.body, actorId),
      ),
    );
  },

  async reports(_req: Request, res: Response) {
    res.json(successResponse(await goLivePlatformService.getReports()));
  },

  async status(req: Request, res: Response) {
    res.json(successResponse(await goLiveExecutionService.getStatus(req.query.launchExecutionId as string | undefined)));
  },

  async events(req: Request, res: Response) {
    res.json(successResponse(await goLiveExecutionService.listEvents(req.query.launchExecutionId as string | undefined, req.query as never)));
  },

  async createEvent(req: Request, res: Response) {
    res.status(201).json(successResponse(await goLiveExecutionService.createEvent(req.user!.id, req.body)));
  },

  async advanceWorkflow(req: Request, res: Response) {
    res.json(successResponse(await goLiveExecutionService.advanceWorkflowStep(req.user!.id, req.body.launchExecutionId, req.body.notes)));
  },

  async runSmokeTests(req: Request, res: Response) {
    res.json(successResponse(await goLiveExecutionService.runSmokeTests(req.user!.id, req.body?.launchExecutionId)));
  },

  async incidents(req: Request, res: Response) {
    res.json(successResponse(await goLiveExecutionService.listIncidents(req.query.launchExecutionId as string | undefined, req.query as never)));
  },

  async createIncident(req: Request, res: Response) {
    res.status(201).json(successResponse(await goLiveExecutionService.createIncident(req.user!.id, req.body)));
  },

  async updateIncident(req: Request, res: Response) {
    res.json(successResponse(await goLiveExecutionService.updateIncident(req.user!.id, String(req.params.incidentId), req.body)));
  },

  async metrics(req: Request, res: Response) {
    res.json(successResponse(await goLiveExecutionService.listMetrics(req.query.launchExecutionId as string | undefined, req.query as never)));
  },

  async snapshotMetrics(req: Request, res: Response) {
    res.json(successResponse(await goLiveExecutionService.snapshotMetrics(req.user!.id, req.body?.launchExecutionId)));
  },

  async warRoom(req: Request, res: Response) {
    res.json(successResponse(await goLiveExecutionService.getWarRoom(req.query.launchExecutionId as string | undefined)));
  },

  async activateWarRoom(req: Request, res: Response) {
    res.json(successResponse(await goLiveExecutionService.activateWarRoom(req.user!.id, req.body.launchExecutionId)));
  },

  async executionReports(req: Request, res: Response) {
    res.json(successResponse(await goLiveExecutionService.getExecutionReports(req.query.launchExecutionId as string | undefined)));
  },
};
