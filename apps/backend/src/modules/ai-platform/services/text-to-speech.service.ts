import { env } from '../../../config/env.js';
import type { PlatformRequestContext, SpeechInput, SpeechResult } from '../types/ai-platform.types.js';

import { modelRoutingService } from './model-routing.service.js';
import { openAiClientService } from './openai-client.service.js';
import { usageTrackingService } from './usage-tracking.service.js';


export const textToSpeechService = {
  isAvailable(): boolean {
    return openAiClientService.isConfigured();
  },

  async synthesize(input: SpeechInput, ctx?: PlatformRequestContext): Promise<SpeechResult> {
    const start = Date.now();
    const { primary: model } = await modelRoutingService.resolveModel(input.module, 'TTS', input.model);
    const voice = input.voice ?? env.OPENAI_TTS_VOICE ?? 'alloy';

    const aiRequest = await usageTrackingService.startRequest({
      userId: ctx?.actorId,
      module: input.module,
      requestType: 'TTS',
      modelCode: model,
      ctx,
    });

    if (!openAiClientService.isConfigured()) {
      await usageTrackingService.completeRequest(aiRequest.id, {
        status: 'FAILED',
        modelCode: model,
        latencyMs: Date.now() - start,
        errorCode: 'TTS_UNAVAILABLE',
        errorMessage: 'OpenAI not configured for text-to-speech',
      });
      return {
        audioBuffer: Buffer.alloc(0),
        model: 'device-tts',
        voice,
        latencyMs: Date.now() - start,
        requestId: aiRequest.id,
      };
    }

    const client = openAiClientService.getClient()!;
    const response = await client.audio.speech.create({
      model,
      voice: voice as 'alloy',
      input: input.text,
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const latencyMs = Date.now() - start;

    await usageTrackingService.completeRequest(aiRequest.id, {
      status: 'SUCCESS',
      modelCode: model,
      latencyMs,
      content: `[audio ${audioBuffer.length} bytes]`,
    });
    await usageTrackingService.logUsage({
      requestId: aiRequest.id,
      userId: ctx?.actorId,
      module: input.module,
      requestType: 'TTS',
      modelCode: model,
      inputTokens: input.text.length,
      outputTokens: 0,
      latencyMs,
    });

    return { audioBuffer, model, voice, latencyMs, requestId: aiRequest.id };
  },
};
