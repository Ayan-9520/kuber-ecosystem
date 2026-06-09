import type { Prisma } from '@kuberone/database';
import type { CreateTicketMessageInput, ListTicketMessagesQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { ticketMessageRepository, ticketRepository } from '../repositories/ticket.repository.js';
import type { RequestContext } from '../types/support.types.js';
import { auditTicketMutation, buildPaginationMeta } from '../utils/support.utils.js';

import { ticketService } from './ticket.service.js';

export const ticketMessageService = {
  async list(query: ListTicketMessagesQuery) {
    await ticketService.getById(query.ticketId);

    const where: Prisma.TicketMessageWhereInput = {
      ticketId: query.ticketId,
      ...(query.includeInternal ? {} : { isInternal: false }),
    };

    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      ticketMessageRepository.list(where, skip, query.limit, orderBy),
      ticketMessageRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const message = await ticketMessageRepository.findById(id);
    if (!message) throw new NotFoundError('TicketMessage', id);
    return message;
  },

  async create(input: CreateTicketMessageInput, ctx: RequestContext) {
    const ticket = await ticketService.getById(input.ticketId);

    const message = await ticketMessageRepository.create({
      ticketId: input.ticketId,
      body: input.body,
      messageType: input.messageType as never,
      isInternal: input.isInternal,
      authorUserId: ctx.actorId,
    });

    if (!ticket.firstResponseAt && !input.isInternal && input.messageType !== 'SYSTEM') {
      await ticketRepository.update(input.ticketId, {
        firstResponseAt: new Date(),
        status: ticket.status === 'OPEN' || ticket.status === 'ASSIGNED' ? 'IN_PROGRESS' : ticket.status,
        updatedById: ctx.actorId,
      });
    }

    await auditTicketMutation(authAuditRepository.log, ctx, 'TICKET_MESSAGE_CREATED', input.ticketId, input);
    return message;
  },
};
