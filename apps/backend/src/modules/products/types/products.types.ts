export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export interface ListQueryBase {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function buildListWhere(
  query: ListQueryBase,
  searchFields: string[],
): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.search) {
    where.OR = searchFields.map((field) => ({
      [field]: { contains: query.search },
    }));
  }

  return where;
}
