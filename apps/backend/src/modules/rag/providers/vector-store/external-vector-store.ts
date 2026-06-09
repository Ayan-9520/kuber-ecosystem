import { env } from '../../../../config/env.js';
import { AppError } from '../../../../shared/errors/app-error.js';
import type { VectorSearchResult, VectorStoreProvider } from '../../types/rag.types.js';

function notConfigured(provider: string): never {
  throw new AppError(
    501,
    'VECTOR_STORE_NOT_CONFIGURED',
    `${provider} vector store is not configured. Set VECTOR_DB_URL and VECTOR_DB_API_KEY.`,
  );
}

export class QdrantVectorStore implements VectorStoreProvider {
  readonly name = 'QDRANT' as const;
  async upsert(): Promise<string> { return notConfigured('Qdrant'); }
  async search(): Promise<VectorSearchResult[]> { return notConfigured('Qdrant'); }
  async deleteByDocument(): Promise<void> { notConfigured('Qdrant'); }
}

export class PineconeVectorStore implements VectorStoreProvider {
  readonly name = 'PINECONE' as const;
  async upsert(): Promise<string> { return notConfigured('Pinecone'); }
  async search(): Promise<VectorSearchResult[]> { return notConfigured('Pinecone'); }
  async deleteByDocument(): Promise<void> { notConfigured('Pinecone'); }
}

export class WeaviateVectorStore implements VectorStoreProvider {
  readonly name = 'WEAVIATE' as const;
  async upsert(): Promise<string> { return notConfigured('Weaviate'); }
  async search(): Promise<VectorSearchResult[]> { return notConfigured('Weaviate'); }
  async deleteByDocument(): Promise<void> { notConfigured('Weaviate'); }
}

export class PgVectorStore implements VectorStoreProvider {
  readonly name = 'PGVECTOR' as const;
  async upsert(): Promise<string> {
    if (!env.VECTOR_DB_URL?.includes('postgres')) notConfigured('pgvector');
    return notConfigured('pgvector');
  }
  async search(): Promise<VectorSearchResult[]> { return notConfigured('pgvector'); }
  async deleteByDocument(): Promise<void> { notConfigured('pgvector'); }
}
