import type { Request, Response } from 'express';

import { successResponse } from '../../../shared/responses/success-response.js';
import { AI_PLATFORM_VERSION } from '../constants/ai-platform.constants.js';
import { completionService } from '../services/completion.service.js';
import { aiPlatformContextBuilderService } from '../services/context-builder.service.js';
import { embeddingService } from '../services/embedding.service.js';
import { functionCallingService } from '../services/function-calling.service.js';
import { modelRoutingService } from '../services/model-routing.service.js';
import { openAiClientService } from '../services/openai-client.service.js';
import { aiPlatformPromptBuilderService } from '../services/prompt-builder.service.js';
import { speechToTextService } from '../services/speech-to-text.service.js';
import { textToSpeechService } from '../services/text-to-speech.service.js';
import { usageTrackingService } from '../services/usage-tracking.service.js';
import type { PlatformRequestContext } from '../types/ai-platform.types.js';

function ctx(req: Request): PlatformRequestContext {
  return {
    actorId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
}

export const aiPlatformController = {
  health: async (_req: Request, res: Response) => {
    const models = await modelRoutingService.listActiveModels();
    res.json(successResponse({
      module: 'ai-platform',
      status: openAiClientService.isConfigured() ? 'ok' : 'degraded',
      version: AI_PLATFORM_VERSION,
      openaiConfigured: openAiClientService.isConfigured(),
      completionAvailable: completionService.isAvailable(),
      embeddingProvider: embeddingService.providerName,
      activeModels: models.length,
      features: ['chat', 'completion', 'embedding', 'transcribe', 'speech', 'function_calling', 'moderation'],
    }));
  },

  chat: async (req: Request, res: Response) => {
    const body = req.body as {
      module: string;
      messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
      model?: string;
      temperature?: number;
      maxTokens?: number;
      enableTools?: boolean;
      structured?: boolean;
      context?: Record<string, string>;
    };

    let messages = body.messages;
    if (body.context) {
      const built = await aiPlatformContextBuilderService.build({
        module: body.module as never,
        userId: req.user!.id,
        customerId: body.context.customerId,
        leadId: body.context.leadId,
        applicationId: body.context.applicationId,
        productCode: body.context.productCode,
        ragQuery: body.context.ragQuery,
      });
      const systemIdx = messages.findIndex((m) => m.role === 'system');
      const contextBlock = built.combinedContext;
      if (systemIdx >= 0) {
        messages = messages.map((m, i) =>
          i === systemIdx ? { ...m, content: `${m.content}\n\n${contextBlock}` } : m,
        );
      } else {
        messages = [{ role: 'system', content: contextBlock }, ...messages];
      }
    }

    const tools = body.enableTools ? functionCallingService.getTools() : undefined;
    const result = await completionService.chat(
      {
        module: body.module as never,
        messages,
        model: body.model,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
        tools,
        structured: body.structured,
      },
      ctx(req),
      req.user!,
    );

    if (result.toolCalls?.length) {
      for (const tc of result.toolCalls) {
        await functionCallingService.execute(tc.name, tc.arguments, req.user!, ctx(req));
      }
    }

    res.json(successResponse(result));
  },

  completion: async (req: Request, res: Response) => {
    return aiPlatformController.chat(req, res);
  },

  embedding: async (req: Request, res: Response) => {
    const body = req.body as { module: string; texts: string[]; model?: string };
    res.json(successResponse(await embeddingService.embed(
      { module: body.module as never, texts: body.texts, model: body.model },
      ctx(req),
    )));
  },

  transcribe: async (req: Request, res: Response) => {
    const body = req.body as { module?: string; language?: string; audioBase64?: string; mimeType?: string };
    const file = (req as Request & { file?: { buffer: Buffer; mimetype: string } }).file;
    const audioBuffer = file?.buffer ?? (body.audioBase64 ? Buffer.from(body.audioBase64, 'base64') : null);
    if (!audioBuffer?.length) {
      res.status(400).json({ success: false, error: { code: 'AUDIO_REQUIRED', message: 'Audio file or audioBase64 required' } });
      return;
    }
    res.json(successResponse(await speechToTextService.transcribe(
      {
        module: (body.module ?? 'VOICE_AI') as never,
        audioBuffer,
        mimeType: file?.mimetype ?? body.mimeType ?? 'audio/webm',
        language: body.language,
      },
      ctx(req),
    )));
  },

  speech: async (req: Request, res: Response) => {
    const body = req.body as { module: string; text: string; voice?: string; model?: string };
    const result = await textToSpeechService.synthesize(
      { module: body.module as never, text: body.text, voice: body.voice, model: body.model },
      ctx(req),
    );
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(result.audioBuffer);
  },

  models: async (req: Request, res: Response) => {
    const capability = (req.query as { capability?: string }).capability;
    const models = await modelRoutingService.listActiveModels();
    const filtered = capability
      ? models.filter((m) => m.capability === capability)
      : models;
    res.json(successResponse({ items: filtered, meta: { total: filtered.length } }));
  },

  prompts: async (req: Request, res: Response) => {
    const module = (req.query as { module?: string }).module as never;
    res.json(successResponse(await aiPlatformPromptBuilderService.listTemplates(module)));
  },

  usage: async (_req: Request, res: Response) => {
    res.json(successResponse(await usageTrackingService.getUsageAnalytics()));
  },

  costs: async (_req: Request, res: Response) => {
    res.json(successResponse(await usageTrackingService.getCostAnalytics()));
  },

  errors: async (_req: Request, res: Response) => {
    res.json(successResponse({ items: await usageTrackingService.getRecentErrors() }));
  },
};
