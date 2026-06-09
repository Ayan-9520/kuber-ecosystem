import type { Prisma } from '@kuberone/database';
import type {
  CreateNotificationTemplateInput,
  CreateTemplateVersionInput,
  ListNotificationTemplatesQuery,
  UpdateNotificationTemplateInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { notificationTemplateRepository } from '../repositories/notification.repository.js';
import type { RequestContext } from '../types/notifications.types.js';
import { auditNotificationMutation, buildPaginationMeta } from '../utils/notifications.utils.js';

export const notificationTemplateService = {
  async list(query: ListNotificationTemplatesQuery) {
    const where: Prisma.NotificationTemplateWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.channel ? { channel: query.channel as never } : {}),
      ...(query.eventType ? { eventType: query.eventType as never } : {}),
      ...(query.search ? { OR: [{ name: { contains: query.search } }, { code: { contains: query.search } }] } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      notificationTemplateRepository.list(where, skip, query.limit, orderBy),
      notificationTemplateRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await notificationTemplateRepository.findById(id);
    if (!item || item.deletedAt) throw new NotFoundError('NotificationTemplate', id);
    return item;
  },

  async create(input: CreateNotificationTemplateInput, ctx: RequestContext) {
    const existing = await notificationTemplateRepository.findActiveByCode(input.code, input.channel);
    if (existing) throw new ConflictError('Template code already exists for channel');

    const item = await notificationTemplateRepository.create({
      ...input,
      channel: input.channel as never,
      eventType: input.eventType as never,
      variables: input.variables,
      metadata: input.metadata as Prisma.InputJsonValue,
      createdBy: { connect: { id: ctx.actorId } },
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditNotificationMutation(authAuditRepository.log, ctx, 'NOTIFICATION_TEMPLATE_CREATED', item.id, input);
    return item;
  },

  async update(id: string, input: UpdateNotificationTemplateInput, ctx: RequestContext) {
    await notificationTemplateService.getById(id);
    const item = await notificationTemplateRepository.update(id, {
      ...input,
      channel: input.channel as never,
      eventType: input.eventType as never,
      metadata: input.metadata as Prisma.InputJsonValue,
      updatedBy: { connect: { id: ctx.actorId } },
    });
    await auditNotificationMutation(authAuditRepository.log, ctx, 'NOTIFICATION_TEMPLATE_UPDATED', id, input);
    return item;
  },

  async createVersion(id: string, input: CreateTemplateVersionInput, ctx: RequestContext) {
    const parent = await notificationTemplateService.getById(id);
    const latest = await notificationTemplateRepository.getLatestVersion(parent.code);
    const nextVersion = (latest?.version ?? parent.version) + 1;

    await notificationTemplateRepository.update(id, { isActive: false });

    const item = await notificationTemplateRepository.create({
      code: parent.code,
      name: parent.name,
      channel: parent.channel,
      eventType: parent.eventType,
      version: nextVersion,
      parentTemplate: { connect: { id: parent.id } },
      subject: input.subject ?? parent.subject,
      body: input.body,
      variables: (input.variables ?? parent.variables) as Prisma.InputJsonValue,
      metadata: parent.metadata as Prisma.InputJsonValue,
      createdBy: { connect: { id: ctx.actorId } },
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditNotificationMutation(authAuditRepository.log, ctx, 'NOTIFICATION_TEMPLATE_VERSIONED', item.id, { version: nextVersion });
    return item;
  },

  async remove(id: string, ctx: RequestContext) {
    await notificationTemplateService.getById(id);
    await notificationTemplateRepository.softDelete(id, ctx.actorId);
    await auditNotificationMutation(authAuditRepository.log, ctx, 'NOTIFICATION_TEMPLATE_DELETED', id);
    return { id, deleted: true };
  },
};
