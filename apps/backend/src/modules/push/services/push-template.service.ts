import type { Prisma } from '@kuberone/database';
import type {
  CreatePushTemplateInput,
  CreatePushTemplateVersionInput,
  ListPushTemplatesQuery,
  PreviewPushTemplateInput,
  UpdatePushTemplateInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { pushTemplateRepository } from '../repositories/push.repository.js';
import type { RequestContext } from '../types/push.types.js';
import { buildPaginationMeta, renderTemplateString } from '../utils/push.utils.js';

export const pushTemplateService = {
  async list(query: ListPushTemplatesQuery) {
    const where: Prisma.PushTemplateWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.category ? { category: query.category as never } : {}),
      ...(query.eventType ? { eventType: query.eventType } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.locale ? { locale: query.locale } : {}),
      ...(query.search ? { OR: [{ code: { contains: query.search } }, { name: { contains: query.search } }] } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };
    const [items, total] = await Promise.all([
      pushTemplateRepository.list(where, skip, query.limit, orderBy),
      pushTemplateRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await pushTemplateRepository.findById(id);
    if (!item || item.deletedAt) throw new NotFoundError('PushTemplate', id);
    return item;
  },

  async create(input: CreatePushTemplateInput, ctx: RequestContext) {
    const existing = await pushTemplateRepository.findByCode(input.code);
    if (existing) throw new ConflictError(`Push template ${input.code} already exists`);

    const template = await pushTemplateRepository.create({
      code: input.code,
      name: input.name,
      category: input.category as never,
      eventType: input.eventType,
      title: input.title,
      body: input.body,
      variables: input.variables,
      locale: input.locale,
      metadata: input.metadata as Prisma.InputJsonValue,
      createdBy: { connect: { id: ctx.actorId } },
    });

    await pushTemplateRepository.createVersion({
      template: { connect: { id: template.id } },
      version: 1,
      title: input.title,
      body: input.body,
      variables: input.variables,
      createdBy: { connect: { id: ctx.actorId } },
    });

    return template;
  },

  async update(id: string, input: UpdatePushTemplateInput, ctx: RequestContext) {
    await pushTemplateService.getById(id);
    return pushTemplateRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.category !== undefined ? { category: input.category as never } : {}),
      ...(input.eventType !== undefined ? { eventType: input.eventType } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.variables !== undefined ? { variables: input.variables } : {}),
      ...(input.locale !== undefined ? { locale: input.locale } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      updatedBy: { connect: { id: ctx.actorId } },
    });
  },

  async createVersion(id: string, input: CreatePushTemplateVersionInput, ctx: RequestContext) {
    const template = await pushTemplateService.getById(id);
    const version = template.currentVersion + 1;
    await pushTemplateRepository.createVersion({
      template: { connect: { id } },
      version,
      title: input.title,
      body: input.body,
      variables: input.variables ?? (template.variables as string[]),
      createdBy: { connect: { id: ctx.actorId } },
    });
    return pushTemplateRepository.update(id, {
      currentVersion: version,
      title: input.title,
      body: input.body,
      ...(input.variables ? { variables: input.variables } : {}),
      updatedBy: { connect: { id: ctx.actorId } },
    });
  },

  async preview(input: PreviewPushTemplateInput) {
    const rendered = await pushTemplateService.render({
      templateCode: input.templateCode,
      title: input.title,
      body: input.body,
      variables: input.variables,
    });
    return rendered;
  },

  async render(params: {
    templateCode?: string;
    eventType?: string;
    title?: string;
    body?: string;
    variables?: Record<string, unknown>;
  }) {
    const template = params.templateCode
      ? await pushTemplateRepository.findByCode(params.templateCode)
      : params.eventType
        ? await pushTemplateRepository.findByEventType(params.eventType)
        : null;

    const vars = params.variables ?? {};
    const title = renderTemplateString(template?.title ?? params.title ?? 'KuberOne', vars);
    const body = renderTemplateString(template?.body ?? params.body ?? '', vars);

    return {
      templateId: template?.id,
      templateCode: template?.code,
      category: template?.category,
      title,
      body,
    };
  },
};
