import type {
  AiModelCapability,
  AiModuleSource,
  AiRequestType,
} from '@kuberone/database';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions.js';

export type { AiModelCapability, AiModuleSource, AiRequestType };

export interface PlatformRequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface CompletionInput {
  module: AiModuleSource;
  messages: ChatCompletionMessageParam[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: ChatCompletionTool[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  structured?: boolean;
  jsonSchema?: Record<string, unknown>;
  fallback?: () => CompletionResult;
}

export interface CompletionResult {
  content: string;
  model: string;
  provider: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  latencyMs: number;
  requestId?: string;
  toolCalls?: Array<{ id: string; name: string; arguments: string }>;
  structured?: Record<string, unknown>;
  usedFallback?: boolean;
}

export interface EmbeddingInput {
  module: AiModuleSource;
  texts: string[];
  model?: string;
}

export interface EmbeddingResult {
  embeddings: number[][];
  model: string;
  provider: string;
  dimensions: number;
  totalTokens?: number;
  latencyMs: number;
  requestId?: string;
}

export interface TranscriptionInput {
  module: AiModuleSource;
  audioBuffer: Buffer;
  mimeType?: string;
  language?: string;
}

export interface TranscriptionResult {
  text: string;
  model: string;
  latencyMs: number;
  requestId?: string;
}

export interface SpeechInput {
  module: AiModuleSource;
  text: string;
  voice?: string;
  model?: string;
}

export interface SpeechResult {
  audioBuffer: Buffer;
  model: string;
  voice: string;
  latencyMs: number;
  requestId?: string;
}

export interface PlatformContextInput {
  module: AiModuleSource;
  userId: string;
  customerId?: string;
  leadId?: string;
  applicationId?: string;
  productCode?: string;
  lenderCode?: string;
  ragQuery?: string;
  roleCodes?: string[];
}

export interface PlatformContextResult {
  customer?: Record<string, unknown>;
  lead?: Record<string, unknown>;
  application?: Record<string, unknown>;
  knowledgeSnippets: string[];
  ragSnippets: string[];
  roleContext: string[];
  combinedContext: string;
}

export interface UsageAnalytics {
  totalRequests: number;
  totalTokens: number;
  avgLatencyMs: number;
  errorRate: number;
  totalCost: number;
  byModule: Record<string, number>;
  byRequestType: Record<string, number>;
  topModels: Array<{ model: string; count: number; tokens: number }>;
}

export interface CostAnalytics {
  totalCost: number;
  currency: string;
  byModule: Record<string, number>;
  byModel: Record<string, number>;
  dailyCosts: Array<{ date: string; cost: number }>;
}

export interface PlatformHealth {
  status: 'ok' | 'degraded' | 'unavailable';
  version: string;
  openaiConfigured: boolean;
  activeModels: number;
  embeddingProvider: string;
  modules: string[];
}
