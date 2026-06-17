import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { ListContentHistoryQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { contentRepository } from '../repositories/content.repository.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const contentHistoryService = {
  async list(_actor: AuthenticatedUser, query: ListContentHistoryQuery) {
    const where = {
      ...(query.contentType ? { contentType: query.contentType as never } : {}),
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.mode ? { mode: query.mode as never } : {}),
      ...(query.fromDate || query.toDate
        ? {
            createdAt: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      contentRepository.request.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder },
        include: {
          results: { take: 3 },
          template: { select: { code: true, name: true } },
          requestedBy: { select: { id: true, email: true } },
        },
      }),
      contentRepository.request.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(_actor: AuthenticatedUser, id: string) {
    const item = await contentRepository.request.findById(id);
    if (!item) throw new NotFoundError('ContentGenerationRequest', id);
    return item;
  },

  async submitForReview(_actor: AuthenticatedUser, id: string) {
    const item = await contentRepository.request.findById(id);
    if (!item) throw new NotFoundError('ContentGenerationRequest', id);
    await contentRepository.request.update(id, { status: 'REVIEW' });
    await contentRepository.approval.create({
      request: { connect: { id } },
      status: 'PENDING',
    });
    return contentRepository.request.findById(id);
  },
};
