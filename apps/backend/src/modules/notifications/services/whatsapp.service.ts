import type { Prisma } from '@kuberone/database';
import type { ListChannelLogsQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { MAX_RETRY_COUNT } from '../constants/notifications.constants.js';
import { resolveWhatsAppProvider } from '../providers/whatsapp/whatsapp.factory.js';
import { whatsAppTemplateRegistryRepository } from '../repositories/communication-channels.repository.js';
import { communicationLogRepository, whatsAppLogRepository } from '../repositories/notification.repository.js';
import { buildPaginationMeta } from '../utils/notifications.utils.js';

import { providerConfigService } from './provider-config.service.js';
import { rateLimitService } from './rate-limit.service.js';
import { templateEngineService } from './template-engine.service.js';

export const whatsAppService = {
  async list(query: ListChannelLogsQuery) {
    const where: Prisma.WhatsAppLogWhereInput = {
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.recipientUserId ? { recipientUserId: query.recipientUserId } : {}),
      ...(query.fromDate || query.toDate
        ? { createdAt: { ...(query.fromDate ? { gte: query.fromDate } : {}), ...(query.toDate ? { lte: query.toDate } : {}) } }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };
    const [items, total] = await Promise.all([
      whatsAppLogRepository.list(where, skip, query.limit, orderBy),
      whatsAppLogRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await whatsAppLogRepository.findById(id);
    if (!item) throw new NotFoundError('WhatsAppLog', id);
    return item;
  },

  async send(params: {
    userId?: string;
    toPhone: string;
    templateCode?: string;
    templateName?: string;
    body?: string;
    variables?: Record<string, unknown>;
    eventType?: string;
    retryCount?: number;
  }) {
    const rendered = await templateEngineService.render({
      templateCode: params.templateCode,
      channel: 'WHATSAPP',
      eventType: params.eventType,
      body: params.body,
      variables: params.variables,
    });

    let metaTemplateName = params.templateName;
    let language = 'en';
    if (!metaTemplateName && params.eventType) {
      const registry = await whatsAppTemplateRegistryRepository.findByEventType(params.eventType);
      if (registry) {
        metaTemplateName = registry.metaName;
        language = registry.language;
      }
    }
    metaTemplateName ??= params.templateCode ?? rendered.templateCode ?? 'generic';

    const log = await whatsAppLogRepository.create({
      toPhone: params.toPhone,
      templateName: metaTemplateName,
      body: rendered.body,
      payload: params.variables as Prisma.InputJsonValue,
      status: 'QUEUED',
      retryCount: params.retryCount ?? 0,
      template: rendered.templateId ? { connect: { id: rendered.templateId } } : undefined,
      recipientUser: params.userId ? { connect: { id: params.userId } } : undefined,
    });

    const rateLimit = await providerConfigService.getRateLimit('WHATSAPP');
    if (rateLimit && !rateLimitService.check('whatsapp', rateLimit)) {
      return whatsAppLogRepository.update(log.id, {
        status: 'FAILED',
        failedAt: new Date(),
        failureReason: 'WhatsApp rate limit exceeded',
      });
    }

    const provider = resolveWhatsAppProvider();
    const result = await provider.send({
      to: params.toPhone,
      templateName: metaTemplateName,
      body: rendered.body,
      variables: params.variables,
      language,
    });

    const failed = !result.success;
    const retryCount = log.retryCount;

    const updated = await whatsAppLogRepository.update(log.id, {
      status: failed ? (retryCount >= MAX_RETRY_COUNT ? 'FAILED' : 'QUEUED') : 'SENT',
      providerRef: result.providerRef,
      deliveryStatus: result.deliveryStatus,
      sentAt: failed ? undefined : new Date(),
      failedAt: failed ? new Date() : undefined,
      failureReason: result.error,
      retryCount: failed ? retryCount + 1 : retryCount,
    });

    await communicationLogRepository.create({
      channel: 'WHATSAPP',
      eventType: params.eventType as never,
      template: rendered.templateId ? { connect: { id: rendered.templateId } } : undefined,
      recipientUser: params.userId ? { connect: { id: params.userId } } : undefined,
      recipientAddress: params.toPhone,
      renderedBody: rendered.body,
      payload: params.variables as Prisma.InputJsonValue,
      status: updated.status as never,
      providerRef: updated.providerRef,
      sentAt: updated.sentAt,
      failedAt: updated.failedAt,
      failureReason: updated.failureReason,
      retryCount: updated.retryCount,
    });

    return updated;
  },

  async trackDelivery(providerRef: string) {
    const log = await whatsAppLogRepository.findByProviderRef(providerRef);
    return { status: log?.deliveryStatus ?? 'unknown', readAt: log?.readAt, deliveredAt: log?.deliveredAt };
  },
};
