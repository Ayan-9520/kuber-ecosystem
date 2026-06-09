import type { PaginatedMeta, PaginationQuery } from '@kuberone/shared-types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(query: PaginationQuery): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(DEFAULT_PAGE, query.page ?? DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginatedMeta(
  page: number,
  limit: number,
  total: number,
): PaginatedMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 0,
  };
}
