import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';

export const knowledgeRepository = {
  // Categories
  listCategories(where: Prisma.KnowledgeCategoryWhereInput, skip: number, take: number) {
    return prisma.knowledgeCategory.findMany({
      where,
      skip,
      take,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { articles: true } } },
    });
  },

  countCategories(where: Prisma.KnowledgeCategoryWhereInput) {
    return prisma.knowledgeCategory.count({ where });
  },

  findCategoryById(id: string) {
    return prisma.knowledgeCategory.findUnique({ where: { id } });
  },

  findCategoryByCode(code: string) {
    return prisma.knowledgeCategory.findUnique({ where: { code } });
  },

  createCategory(data: Prisma.KnowledgeCategoryCreateInput) {
    return prisma.knowledgeCategory.create({ data });
  },

  updateCategory(id: string, data: Prisma.KnowledgeCategoryUpdateInput) {
    return prisma.knowledgeCategory.update({ where: { id }, data });
  },

  // Articles
  listArticles(
    where: Prisma.KnowledgeArticleWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.KnowledgeArticleOrderByWithRelationInput,
  ) {
    return prisma.knowledgeArticle.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        category: { select: { id: true, code: true, name: true } },
        articleTags: { include: { tag: { select: { id: true, code: true, name: true } } } },
      },
    });
  },

  countArticles(where: Prisma.KnowledgeArticleWhereInput) {
    return prisma.knowledgeArticle.count({ where });
  },

  findArticleById(id: string) {
    return prisma.knowledgeArticle.findUnique({
      where: { id },
      include: {
        category: true,
        articleTags: { include: { tag: true } },
        attachments: true,
        versions: { orderBy: { version: 'desc' }, take: 10 },
      },
    });
  },

  findArticleBySlug(slug: string) {
    return prisma.knowledgeArticle.findUnique({ where: { slug } });
  },

  createArticle(data: Prisma.KnowledgeArticleCreateInput) {
    return prisma.knowledgeArticle.create({ data });
  },

  updateArticle(id: string, data: Prisma.KnowledgeArticleUpdateInput) {
    return prisma.knowledgeArticle.update({ where: { id }, data });
  },

  incrementViewCount(id: string) {
    return prisma.knowledgeArticle.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  },

  // Versions
  createVersion(data: Prisma.KnowledgeVersionCreateInput) {
    return prisma.knowledgeVersion.create({ data });
  },

  findVersion(articleId: string, version: number) {
    return prisma.knowledgeVersion.findUnique({
      where: { articleId_version: { articleId, version } },
    });
  },

  // Tags
  listTags(where: Prisma.KnowledgeTagWhereInput, skip: number, take: number) {
    return prisma.knowledgeTag.findMany({ where, skip, take, orderBy: { name: 'asc' } });
  },

  countTags(where: Prisma.KnowledgeTagWhereInput) {
    return prisma.knowledgeTag.count({ where });
  },

  findTagById(id: string) {
    return prisma.knowledgeTag.findUnique({ where: { id } });
  },

  findTagByCode(code: string) {
    return prisma.knowledgeTag.findUnique({ where: { code } });
  },

  createTag(data: Prisma.KnowledgeTagCreateInput) {
    return prisma.knowledgeTag.create({ data });
  },

  syncArticleTags(articleId: string, tagIds: string[]) {
    return prisma.$transaction([
      prisma.knowledgeArticleTag.deleteMany({ where: { articleId } }),
      ...tagIds.map((tagId) =>
        prisma.knowledgeArticleTag.create({ data: { articleId, tagId } }),
      ),
    ]);
  },

  // Approvals & Reviews
  createApproval(data: Prisma.KnowledgeApprovalCreateInput) {
    return prisma.knowledgeApproval.create({ data });
  },

  listApprovals(where: Prisma.KnowledgeApprovalWhereInput, skip: number, take: number) {
    return prisma.knowledgeApproval.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { article: { select: { id: true, title: true, status: true } } },
    });
  },

  createReview(data: Prisma.KnowledgeReviewCreateInput) {
    return prisma.knowledgeReview.create({ data });
  },

  listReviews(where: Prisma.KnowledgeReviewWhereInput, skip: number, take: number) {
    return prisma.knowledgeReview.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { article: { select: { id: true, title: true, status: true } } },
    });
  },

  updateReview(id: string, data: Prisma.KnowledgeReviewUpdateInput) {
    return prisma.knowledgeReview.update({ where: { id }, data });
  },

  // Feedback & Views
  createFeedback(data: Prisma.KnowledgeFeedbackCreateInput) {
    return prisma.knowledgeFeedback.create({ data });
  },

  createView(data: Prisma.KnowledgeViewCreateInput) {
    return prisma.knowledgeView.create({ data });
  },

  // Audit & Search History
  createAudit(data: Prisma.KnowledgeAuditCreateInput) {
    return prisma.knowledgeAudit.create({ data });
  },

  createSearchHistory(data: Prisma.KnowledgeSearchHistoryCreateInput) {
    return prisma.knowledgeSearchHistory.create({ data });
  },

  // Analytics aggregations
  groupArticlesByStatus() {
    return prisma.knowledgeArticle.groupBy({ by: ['status'], _count: { id: true } });
  },

  groupArticlesByContentType() {
    return prisma.knowledgeArticle.groupBy({ by: ['contentType'], _count: { id: true } });
  },

  topViewedArticles(take = 10) {
    return prisma.knowledgeArticle.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take,
      select: { id: true, title: true, viewCount: true, contentType: true },
    });
  },

  searchTrends(take = 10) {
    return prisma.knowledgeSearchHistory.groupBy({
      by: ['query'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take,
    });
  },

  avgFeedbackRating() {
    return prisma.knowledgeFeedback.aggregate({ _avg: { rating: true } });
  },

  departmentViewCounts() {
    return prisma.knowledgeView.groupBy({
      by: ['source'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
  },

  countViews(dateFilter?: Prisma.KnowledgeViewWhereInput) {
    return prisma.knowledgeView.count({ where: dateFilter });
  },

  countSearches(dateFilter?: Prisma.KnowledgeSearchHistoryWhereInput) {
    return prisma.knowledgeSearchHistory.count({ where: dateFilter });
  },
};
