import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { voiceSessionService } from '../services/voice-session.service.js';
import type { RequestContext } from '../types/voice-ai.types.js';

function ctx(req: Request): RequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

function sessionId(req: Request): string {
  return String(req.params.sessionId);
}

export const voiceAiController = {
  health: async (_req: Request, res: Response) => {
    res.json(successResponse({ module: 'voice-ai', status: 'ok', sttEnabled: false, ttsClient: 'device' }));
  },

  createSession: async (req: Request, res: Response) => {
    res.status(201).json(successResponse(await voiceSessionService.createSession(req.user!, req.body, ctx(req))));
  },

  getSession: async (req: Request, res: Response) => {
    res.json(successResponse(await voiceSessionService.getSession(sessionId(req), req.user!.id)));
  },

  endSession: async (req: Request, res: Response) => {
    res.json(successResponse(await voiceSessionService.endSession(sessionId(req), req.user!, ctx(req))));
  },

  receiveAudio: async (req: Request, res: Response) => {
    res.json(
      successResponse(await voiceSessionService.receiveAudio(sessionId(req), req.user!, req.body, ctx(req))),
    );
  },

  sendMessage: async (req: Request, res: Response) => {
    res.json(
      successResponse(await voiceSessionService.sendMessage(sessionId(req), req.user!, req.body, ctx(req))),
    );
  },
};
