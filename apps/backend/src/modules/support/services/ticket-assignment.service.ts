import type { Prisma } from '@kuberone/database';
import type { ListTicketAssignmentsQuery } from '@kuberone/shared-validation';

import { ticketAssignmentRepository } from '../repositories/ticket.repository.js';
import { buildPaginationMeta } from '../utils/support.utils.js';

export const ticketAssignmentService = {
  async list(query: ListTicketAssignmentsQuery) {
    const where: Prisma.TicketAssignmentWhereInput = {
      ...(query.ticketId ? { ticketId: query.ticketId } : {}),
      ...(query.assignedUserId ? { assignedUserId: query.assignedUserId } : {}),
    };

    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      ticketAssignmentRepository.list(where, skip, query.limit, orderBy),
      ticketAssignmentRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },
};
