import type {
  CreateLeadSourceInput,
  ListLeadSourcesQuery,
  UpdateLeadSourceInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { leadSourceRepository } from '../repositories/lead-source.repository.js';
import type { RequestContext } from '../types/leads.types.js';
import { auditLeadMutation, buildPaginationMeta } from '../utils/leads.utils.js';

export const leadSourceService = {
  async list(query: ListLeadSourcesQuery) {
    const where = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.channel ? { channel: query.channel as never } : {}),
      ...(query.search
        ? {
            OR: [{ name: { contains: query.search } }, { code: { contains: query.search } }],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      leadSourceRepository.list(where, skip, query.limit, orderBy),
      leadSourceRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const source = await leadSourceRepository.findById(id);
    if (!source) throw new NotFoundError('LeadSource', id);
    return source;
  },

  async create(input: CreateLeadSourceInput, ctx: RequestContext) {
    const existing = await leadSourceRepository.findByCode(input.code);
    if (existing) throw new ConflictError('Lead source code already exists');

    const source = await leadSourceRepository.create({
      ...input,
      channel: input.channel as never,
    });

    await auditLeadMutation(authAuditRepository.log, ctx, 'LEAD_SOURCE_CREATED', 'lead_source', source.id, input);
    return source;
  },

  async update(id: string, input: UpdateLeadSourceInput, ctx: RequestContext) {
    await leadSourceService.getById(id);
    const source = await leadSourceRepository.update(id, {
      ...input,
      channel: input.channel as never,
    });
    await auditLeadMutation(authAuditRepository.log, ctx, 'LEAD_SOURCE_UPDATED', 'lead_source', id, input);
    return source;
  },

  async deactivate(id: string, ctx: RequestContext) {
    await leadSourceService.getById(id);
    const source = await leadSourceRepository.update(id, { isActive: false });
    await auditLeadMutation(authAuditRepository.log, ctx, 'LEAD_SOURCE_DEACTIVATED', 'lead_source', id);
    return source;
  },
};
