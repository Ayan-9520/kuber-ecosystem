import type { RagEmbeddingProvider, RagQuerySource, RagVectorProvider } from '@kuberone/database';

export type { RagEmbeddingProvider, RagQuerySource, RagVectorProvider };

export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface ChunkResult {
  index: number;
  content: string;
  startOffset: number;
  endOffset: number;
  tokenCount: number;
}

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  score: number;
  categoryCode?: string | null;
  productCode?: string | null;
  lenderCode?: string | null;
  sourceType?: string;
}

export interface RagContextResult {
  snippets: string[];
  chunks: RetrievedChunk[];
  policies: string[];
  faqs: string[];
  sops: string[];
  lenderRules: string[];
  eligibilityRules: string[];
  source: RagQuerySource;
  generatedAt: string;
}

export interface RagQueryResult {
  queryId: string;
  answer: string;
  context: RagContextResult;
  responseId: string;
  model?: string;
  provider?: string;
  tokensUsed?: number;
  latencyMs: number;
}

export interface RagAnalyticsSummary {
  totalQueries: number;
  totalRetrievals: number;
  avgLatencyMs: number;
  avgFeedbackRating: number;
  retrievalAccuracy: number;
  searchEffectiveness: number;
  topDocuments: Array<{ id: string; title: string; retrievalCount: number }>;
  topCategories: Array<{ code: string; count: number }>;
  queriesBySource: Record<string, number>;
}

export interface EmbeddingProvider {
  readonly name: RagEmbeddingProvider;
  readonly model: string;
  readonly dimensions: number;
  embed(texts: string[]): Promise<number[][]>;
}

export interface VectorSearchResult {
  chunkId: string;
  documentId: string;
  score: number;
  embeddingId: string;
}

export interface VectorStoreProvider {
  readonly name: RagVectorProvider;
  upsert(chunkId: string, documentId: string, embedding: number[], metadata?: Record<string, unknown>): Promise<string>;
  search(queryEmbedding: number[], topK: number, filters?: Record<string, unknown>): Promise<VectorSearchResult[]>;
  deleteByDocument(documentId: string): Promise<void>;
  sync?(): Promise<void>;
}
