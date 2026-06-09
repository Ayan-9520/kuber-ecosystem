import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const ragRepository = {
  createDocument(data: Prisma.KnowledgeDocumentCreateInput) {
    return prisma.knowledgeDocument.create({ data });
  },

  updateDocument(id: string, data: Prisma.KnowledgeDocumentUpdateInput) {
    return prisma.knowledgeDocument.update({ where: { id }, data });
  },

  findDocumentById(id: string) {
    return prisma.knowledgeDocument.findUnique({
      where: { id },
      include: { chunks: { orderBy: { chunkIndex: 'asc' } } },
    });
  },

  findDocumentBySource(sourceType: string, sourceId: string) {
    return prisma.knowledgeDocument.findFirst({
      where: { sourceType: sourceType as never, sourceId },
      orderBy: { version: 'desc' },
    });
  },

  listDocuments(where: Prisma.KnowledgeDocumentWhereInput, skip: number, take: number) {
    return prisma.knowledgeDocument.findMany({ where, skip, take, orderBy: { updatedAt: 'desc' } });
  },

  countDocuments(where: Prisma.KnowledgeDocumentWhereInput) {
    return prisma.knowledgeDocument.count({ where });
  },

  deleteChunksByDocument(documentId: string, version?: number) {
    return prisma.knowledgeChunk.deleteMany({
      where: { documentId, ...(version !== undefined ? { version } : {}) },
    });
  },

  createChunk(data: Prisma.KnowledgeChunkCreateInput) {
    return prisma.knowledgeChunk.create({ data });
  },

  createEmbedding(data: Prisma.EmbeddingRecordCreateInput) {
    return prisma.embeddingRecord.create({ data });
  },

  deleteEmbeddingsByDocument(documentId: string) {
    return prisma.embeddingRecord.deleteMany({ where: { documentId } });
  },

  findEmbeddingsForSearch(filters?: { productCode?: string; lenderCode?: string; categoryCode?: string }) {
    return prisma.embeddingRecord.findMany({
      where: {
        document: {
          status: 'INDEXED',
          ...(filters?.productCode ? { productCode: filters.productCode } : {}),
          ...(filters?.lenderCode ? { lenderCode: filters.lenderCode } : {}),
          ...(filters?.categoryCode ? { categoryCode: filters.categoryCode } : {}),
        },
      },
      include: {
        chunk: true,
        document: { select: { id: true, title: true, sourceType: true, categoryCode: true, productCode: true, lenderCode: true } },
      },
    });
  },

  getOrCreateVectorIndex(name: string, provider: string, dimensions: number) {
    return prisma.vectorIndex.upsert({
      where: { name_provider: { name, provider: provider as never } },
      create: { name, provider: provider as never, dimensions, isActive: true },
      update: { dimensions, isActive: true },
    });
  },

  updateVectorIndexStats(id: string, documentCount: number, chunkCount: number) {
    return prisma.vectorIndex.update({
      where: { id },
      data: { documentCount, chunkCount, lastSyncedAt: new Date() },
    });
  },

  createQuery(data: Prisma.RagQueryCreateInput) {
    return prisma.ragQuery.create({ data });
  },

  createRetrievalLog(data: Prisma.RetrievalLogCreateInput) {
    return prisma.retrievalLog.create({ data });
  },

  createResponse(data: Prisma.RagResponseCreateInput) {
    return prisma.ragResponse.create({ data });
  },

  createFeedback(data: Prisma.RagFeedbackCreateInput) {
    return prisma.ragFeedback.create({ data });
  },

  countQueries(where?: Prisma.RagQueryWhereInput) {
    return prisma.ragQuery.count({ where });
  },

  countRetrievals(where?: Prisma.RetrievalLogWhereInput) {
    return prisma.retrievalLog.count({ where });
  },

  avgQueryLatency() {
    return prisma.ragQuery.aggregate({ _avg: { latencyMs: true } });
  },

  avgFeedbackRating() {
    return prisma.ragFeedback.aggregate({ _avg: { rating: true } });
  },

  queriesBySource() {
    return prisma.ragQuery.groupBy({ by: ['source'], _count: { id: true } });
  },

  topRetrievedDocuments(take = 10) {
    return prisma.knowledgeDocument.findMany({
      where: { status: 'INDEXED' },
      orderBy: { chunkCount: 'desc' },
      take,
      select: { id: true, title: true, categoryCode: true, chunkCount: true },
    });
  },

  upsertDailyAnalytics(date: Date, data: Prisma.RagAnalyticsUpdateInput) {
    return prisma.ragAnalytics.upsert({
      where: { date },
      create: { ...(data as Prisma.RagAnalyticsCreateInput), date },
      update: data,
    });
  },
};
