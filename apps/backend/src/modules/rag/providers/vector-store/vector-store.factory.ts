import { env } from '../../../../config/env.js';
import type { VectorStoreProvider } from '../../types/rag.types.js';

import { PgVectorStore, PineconeVectorStore, QdrantVectorStore, WeaviateVectorStore } from './external-vector-store.js';
import { LocalVectorStore } from './local-vector-store.js';

export function createVectorStore(): VectorStoreProvider {
  const provider = env.VECTOR_DB_PROVIDER ?? 'local';

  switch (provider) {
    case 'qdrant':
      return new QdrantVectorStore();
    case 'pinecone':
      return new PineconeVectorStore();
    case 'weaviate':
      return new WeaviateVectorStore();
    case 'pgvector':
      return new PgVectorStore();
    default:
      return new LocalVectorStore();
  }
}

export const vectorStore = createVectorStore();
