import type { Prisma } from '@kuberone/database';
import type { ListTicketResolutionsQuery } from '@kuberone/shared-validation';

import { ticketResolutionRepository } from '../repositories/ticket.repository.js';
import { buildPaginationMeta } from '../utils/support.utils.js';

export const ticketResolutionService = {
  async list(query: ListTicketResolutionsQuery) {
    const where: Prisma.TicketResolutionWhereInput = {
      ...(query.ticketId ? { ticketId: query.ticketId } : {}),
    };

    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      ticketResolutionRepository.list(where, skip, query.limit, orderBy),
      ticketResolutionRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },
};
