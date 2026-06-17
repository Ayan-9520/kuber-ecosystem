import { NotFoundError } from '../../../shared/errors/app-error.js';
import { errorTrackingRepository } from '../repositories/error-tracking.repository.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const errorDataService = {
  async listGroups(params: {
    page: number; limit: number; sortOrder: string; sortBy: string;
    source?: string; category?: string; priority?: string; status?: string;
    module?: string; userId?: string; traceId?: string; search?: string;
  }) {
    const { page, limit, sortOrder, sortBy, search, ...filters } = params;
    const where = {
      ...(filters.source ? { source: filters.source as never } : {}),
      ...(filters.category ? { category: filters.category as never } : {}),
      ...(filters.priority ? { priority: filters.priority as never } : {}),
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.module ? { module: filters.module } : {}),
      ...(filters.traceId ? { traceIdSample: filters.traceId } : {}),
      ...(search ? { OR: [{ title: { contains: search } }, { message: { contains: search } }, { module: { contains: search } }] } : {}),
    };
    const [items, total] = await Promise.all([
      errorTrackingRepository.group.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { assignedTo: { select: { id: true, email: true } } },
      }),
      errorTrackingRepository.group.count(where),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listEvents(params: {
    page: number; limit: number; sortOrder: string;
    source?: string; category?: string; search?: string;
  }) {
    const { page, limit, sortOrder, search, ...filters } = params;
    const where = {
      ...(filters.source ? { source: filters.source as never } : {}),
      ...(filters.category ? { category: filters.category as never } : {}),
      ...(search ? { OR: [{ message: { contains: search } }, { errorType: { contains: search } }] } : {}),
    };
    const [items, total] = await Promise.all([
      errorTrackingRepository.event.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: sortOrder as never } }),
      errorTrackingRepository.event.count(where),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getGroup(id: string) {
    const group = await errorTrackingRepository.group.findById(id);
    if (!group) throw new NotFoundError('Error group not found');
    return group;
  },

  async getEvent(id: string) {
    const event = await errorTrackingRepository.event.findById(id);
    if (!event) throw new NotFoundError('Error event not found');
    return event;
  },

  async listAssignments(params: { page: number; limit: number; assignedToId?: string }) {
    const { page, limit, assignedToId } = params;
    const where = assignedToId ? { assignedToId } : {};
    const [items, total] = await Promise.all([
      errorTrackingRepository.assignment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          group: { select: { id: true, title: true, priority: true, status: true } },
          assignedTo: { select: { id: true, email: true } },
          assignedBy: { select: { id: true, email: true } },
        },
      }),
      errorTrackingRepository.assignment.findMany({ where }).then((r) => r.length),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },
};
