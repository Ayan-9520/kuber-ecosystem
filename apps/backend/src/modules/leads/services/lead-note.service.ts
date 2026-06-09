import type {
  CreateLeadNoteInput,
  ListLeadNotesQuery,
  UpdateLeadNoteInput,
} from '@kuberone/shared-validation';

import { ForbiddenError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { leadNoteRepository } from '../repositories/lead-note.repository.js';
import { leadRepository } from '../repositories/lead.repository.js';
import type { RequestContext } from '../types/leads.types.js';
import { auditLeadMutation, buildPaginationMeta } from '../utils/leads.utils.js';

export const leadNoteService = {
  async list(query: ListLeadNotesQuery) {
    const where = {
      ...(query.leadId ? { leadId: query.leadId } : {}),
      ...(query.authorId ? { authorId: query.authorId } : {}),
      ...(query.isPinned !== undefined ? { isPinned: query.isPinned } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      leadNoteRepository.list(where, skip, query.limit, orderBy),
      leadNoteRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const note = await leadNoteRepository.findById(id);
    if (!note) throw new NotFoundError('LeadNote', id);
    return note;
  },

  async create(input: CreateLeadNoteInput, ctx: RequestContext) {
    const lead = await leadRepository.findById(input.leadId);
    if (!lead) throw new NotFoundError('Lead', input.leadId);

    const note = await leadNoteRepository.create({
      leadId: input.leadId,
      authorId: ctx.actorId,
      content: input.content,
      isPinned: input.isPinned,
    });

    await auditLeadMutation(authAuditRepository.log, ctx, 'LEAD_NOTE_CREATED', 'lead_note', note.id, input);
    return note;
  },

  async update(id: string, input: UpdateLeadNoteInput, ctx: RequestContext) {
    const note = await leadNoteService.getById(id);
    if (note.authorId !== ctx.actorId) throw new ForbiddenError('Cannot edit another user note');

    const updated = await leadNoteRepository.update(id, input);
    await auditLeadMutation(authAuditRepository.log, ctx, 'LEAD_NOTE_UPDATED', 'lead_note', id, input);
    return updated;
  },

  async remove(id: string, ctx: RequestContext) {
    const note = await leadNoteService.getById(id);
    if (note.authorId !== ctx.actorId) throw new ForbiddenError('Cannot delete another user note');
    await leadNoteRepository.delete(id);
    await auditLeadMutation(authAuditRepository.log, ctx, 'LEAD_NOTE_DELETED', 'lead_note', id);
  },
};
