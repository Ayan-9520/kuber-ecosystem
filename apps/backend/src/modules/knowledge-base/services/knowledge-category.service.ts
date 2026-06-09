import type { z } from 'zod';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { knowledgeRepository } from '../repositories/knowledge.repository.js';
import type { RequestContext } from '../types/knowledge-base.types.js';
import type { createCategorySchema, listCategoriesQuerySchema, updateCategorySchema } from '../validators/knowledge.validator.js';

type CreateInput = z.infer<typeof createCategorySchema>;
type UpdateInput = z.infer<typeof updateCategorySchema>;
type ListQuery = z.infer<typeof listCategoriesQuerySchema>;

export const knowledgeCategoryService = {
  async list(query: ListQuery) {
    const where = {
      ...(query.parentId ? { parentId: query.parentId } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      knowledgeRepository.listCategories(where, skip, query.limit),
      knowledgeRepository.countCategories(where),
    ]);
    return {
      items: items.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        description: c.description,
        parentId: c.parentId,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        articleCount: c._count.articles,
      })),
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async create(input: CreateInput, ctx: RequestContext) {
    const existing = await knowledgeRepository.findCategoryByCode(input.code);
    if (existing) throw new ConflictError(`Category code "${input.code}" already exists`);

    const category = await knowledgeRepository.createCategory({
      code: input.code,
      name: input.name,
      description: input.description,
      parent: input.parentId ? { connect: { id: input.parentId } } : undefined,
      sortOrder: input.sortOrder ?? 0,
    });

    await knowledgeRepository.createAudit({
      userId: ctx.actorId,
      action: 'CREATED',
      entityType: 'category',
      entityId: category.id,
      newValues: { code: category.code, name: category.name },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return category;
  },

  async update(id: string, input: UpdateInput, ctx: RequestContext) {
    const existing = await knowledgeRepository.findCategoryById(id);
    if (!existing) throw new NotFoundError('KnowledgeCategory', id);

    const updated = await knowledgeRepository.updateCategory(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.parentId !== undefined ? { parent: input.parentId ? { connect: { id: input.parentId } } : { disconnect: true } } : {}),
    });

    await knowledgeRepository.createAudit({
      userId: ctx.actorId,
      action: 'UPDATED',
      entityType: 'category',
      entityId: id,
      oldValues: { name: existing.name },
      newValues: { name: updated.name },
      ipAddress: ctx.ipAddress,
      requestId: ctx.requestId,
    });

    return updated;
  },
};
