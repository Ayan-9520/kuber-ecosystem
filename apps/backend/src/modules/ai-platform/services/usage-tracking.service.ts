import type { AiModuleSource, AiRequestType } from '@kuberone/database';

import { MODEL_COSTS } from '../constants/ai-platform.constants.js';
import { aiPlatformRepository } from '../repositories/ai-platform.repository.js';
import type { CostAnalytics, PlatformRequestContext, UsageAnalytics } from '../types/ai-platform.types.js';

function estimateCost(model: string, inputTokens: number, outputTokens: number) {
  const rates = MODEL_COSTS[model] ?? { input: 0.001, output: 0.002 };
  const inputCost = (inputTokens / 1000) * rates.input;
  const outputCost = (outputTokens / 1000) * rates.output;
  return { inputCost, outputCost, totalCost: inputCost + outputCost };
}

export const usageTrackingService = {
  async startRequest(params: {
    userId?: string;
    module: AiModuleSource;
    requestType: AiRequestType;
    modelCode?: string;
    ctx?: PlatformRequestContext;
    metadata?: Record<string, unknown>;
  }) {
    return aiPlatformRepository.createRequest({
      userId: params.userId,
      module: params.module,
      requestType: params.requestType,
      status: 'PENDING',
      modelCode: params.modelCode,
      providerCode: 'openai',
      ipAddress: params.ctx?.ipAddress,
      requestId: params.ctx?.requestId,
      metadata: params.metadata as never,
    });
  },

  async completeRequest(
    requestId: string,
    params: {
      status: 'SUCCESS' | 'FAILED' | 'FALLBACK';
      modelCode: string;
      inputTokens?: number;
      outputTokens?: number;
      latencyMs: number;
      errorCode?: string;
      errorMessage?: string;
      content?: string;
      structured?: Record<string, unknown>;
      embedding?: number[][];
      toolCalls?: unknown;
      piiMasked?: boolean;
    },
  ) {
    await aiPlatformRepository.updateRequest(requestId, {
      status: params.status,
      modelCode: params.modelCode,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      latencyMs: params.latencyMs,
      errorCode: params.errorCode,
      errorMessage: params.errorMessage,
    });

    if (params.content || params.structured || params.embedding) {
      await aiPlatformRepository.createResponse({
        request: { connect: { id: requestId } },
        content: params.content,
        structured: params.structured as never,
        embedding: params.embedding as never,
        toolCalls: params.toolCalls as never,
        piiMasked: params.piiMasked ?? false,
      });
    }
  },

  async logUsage(params: {
    requestId?: string;
    userId?: string;
    module: AiModuleSource;
    requestType: AiRequestType;
    modelCode: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs?: number;
    success?: boolean;
  }) {
    const totalTokens = params.inputTokens + params.outputTokens;
    await aiPlatformRepository.createUsageLog({
      request: params.requestId ? { connect: { id: params.requestId } } : undefined,
      userId: params.userId,
      module: params.module,
      requestType: params.requestType,
      modelCode: params.modelCode,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      totalTokens,
      latencyMs: params.latencyMs,
      success: params.success ?? true,
    });

    const costs = estimateCost(params.modelCode, params.inputTokens, params.outputTokens);
    await aiPlatformRepository.createCostLog({
      request: params.requestId ? { connect: { id: params.requestId } } : undefined,
      userId: params.userId,
      module: params.module,
      modelCode: params.modelCode,
      inputCost: costs.inputCost,
      outputCost: costs.outputCost,
      totalCost: costs.totalCost,
    });
  },

  async getUsageAnalytics(): Promise<UsageAnalytics> {
    const [agg, byModule, byType, topModels, total, failed] = await Promise.all([
      aiPlatformRepository.aggregateUsage(),
      aiPlatformRepository.usageByModule(),
      aiPlatformRepository.usageByRequestType(),
      aiPlatformRepository.topModelsByUsage(5),
      aiPlatformRepository.countRequests(),
      aiPlatformRepository.countFailedRequests(),
    ]);

    const byModuleMap: Record<string, number> = {};
    for (const row of byModule) byModuleMap[row.module] = row._count.id;

    const byTypeMap: Record<string, number> = {};
    for (const row of byType) byTypeMap[row.requestType] = row._count.id;

    const costAgg = await aiPlatformRepository.aggregateCosts();

    return {
      totalRequests: total,
      totalTokens: agg._sum.totalTokens ?? 0,
      avgLatencyMs: Math.round(agg._avg.latencyMs ?? 0),
      errorRate: total > 0 ? Math.round((failed / total) * 100) : 0,
      totalCost: Number(costAgg._sum.totalCost ?? 0),
      byModule: byModuleMap,
      byRequestType: byTypeMap,
      topModels: topModels.map((m) => ({
        model: m.modelCode,
        count: m._count.id,
        tokens: m._sum.totalTokens ?? 0,
      })),
    };
  },

  async getCostAnalytics(): Promise<CostAnalytics> {
    const [agg, byModule, byModel] = await Promise.all([
      aiPlatformRepository.aggregateCosts(),
      aiPlatformRepository.costsByModule(),
      aiPlatformRepository.costsByModel(),
    ]);

    const moduleMap: Record<string, number> = {};
    for (const row of byModule) moduleMap[row.module] = Number(row._sum.totalCost ?? 0);

    const modelMap: Record<string, number> = {};
    for (const row of byModel) modelMap[row.modelCode] = Number(row._sum.totalCost ?? 0);

    return {
      totalCost: Number(agg._sum.totalCost ?? 0),
      currency: 'USD',
      byModule: moduleMap,
      byModel: modelMap,
      dailyCosts: [],
    };
  },

  async getRecentErrors() {
    return aiPlatformRepository.recentErrors();
  },
};
