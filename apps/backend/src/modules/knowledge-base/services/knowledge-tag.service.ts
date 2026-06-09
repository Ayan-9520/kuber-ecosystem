import type { z } from 'zod';

import { ConflictError } from '../../../shared/errors/app-error.js';
import { knowledgeRepository } from '../repositories/knowledge.repository.js';
import type { RequestContext } from '../types/knowledge-base.types.js';
import type { createTagSchema, listTagsQuerySchema } from '../validators/knowledge.validator.js';

type CreateInput = z.infer<typeof createTagSchema>;
type ListQuery = z.infer<typeof listTagsQuerySchema>;

export const knowledgeTagService = {
  async list(query: ListQuery) {
    const where = {
      ...(query.tagGroup ? { tagGroup: query.tagGroup } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      knowledgeRepository.listTags(where, skip, query.limit),
      knowledgeRepository.countTags(where),
    ]);
    return {
      items,
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async create(input: CreateInput, ctx: RequestContext) {
    const existing = await knowledgeRepository.findTagByCode(input.code);
    if (existing) throw new ConflictError(`Tag code "${input.code}" already exists`);

    const tag = await knowledgeRepository.createTag({
      code: input.code,
      name: input.name,
      tagGroup: input.tagGroup,
      color: input.color,
    });

    await knowledgeRepository.createAudit({
      userId: ctx.actorId,
      action: 'CREATED',
      entityType: 'tag',
      entityId: tag.id,
      newValues: { code: tag.code, name: tag.name },
      ipAddress: ctx.ipAddress,
      requestId: ctx.requestId,
    });

    return tag;
  },
};
