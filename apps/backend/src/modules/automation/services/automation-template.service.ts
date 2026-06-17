import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { CreateTemplateInput, ListTemplatesQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { automationRepository } from '../repositories/automation.repository.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const automationTemplateService = {
  async list(_actor: AuthenticatedUser, query: ListTemplatesQuery) {
    const where = {
      ...(query.journeyType ? { journeyType: query.journeyType as never } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.search ? { OR: [{ name: { contains: query.search } }, { description: { contains: query.search } }] } : {}),
      isPublic: true,
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      automationRepository.template.findMany({ where, skip, take: query.limit, orderBy: { usageCount: 'desc' } }),
      automationRepository.template.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(_actor: AuthenticatedUser, id: string) {
    const template = await automationRepository.template.findById(id);
    if (!template) throw new NotFoundError('AutomationTemplate', id);
    return template;
  },

  async create(actor: AuthenticatedUser, input: CreateTemplateInput) {
    return automationRepository.template.create({
      name: input.name,
      description: input.description,
      journeyType: input.journeyType as never,
      category: input.category,
      canvasJson: input.canvasJson as Prisma.InputJsonValue,
      nodesJson: input.nodesJson as Prisma.InputJsonValue,
      triggersJson: input.triggersJson as Prisma.InputJsonValue,
      goalsJson: input.goalsJson as Prisma.InputJsonValue,
      isPublic: input.isPublic ?? true,
      createdBy: { connect: { id: actor.id } },
    });
  },
};
