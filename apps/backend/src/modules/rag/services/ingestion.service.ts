import type { z } from 'zod';

import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { DEFAULT_VECTOR_INDEX } from '../constants/rag.constants.js';
import { embeddingProvider } from '../providers/embedding/embedding.factory.js';
import { vectorStore } from '../providers/vector-store/vector-store.factory.js';
import { ragRepository } from '../repositories/rag.repository.js';
import type { RequestContext } from '../types/rag.types.js';
import type { ingestSchema, ingestArticleSchema, ingestAllPublishedSchema } from '../validators/rag.validator.js';

import { chunkingService } from './chunking.service.js';

type IngestInput = z.infer<typeof ingestSchema>;
type IngestArticleInput = z.infer<typeof ingestArticleSchema>;
type IngestAllInput = z.infer<typeof ingestAllPublishedSchema>;

async function processDocument(documentId: string, text: string, version: number) {
  await ragRepository.updateDocument(documentId, { ingestionStatus: 'CHUNKING', status: 'PROCESSING' });

  await ragRepository.deleteChunksByDocument(documentId);
  await ragRepository.deleteEmbeddingsByDocument(documentId);
  await vectorStore.deleteByDocument(documentId);

  const extracted = chunkingService.extractText('TXT', text);
  const chunks = chunkingService.chunk(extracted, version);

  const vectorIndex = await ragRepository.getOrCreateVectorIndex(
    DEFAULT_VECTOR_INDEX,
    vectorStore.name,
    embeddingProvider.dimensions,
  );

  await ragRepository.updateDocument(documentId, { ingestionStatus: 'EMBEDDING' });

  const texts = chunks.map((c) => c.content);
  const embeddings = texts.length > 0 ? await embeddingProvider.embed(texts) : [];

  await ragRepository.updateDocument(documentId, { ingestionStatus: 'INDEXING' });

  let embeddingCount = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    const embedding = embeddings[i] ?? [];

    const created = await ragRepository.createChunk({
      document: { connect: { id: documentId } },
      chunkIndex: chunk.index,
      content: chunk.content,
      tokenCount: chunk.tokenCount,
      version,
      startOffset: chunk.startOffset,
      endOffset: chunk.endOffset,
    });

    await ragRepository.createEmbedding({
      document: { connect: { id: documentId } },
      chunk: { connect: { id: created.id } },
      vectorIndex: { connect: { id: vectorIndex.id } },
      provider: embeddingProvider.name,
      model: embeddingProvider.model,
      dimensions: embeddingProvider.dimensions,
      embedding: embedding as never,
      version,
    });

    await vectorStore.upsert(created.id, documentId, embedding);
    embeddingCount++;
  }

  await ragRepository.updateDocument(documentId, {
    status: 'INDEXED',
    ingestionStatus: 'COMPLETED',
    chunkCount: chunks.length,
    embeddingCount,
    indexedAt: new Date(),
    contentHash: chunkingService.contentHash(extracted),
    errorMessage: null,
  });

  await ragRepository.updateVectorIndexStats(vectorIndex.id, 1, chunks.length);

  return { documentId, chunkCount: chunks.length, embeddingCount };
}

export const ingestionService = {
  async ingest(input: IngestInput, actorId: string, _ctx: RequestContext) {
    const text = chunkingService.extractText(input.sourceType, input.content, input.mimeType);
    const existing = input.sourceId
      ? await ragRepository.findDocumentBySource(input.sourceType, input.sourceId)
      : null;
    const version = existing ? existing.version + 1 : 1;

    const doc = await ragRepository.createDocument({
      title: input.title,
      sourceType: input.sourceType as never,
      sourceId: input.sourceId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      rawContent: text,
      categoryCode: input.categoryCode,
      productCode: input.productCode,
      lenderCode: input.lenderCode,
      version,
      createdById: actorId,
      metadata: input.metadata as never,
    });

    return processDocument(doc.id, text, version);
  },

  async ingestArticle(input: IngestArticleInput, actorId: string, ctx: RequestContext) {
    const article = await prisma.knowledgeArticle.findUnique({
      where: { id: input.articleId },
      include: { category: true },
    });
    if (!article) throw new NotFoundError('KnowledgeArticle', input.articleId);
    if (article.status !== 'PUBLISHED' && !input.force) {
      return { skipped: true, reason: 'Article not published' };
    }

    const content = [article.title, article.summary ?? '', article.content].filter(Boolean).join('\n\n');

    return this.ingest(
      {
        title: article.title,
        sourceType: mapContentType(article.contentType),
        sourceId: article.id,
        content,
        categoryCode: article.category?.code,
        productCode: article.productCode ?? undefined,
        lenderCode: article.lenderCode ?? undefined,
        metadata: { slug: article.slug, articleVersion: article.currentVersion },
      },
      actorId,
      ctx,
    );
  },

  async ingestAllPublished(input: IngestAllInput, actorId: string, ctx: RequestContext) {
    const articles = await prisma.knowledgeArticle.findMany({
      where: { status: 'PUBLISHED' },
      take: input.limit,
      orderBy: { updatedAt: 'desc' },
    });

    const results = [];
    for (const article of articles) {
      try {
        const result = await this.ingestArticle({ articleId: article.id }, actorId, ctx);
        results.push({ articleId: article.id, ...result });
      } catch (err) {
        results.push({ articleId: article.id, error: String(err) });
      }
    }
    return { processed: results.length, results };
  },

  async list(query: { page: number; limit: number; status?: string }) {
    const where = query.status ? { status: query.status as never } : {};
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      ragRepository.listDocuments(where, skip, query.limit),
      ragRepository.countDocuments(where),
    ]);
    return { items, meta: { total, page: query.page, limit: query.limit } };
  },

  async getDocument(id: string) {
    const doc = await ragRepository.findDocumentById(id);
    if (!doc) throw new NotFoundError('KnowledgeDocument', id);
    return doc;
  },
};

function mapContentType(ct: string): IngestInput['sourceType'] {
  const map: Record<string, IngestInput['sourceType']> = {
    POLICY: 'POLICY',
    FAQ: 'FAQ',
    SOP: 'SOP',
    SCRIPT: 'SOP',
    TRAINING_MATERIAL: 'SOP',
    ARTICLE: 'KNOWLEDGE_ARTICLE',
  };
  return map[ct] ?? 'KNOWLEDGE_ARTICLE';
}
