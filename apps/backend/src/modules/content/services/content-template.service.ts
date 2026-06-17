import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { CreateContentTemplateInput, ListContentTemplatesQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { contentRepository } from '../repositories/content.repository.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const contentTemplateService = {
  async list(_actor: AuthenticatedUser, query: ListContentTemplatesQuery) {
    const where = {
      ...(query.contentType ? { contentType: query.contentType as never } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? { OR: [{ name: { contains: query.search } }, { code: { contains: query.search } }] }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      contentRepository.template.findMany({ where, skip, take: query.limit, orderBy: { usageCount: 'desc' } }),
      contentRepository.template.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(_actor: AuthenticatedUser, id: string) {
    const template = await contentRepository.template.findById(id);
    if (!template) throw new NotFoundError('ContentTemplate', id);
    return template;
  },

  async create(actor: AuthenticatedUser, input: CreateContentTemplateInput) {
    return contentRepository.template.create({
      code: input.code,
      name: input.name,
      description: input.description,
      contentType: input.contentType as never,
      category: input.category,
      tone: input.tone as never,
      language: input.language as never,
      systemPrompt: input.systemPrompt,
      userPrompt: input.userPrompt,
      variables: input.variables as Prisma.InputJsonValue,
      sampleOutput: input.sampleOutput,
      createdBy: { connect: { id: actor.id } },
      updatedBy: { connect: { id: actor.id } },
    });
  },

  async update(actor: AuthenticatedUser, id: string, input: Partial<CreateContentTemplateInput>) {
    const existing = await contentRepository.template.findById(id);
    if (!existing) throw new NotFoundError('ContentTemplate', id);
    return contentRepository.template.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.contentType !== undefined ? { contentType: input.contentType as never } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.tone !== undefined ? { tone: input.tone as never } : {}),
      ...(input.language !== undefined ? { language: input.language as never } : {}),
      ...(input.systemPrompt !== undefined ? { systemPrompt: input.systemPrompt } : {}),
      ...(input.userPrompt !== undefined ? { userPrompt: input.userPrompt } : {}),
      ...(input.variables !== undefined ? { variables: input.variables as Prisma.InputJsonValue } : {}),
      ...(input.sampleOutput !== undefined ? { sampleOutput: input.sampleOutput } : {}),
      updatedBy: { connect: { id: actor.id } },
    });
  },
};
