import type { Prisma } from '@kuberone/database';
import type {
  CreateSmsTemplateInput,
  CreateSmsTemplateVersionInput,
  ListSmsTemplatesQuery,
  PreviewSmsTemplateInput,
  UpdateSmsTemplateInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { smsTemplateRepository } from '../repositories/sms.repository.js';
import type { RequestContext } from '../types/sms.types.js';
import { buildPaginationMeta, renderTemplateString } from '../utils/sms.utils.js';

export const smsTemplateService = {
  async list(query: ListSmsTemplatesQuery) {
    const where: Prisma.SmsTemplateWhereInput = {
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
      smsTemplateRepository.list(where, skip, query.limit, orderBy),
      smsTemplateRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await smsTemplateRepository.findById(id);
    if (!item || item.deletedAt) throw new NotFoundError('SmsTemplate', id);
    return item;
  },

  async create(input: CreateSmsTemplateInput, ctx: RequestContext) {
    const existing = await smsTemplateRepository.findByCode(input.code);
    if (existing) throw new ConflictError(`SMS template ${input.code} already exists`);

    const template = await smsTemplateRepository.create({
      code: input.code,
      name: input.name,
      category: input.category as never,
      eventType: input.eventType,
      body: input.body,
      dltTemplateId: input.dltTemplateId,
      variables: input.variables,
      locale: input.locale,
      metadata: input.metadata as Prisma.InputJsonValue,
      createdBy: { connect: { id: ctx.actorId } },
    });

    await smsTemplateRepository.createVersion({
      template: { connect: { id: template.id } },
      version: 1,
      body: input.body,
      dltTemplateId: input.dltTemplateId,
      variables: input.variables,
      createdBy: { connect: { id: ctx.actorId } },
    });

    return template;
  },

  async update(id: string, input: UpdateSmsTemplateInput, ctx: RequestContext) {
    await smsTemplateService.getById(id);
    return smsTemplateRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.category !== undefined ? { category: input.category as never } : {}),
      ...(input.eventType !== undefined ? { eventType: input.eventType } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.dltTemplateId !== undefined ? { dltTemplateId: input.dltTemplateId } : {}),
      ...(input.variables !== undefined ? { variables: input.variables } : {}),
      ...(input.locale !== undefined ? { locale: input.locale } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      updatedBy: { connect: { id: ctx.actorId } },
    });
  },

  async createVersion(id: string, input: CreateSmsTemplateVersionInput, ctx: RequestContext) {
    const template = await smsTemplateService.getById(id);
    const version = template.currentVersion + 1;

    await smsTemplateRepository.createVersion({
      template: { connect: { id } },
      version,
      body: input.body,
      dltTemplateId: input.dltTemplateId,
      variables: (input.variables ?? template.variables) as Prisma.InputJsonValue,
      createdBy: { connect: { id: ctx.actorId } },
    });

    return smsTemplateRepository.update(id, {
      currentVersion: version,
      body: input.body,
      dltTemplateId: input.dltTemplateId,
      variables: (input.variables ?? template.variables) as Prisma.InputJsonValue,
      updatedBy: { connect: { id: ctx.actorId } },
    });
  },

  async preview(input: PreviewSmsTemplateInput) {
    let body = input.body ?? 'Preview SMS';
    if (input.templateCode) {
      const template = await smsTemplateRepository.findByCode(input.templateCode);
      if (template) body = template.body;
    }
    return { body: renderTemplateString(body, input.variables), charCount: renderTemplateString(body, input.variables).length };
  },

  async render(params: {
    templateCode?: string;
    eventType?: string;
    body?: string;
    variables?: Record<string, unknown>;
  }) {
    let template = params.templateCode ? await smsTemplateRepository.findByCode(params.templateCode) : null;
    if (!template && params.eventType) {
      template = await smsTemplateRepository.findByEventType(params.eventType);
    }

    const vars = params.variables ?? {};
    const body = renderTemplateString(template?.body ?? params.body ?? '', vars);

    return {
      body,
      templateId: template?.id,
      templateCode: template?.code,
      category: template?.category,
      dltTemplateId: template?.dltTemplateId,
    };
  },
};
