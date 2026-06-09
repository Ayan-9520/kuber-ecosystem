import type { AuthenticatedUser } from '@kuberone/shared-types';

import { env } from '../../../config/env.js';
import { AppError } from '../../../shared/errors/app-error.js';
import type { CompletionInput, CompletionResult, PlatformRequestContext } from '../types/ai-platform.types.js';

import { modelRoutingService } from './model-routing.service.js';
import { moderationService } from './moderation.service.js';
import { openAiClientService } from './openai-client.service.js';
import { responseProcessorService } from './response-processor.service.js';
import { rulesEngineService } from './rules-engine.service.js';
import { usageTrackingService } from './usage-tracking.service.js';

export const completionService = {
  isAvailable(): boolean {
    return openAiClientService.isConfigured();
  },

  async chat(
    input: CompletionInput,
    ctx?: PlatformRequestContext,
    _actor?: AuthenticatedUser,
  ): Promise<CompletionResult> {
    const start = Date.now();
    const userText = input.messages.filter((m) => m.role === 'user').map((m) => String(m.content)).join('\n');
    const sanitized = responseProcessorService.sanitizeInput(userText);

    const moderation = await moderationService.moderate(sanitized, {
      userId: ctx?.actorId,
      module: input.module,
    });
    if (moderation.action === 'block') {
      throw new AppError(400, 'CONTENT_MODERATED', 'Input flagged by content moderation');
    }

    const { primary, fallback } = await modelRoutingService.resolveModel(
      input.module,
      input.tools?.length ? 'FUNCTION_CALLING' : 'CHAT',
      input.model,
    );

    const aiRequest = await usageTrackingService.startRequest({
      userId: ctx?.actorId,
      module: input.module,
      requestType: input.tools?.length ? 'FUNCTION_CALL' : 'CHAT',
      modelCode: primary,
      ctx,
    });

    if (!openAiClientService.isConfigured()) {
      if (input.fallback) {
        const result = input.fallback();
        await usageTrackingService.completeRequest(aiRequest.id, {
          status: 'FALLBACK',
          modelCode: result.model,
          latencyMs: Date.now() - start,
          content: result.content,
        });
        return { ...result, requestId: aiRequest.id, usedFallback: true };
      }
      const fallback = rulesEngineService.fallbackReply({ userMessage: sanitized });
      await usageTrackingService.completeRequest(aiRequest.id, {
        status: 'FALLBACK',
        modelCode: fallback.model,
        latencyMs: Date.now() - start,
        content: fallback.content,
      });
      return { ...fallback, requestId: aiRequest.id };
    }

    const client = openAiClientService.getClient()!;
    const modelsToTry = [primary, fallback].filter((m, i, arr) => arr.indexOf(m) === i);

    for (const model of modelsToTry) {
      try {
        const completion = await client.chat.completions.create({
          model,
          messages: input.messages.map((m) =>
            m.role === 'user' ? { ...m, content: responseProcessorService.sanitizeInput(String(m.content)) } : m,
          ),
          temperature: input.temperature ?? env.OPENAI_TEMPERATURE ?? 0.35,
          max_tokens: input.maxTokens ?? env.OPENAI_MAX_TOKENS ?? 1200,
          tools: input.tools,
          tool_choice: input.toolChoice,
          ...(input.structured
            ? { response_format: { type: 'json_object' as const } }
            : {}),
        });

        const choice = completion.choices[0];
        const toolCalls = choice?.message?.tool_calls?.map((tc) => ({
          id: tc.id,
          name: tc.function.name,
          arguments: tc.function.arguments,
        }));

        let content = choice?.message?.content?.trim() ?? '';
        if (!content && !toolCalls?.length) {
          throw new AppError(503, 'AI_EMPTY_RESPONSE', 'Empty response from OpenAI');
        }

        const processed = responseProcessorService.processOutput(content, { maskPii: true });
        content = processed.content;

        const latencyMs = Date.now() - start;
        const inputTokens = completion.usage?.prompt_tokens ?? 0;
        const outputTokens = completion.usage?.completion_tokens ?? 0;

        await usageTrackingService.completeRequest(aiRequest.id, {
          status: 'SUCCESS',
          modelCode: model,
          inputTokens,
          outputTokens,
          latencyMs,
          content,
          toolCalls,
          piiMasked: processed.piiMasked,
        });
        await usageTrackingService.logUsage({
          requestId: aiRequest.id,
          userId: ctx?.actorId,
          module: input.module,
          requestType: input.tools?.length ? 'FUNCTION_CALL' : 'CHAT',
          modelCode: model,
          inputTokens,
          outputTokens,
          latencyMs,
        });

        let structured: Record<string, unknown> | undefined;
        if (input.structured && content) {
          try {
            structured = JSON.parse(content) as Record<string, unknown>;
          } catch {
            /* non-json response */
          }
        }

        return {
          content,
          model,
          provider: 'openai',
          inputTokens,
          outputTokens,
          totalTokens: completion.usage?.total_tokens,
          latencyMs,
          requestId: aiRequest.id,
          toolCalls,
          structured,
        };
      } catch (err) {
        if (model === modelsToTry[modelsToTry.length - 1]) {
          if (input.fallback) {
            const result = input.fallback();
            await usageTrackingService.completeRequest(aiRequest.id, {
              status: 'FALLBACK',
              modelCode: result.model,
              latencyMs: Date.now() - start,
              content: result.content,
              errorMessage: String(err),
            });
            return { ...result, requestId: aiRequest.id, usedFallback: true };
          }

          await usageTrackingService.completeRequest(aiRequest.id, {
            status: 'FAILED',
            modelCode: model,
            latencyMs: Date.now() - start,
            errorCode: 'COMPLETION_FAILED',
            errorMessage: String(err),
          });
          throw err;
        }
      }
    }

    throw new AppError(503, 'AI_UNAVAILABLE', 'All models failed');
  },
};
