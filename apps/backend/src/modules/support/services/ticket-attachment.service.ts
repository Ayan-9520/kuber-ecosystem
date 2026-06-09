import type { CreateTicketAttachmentInput } from '@kuberone/shared-validation';

import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { ticketAttachmentRepository } from '../repositories/ticket.repository.js';
import type { RequestContext } from '../types/support.types.js';
import { auditTicketMutation } from '../utils/support.utils.js';

import { ticketService } from './ticket.service.js';

export const ticketAttachmentService = {
  async listByTicket(ticketId: string) {
    await ticketService.getById(ticketId);
    return ticketAttachmentRepository.listByTicket(ticketId);
  },

  async create(input: CreateTicketAttachmentInput, ctx: RequestContext) {
    await ticketService.getById(input.ticketId);

    const attachment = await ticketAttachmentRepository.create({
      ticketId: input.ticketId,
      messageId: input.messageId,
      fileName: input.fileName,
      s3Key: input.s3Key,
      mimeType: input.mimeType,
      fileSizeBytes: BigInt(input.fileSizeBytes),
      uploadedById: ctx.actorId,
    });

    await auditTicketMutation(authAuditRepository.log, ctx, 'TICKET_ATTACHMENT_CREATED', input.ticketId, input);
    return attachment;
  },
};
