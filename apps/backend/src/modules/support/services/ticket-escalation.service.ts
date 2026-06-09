import type { Prisma } from '@kuberone/database';
import type { ListTicketEscalationsQuery } from '@kuberone/shared-validation';

import { ticketEscalationRepository } from '../repositories/ticket.repository.js';
import { buildPaginationMeta } from '../utils/support.utils.js';

export const ticketEscalationService = {
  async list(query: ListTicketEscalationsQuery) {
    const where: Prisma.TicketEscalationWhereInput = {
      ...(query.ticketId ? { ticketId: query.ticketId } : {}),
    };

    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      ticketEscalationRepository.list(where, skip, query.limit, orderBy),
      ticketEscalationRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },
};
