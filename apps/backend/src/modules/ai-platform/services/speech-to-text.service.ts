import type { PlatformRequestContext, TranscriptionInput, TranscriptionResult } from '../types/ai-platform.types.js';

import { modelRoutingService } from './model-routing.service.js';
import { openAiClientService } from './openai-client.service.js';
import { usageTrackingService } from './usage-tracking.service.js';


export const speechToTextService = {
  isAvailable(): boolean {
    return openAiClientService.isConfigured();
  },

  async transcribe(input: TranscriptionInput, ctx?: PlatformRequestContext): Promise<TranscriptionResult> {
    const start = Date.now();
    const { primary: model } = await modelRoutingService.resolveModel(input.module, 'TRANSCRIPTION');

    const aiRequest = await usageTrackingService.startRequest({
      userId: ctx?.actorId,
      module: input.module,
      requestType: 'TRANSCRIPTION',
      modelCode: model,
      ctx,
    });

    if (!openAiClientService.isConfigured()) {
      await usageTrackingService.completeRequest(aiRequest.id, {
        status: 'FAILED',
        modelCode: model,
        latencyMs: Date.now() - start,
        errorCode: 'STT_UNAVAILABLE',
        errorMessage: 'OpenAI not configured for speech-to-text',
      });
      return {
        text: '',
        model: 'device-stt',
        latencyMs: Date.now() - start,
        requestId: aiRequest.id,
      };
    }

    const client = openAiClientService.getClient()!;
    const file = new File([input.audioBuffer], 'audio.webm', { type: input.mimeType ?? 'audio/webm' });
    const result = await client.audio.transcriptions.create({
      file,
      model,
      language: input.language,
    });

    const latencyMs = Date.now() - start;
    await usageTrackingService.completeRequest(aiRequest.id, {
      status: 'SUCCESS',
      modelCode: model,
      latencyMs,
      content: result.text,
    });
    await usageTrackingService.logUsage({
      requestId: aiRequest.id,
      userId: ctx?.actorId,
      module: input.module,
      requestType: 'TRANSCRIPTION',
      modelCode: model,
      inputTokens: 0,
      outputTokens: result.text.length,
      latencyMs,
    });

    return { text: result.text, model, latencyMs, requestId: aiRequest.id };
  },
};
