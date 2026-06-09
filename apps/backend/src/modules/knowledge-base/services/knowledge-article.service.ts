import type { z } from 'zod';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { knowledgeRepository } from '../repositories/knowledge.repository.js';
import type { KnowledgeArticleDetail, RequestContext } from '../types/knowledge-base.types.js';
import type { createArticleSchema, listArticlesQuerySchema, updateArticleSchema } from '../validators/knowledge.validator.js';

type CreateInput = z.infer<typeof createArticleSchema>;
type UpdateInput = z.infer<typeof updateArticleSchema>;
type ListQuery = z.infer<typeof listArticlesQuerySchema>;

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 180);
}

function mapSummary(a: {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  contentType: string;
  categoryId: string;
  status: string;
  currentVersion: number;
  viewCount: number;
  publishedAt: Date | null;
  productCode: string | null;
  lenderCode: string | null;
  category?: { name: string };
  articleTags?: Array<{ tag: { id: string; code: string; name: string } }>;
}) {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    contentType: a.contentType as never,
    categoryId: a.categoryId,
    categoryName: a.category?.name,
    status: a.status as never,
    currentVersion: a.currentVersion,
    viewCount: a.viewCount,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    productCode: a.productCode,
    lenderCode: a.lenderCode,
    tags: a.articleTags?.map((t) => t.tag),
  };
}

export const knowledgeArticleService = {
  async list(query: ListQuery) {
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.contentType ? { contentType: query.contentType } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.productCode ? { productCode: query.productCode } : {}),
      ...(query.lenderCode ? { lenderCode: query.lenderCode } : {}),
      ...(query.tagId ? { articleTags: { some: { tagId: query.tagId } } } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search } },
              { summary: { contains: query.search } },
              { searchKeywords: { contains: query.search } },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder } as never;

    const [items, total] = await Promise.all([
      knowledgeRepository.listArticles(where, skip, query.limit, orderBy),
      knowledgeRepository.countArticles(where),
    ]);

    return {
      items: items.map(mapSummary),
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async getById(id: string, ctx?: RequestContext, source?: string): Promise<KnowledgeArticleDetail> {
    const article = await knowledgeRepository.findArticleById(id);
    if (!article) throw new NotFoundError('KnowledgeArticle', id);

    if (ctx) {
      await knowledgeRepository.incrementViewCount(id);
      await knowledgeRepository.createView({
        article: { connect: { id } },
        userId: ctx.actorId,
        source,
        ipAddress: ctx.ipAddress,
      });
      await knowledgeRepository.createAudit({
        userId: ctx.actorId,
        action: 'VIEWED',
        entityType: 'article',
        entityId: id,
        ipAddress: ctx.ipAddress,
        requestId: ctx.requestId,
      });
    }

    return {
      ...mapSummary(article),
      content: article.content,
      searchKeywords: article.searchKeywords,
      department: article.department,
      riskCategory: article.riskCategory,
      authorId: article.authorId,
      versions: article.versions.map((v) => ({
        version: v.version,
        changeNotes: v.changeNotes,
        createdAt: v.createdAt.toISOString(),
      })),
      attachments: article.attachments.map((a) => ({
        id: a.id,
        fileName: a.fileName,
        fileType: a.fileType,
      })),
    };
  },

  async create(input: CreateInput, authorId: string, ctx: RequestContext) {
    const slug = input.slug ?? slugify(input.title);
    const existing = await knowledgeRepository.findArticleBySlug(slug);
    if (existing) throw new ConflictError(`Article slug "${slug}" already exists`);

    const category = await knowledgeRepository.findCategoryById(input.categoryId);
    if (!category) throw new NotFoundError('KnowledgeCategory', input.categoryId);

    const article = await knowledgeRepository.createArticle({
      slug,
      title: input.title,
      summary: input.summary,
      content: input.content,
      contentType: input.contentType,
      category: { connect: { id: input.categoryId } },
      searchKeywords: input.searchKeywords,
      department: input.department,
      productCode: input.productCode,
      lenderCode: input.lenderCode,
      riskCategory: input.riskCategory,
      authorId,
      status: 'DRAFT',
      currentVersion: 1,
    });

    await knowledgeRepository.createVersion({
      article: { connect: { id: article.id } },
      version: 1,
      title: input.title,
      summary: input.summary,
      content: input.content,
      changeNotes: 'Initial version',
      createdById: authorId,
    });

    if (input.tagIds?.length) {
      await knowledgeRepository.syncArticleTags(article.id, input.tagIds);
    }

    await knowledgeRepository.createAudit({
      userId: authorId,
      action: 'CREATED',
      entityType: 'article',
      entityId: article.id,
      newValues: { title: article.title, slug: article.slug },
      ipAddress: ctx.ipAddress,
      requestId: ctx.requestId,
    });

    return article;
  },

  async update(id: string, input: UpdateInput, actorId: string, ctx: RequestContext) {
    const article = await knowledgeRepository.findArticleById(id);
    if (!article) throw new NotFoundError('KnowledgeArticle', id);

    const newVersion = article.currentVersion + 1;
    const title = input.title ?? article.title;
    const summary = input.summary ?? article.summary;
    const content = input.content ?? article.content;

    await knowledgeRepository.createVersion({
      article: { connect: { id } },
      version: newVersion,
      title,
      summary,
      content,
      changeNotes: input.changeNotes ?? 'Updated',
      createdById: actorId,
    });

    const updated = await knowledgeRepository.updateArticle(id, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.contentType !== undefined ? { contentType: input.contentType } : {}),
      ...(input.categoryId !== undefined ? { category: { connect: { id: input.categoryId } } } : {}),
      ...(input.searchKeywords !== undefined ? { searchKeywords: input.searchKeywords } : {}),
      ...(input.department !== undefined ? { department: input.department } : {}),
      ...(input.productCode !== undefined ? { productCode: input.productCode } : {}),
      ...(input.lenderCode !== undefined ? { lenderCode: input.lenderCode } : {}),
      ...(input.riskCategory !== undefined ? { riskCategory: input.riskCategory } : {}),
      currentVersion: newVersion,
    });

    if (input.tagIds) {
      await knowledgeRepository.syncArticleTags(id, input.tagIds);
    }

    await knowledgeRepository.createAudit({
      userId: actorId,
      action: 'VERSION_CREATED',
      entityType: 'article',
      entityId: id,
      newValues: { version: newVersion },
      ipAddress: ctx.ipAddress,
      requestId: ctx.requestId,
    });

    return updated;
  },

  async addFeedback(
    articleId: string,
    userId: string,
    rating: number,
    comment: string | undefined,
    helpful: boolean | undefined,
    ctx: RequestContext,
  ) {
    const article = await knowledgeRepository.findArticleById(articleId);
    if (!article) throw new NotFoundError('KnowledgeArticle', articleId);

    const feedback = await knowledgeRepository.createFeedback({
      article: { connect: { id: articleId } },
      userId,
      rating,
      comment,
      helpful,
    });

    await knowledgeRepository.createAudit({
      userId,
      action: 'FEEDBACK_ADDED',
      entityType: 'article',
      entityId: articleId,
      newValues: { rating },
      ipAddress: ctx.ipAddress,
      requestId: ctx.requestId,
    });

    return feedback;
  },
};
