import type { Prisma } from '@kuberone/database';
import type {
  CreateEmailTemplateInput,
  CreateEmailTemplateVersionInput,
  ListEmailTemplatesQuery,
  PreviewEmailTemplateInput,
  UpdateEmailTemplateInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { emailTemplateRepository } from '../repositories/email.repository.js';
import { renderBrandedEmailHtml, renderTemplateString } from '../templates/html-layout.js';
import type { RequestContext } from '../types/email.types.js';
import { buildPaginationMeta } from '../utils/email.utils.js';

export const emailTemplateService = {
  async list(query: ListEmailTemplatesQuery) {
    const where: Prisma.EmailTemplateWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.category ? { category: query.category as never } : {}),
      ...(query.eventType ? { eventType: query.eventType } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.locale ? { locale: query.locale } : {}),
      ...(query.search
        ? { OR: [{ code: { contains: query.search } }, { name: { contains: query.search } }] }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };
    const [items, total] = await Promise.all([
      emailTemplateRepository.list(where, skip, query.limit, orderBy),
      emailTemplateRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await emailTemplateRepository.findById(id);
    if (!item || item.deletedAt) throw new NotFoundError('EmailTemplate', id);
    return item;
  },

  async getByCode(code: string) {
    const item = await emailTemplateRepository.findByCode(code);
    if (!item) throw new NotFoundError('EmailTemplate', code);
    return item;
  },

  async create(input: CreateEmailTemplateInput, ctx: RequestContext) {
    const existing = await emailTemplateRepository.findByCode(input.code);
    if (existing) throw new ConflictError(`Email template ${input.code} already exists`);

    const template = await emailTemplateRepository.create({
      code: input.code,
      name: input.name,
      category: input.category as never,
      eventType: input.eventType,
      subject: input.subject,
      htmlBody: input.htmlBody,
      textBody: input.textBody,
      variables: input.variables,
      locale: input.locale,
      metadata: input.metadata as Prisma.InputJsonValue,
      createdBy: { connect: { id: ctx.actorId } },
    });

    await emailTemplateRepository.createVersion({
      template: { connect: { id: template.id } },
      version: 1,
      subject: input.subject,
      htmlBody: input.htmlBody,
      textBody: input.textBody,
      variables: input.variables,
      createdBy: { connect: { id: ctx.actorId } },
    });

    return template;
  },

  async update(id: string, input: UpdateEmailTemplateInput, ctx: RequestContext) {
    await emailTemplateService.getById(id);
    return emailTemplateRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.category !== undefined ? { category: input.category as never } : {}),
      ...(input.eventType !== undefined ? { eventType: input.eventType } : {}),
      ...(input.subject !== undefined ? { subject: input.subject } : {}),
      ...(input.htmlBody !== undefined ? { htmlBody: input.htmlBody } : {}),
      ...(input.textBody !== undefined ? { textBody: input.textBody } : {}),
      ...(input.variables !== undefined ? { variables: input.variables } : {}),
      ...(input.locale !== undefined ? { locale: input.locale } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata as Prisma.InputJsonValue } : {}),
      updatedBy: { connect: { id: ctx.actorId } },
    });
  },

  async createVersion(id: string, input: CreateEmailTemplateVersionInput, ctx: RequestContext) {
    const template = await emailTemplateService.getById(id);
    const version = template.currentVersion + 1;

    await emailTemplateRepository.createVersion({
      template: { connect: { id } },
      version,
      subject: input.subject,
      htmlBody: input.htmlBody,
      textBody: input.textBody,
      variables: (input.variables ?? template.variables) as Prisma.InputJsonValue,
      createdBy: { connect: { id: ctx.actorId } },
    });

    return emailTemplateRepository.update(id, {
      currentVersion: version,
      subject: input.subject,
      htmlBody: input.htmlBody,
      textBody: input.textBody,
      variables: (input.variables ?? template.variables) as Prisma.InputJsonValue,
      updatedBy: { connect: { id: ctx.actorId } },
    });
  },

  async preview(input: PreviewEmailTemplateInput) {
    let subject = input.subject ?? 'Preview';
    let bodyHtml = input.htmlBody ?? '<p>Preview content</p>';

    if (input.templateCode) {
      const template = await emailTemplateRepository.findByCode(input.templateCode);
      if (template) {
        subject = renderTemplateString(template.subject, input.variables);
        bodyHtml = renderTemplateString(template.htmlBody, input.variables);
      }
    } else {
      subject = renderTemplateString(subject, input.variables);
      bodyHtml = renderTemplateString(bodyHtml, input.variables);
    }

    return {
      subject,
      html: renderBrandedEmailHtml({ subject, bodyHtml }),
      textBody: bodyHtml.replace(/<[^>]+>/g, ' '),
    };
  },

  async render(params: {
    templateCode?: string;
    eventType?: string;
    subject?: string;
    htmlBody?: string;
    textBody?: string;
    variables?: Record<string, unknown>;
  }) {
    let template = params.templateCode ? await emailTemplateRepository.findByCode(params.templateCode) : null;
    if (!template && params.eventType) {
      template = await emailTemplateRepository.findByEventType(params.eventType);
    }

    const vars = params.variables ?? {};
    const subject = renderTemplateString(template?.subject ?? params.subject ?? 'KuberOne', vars);
    const innerHtml = renderTemplateString(template?.htmlBody ?? params.htmlBody ?? params.textBody ?? '', vars);
    const textBody = renderTemplateString(template?.textBody ?? params.textBody ?? innerHtml.replace(/<[^>]+>/g, ' '), vars);
    const html = renderBrandedEmailHtml({ subject, bodyHtml: innerHtml });

    return {
      subject,
      html,
      textBody,
      templateId: template?.id,
      templateCode: template?.code,
      category: template?.category,
    };
  },
};
