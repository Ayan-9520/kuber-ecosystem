import { apiGet } from '@/lib/api';

export interface AiPlatformHealth {
  status: string;
  version: string;
  openaiConfigured: boolean;
  completionAvailable: boolean;
  embeddingProvider: string;
  activeModels: number;
  features: string[];
}

export interface AiUsageAnalytics {
  totalRequests: number;
  totalTokens: number;
  avgLatencyMs: number;
  errorRate: number;
  totalCost: number;
  byModule: Record<string, number>;
  byRequestType: Record<string, number>;
  topModels: Array<{ model: string; count: number; tokens: number }>;
}

export interface AiCostAnalytics {
  totalCost: number;
  currency: string;
  byModule: Record<string, number>;
  byModel: Record<string, number>;
}

export const aiPlatformService = {
  health: () => apiGet<AiPlatformHealth>('/ai/platform/health'),
  models: (params?: Record<string, unknown>) => apiGet<{ items: Array<Record<string, unknown>>; meta: { total: number } }>('/ai/platform/models', params),
  prompts: (params?: Record<string, unknown>) => apiGet<Array<Record<string, unknown>>>('/ai/platform/prompts', params),
  usage: () => apiGet<AiUsageAnalytics>('/ai/platform/usage'),
  costs: () => apiGet<AiCostAnalytics>('/ai/platform/costs'),
  errors: () => apiGet<{ items: Array<Record<string, unknown>> }>('/ai/platform/errors'),
};
