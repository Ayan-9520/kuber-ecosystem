import type { Prisma } from '@kuberone/database';

import { env } from '../../../config/env.js';
import { ValidationError } from '../../../shared/errors/app-error.js';
import { communicationLogRepository, emailLogRepository } from '../../notifications/repositories/notification.repository.js';
import { channelStatusService } from '../../notifications/services/channel-status.service.js';
import { rateLimitService } from '../../notifications/services/rate-limit.service.js';
import { ALLOWED_ATTACHMENT_TYPES, EMAIL_MAX_RETRIES, TRANSACTIONAL_EVENT_TYPES } from '../constants/email.constants.js';
import { resolveEnterpriseEmailProvider } from '../providers/email.factory.js';
import {
  emailAnalyticsRepository,
  emailAttachmentRepository,
  emailDeliveryRepository,
  emailEventRepository,
  emailPreferenceRepository,
  emailProviderRepository,
  emailQueueRepository,
} from '../repositories/email.repository.js';
import type { SendEmailParams } from '../types/email.types.js';
import { validateEmailAddress } from '../utils/email.utils.js';

import { emailTemplateService } from './email-template.service.js';

export const emailOrchestratorService = {
  async send(params: SendEmailParams) {
    if (!validateEmailAddress(params.toEmail)) {
      throw new ValidationError({ toEmail: ['Invalid email address'] });
    }

    if (params.attachments?.length) {
      for (const att of params.attachments) {
        if (!ALLOWED_ATTACHMENT_TYPES.has(att.contentType)) {
          throw new ValidationError({ attachments: [`Type not allowed: ${att.contentType}`] });
        }
        if (att.sizeBytes > env.EMAIL_MAX_ATTACHMENT_BYTES) {
          throw new ValidationError({ attachments: ['Attachment exceeds size limit'] });
        }
      }
    }

    const isTransactional = params.eventType && TRANSACTIONAL_EVENT_TYPES.has(params.eventType);
    if (params.userId && !isTransactional) {
      const pref = await emailPreferenceRepository.findForUser(
        params.userId,
        params.category,
        params.eventType,
      );
      if (pref && !pref.enabled) {
        return { skipped: true, reason: 'User email preference disabled' };
      }
      if (params.category === 'MARKETING' && pref && !pref.marketingOptIn) {
        return { skipped: true, reason: 'Marketing opt-out' };
      }
    }

    if (params.scheduleAt && params.scheduleAt.getTime() > Date.now()) {
      const rendered = await emailTemplateService.render({
        templateCode: params.templateCode,
        eventType: params.eventType,
        subject: params.subject,
        htmlBody: params.htmlBody,
        textBody: params.textBody ?? params.body,
        variables: params.variables,
      });

      const queued = await emailQueueRepository.enqueue({
        queueType: 'SCHEDULED',
        status: 'PENDING',
        priority: (params.priority ?? 'NORMAL') as never,
        toEmail: params.toEmail,
        recipientUser: params.userId ? { connect: { id: params.userId } } : undefined,
        templateCode: params.templateCode,
        subject: rendered.subject,
        htmlBody: rendered.html,
        textBody: rendered.textBody,
        variables: params.variables as Prisma.InputJsonValue,
        payload: params.variables as Prisma.InputJsonValue,
        scheduledAt: params.scheduleAt,
        maxRetries: EMAIL_MAX_RETRIES,
      });
      return { scheduled: true, queueId: queued.id };
    }

    return emailOrchestratorService.dispatchNow(params);
  },

  async dispatchNow(params: SendEmailParams) {
    const channel = channelStatusService.getStatus('email');
    if (!channel.deliverable) {
      return { skipped: true, reason: channelStatusService.skipReason('email') };
    }

    const rendered = await emailTemplateService.render({
      templateCode: params.templateCode,
      eventType: params.eventType,
      subject: params.subject,
      htmlBody: params.htmlBody,
      textBody: params.textBody ?? params.body,
      variables: params.variables,
    });

    const dbProvider = await emailProviderRepository.findDefault();
    if (dbProvider?.rateLimit && !(await rateLimitService.checkAsync(`email:${dbProvider.code}`, dbProvider.rateLimit))) {
      throw new ValidationError({ rateLimit: ['Email rate limit exceeded'] });
    }

    const notificationLog = await emailLogRepository.create({
      toEmail: params.toEmail,
      subject: rendered.subject,
      body: rendered.textBody,
      payload: params.variables as Prisma.InputJsonValue,
      status: 'QUEUED',
      recipientUser: params.userId ? { connect: { id: params.userId } } : undefined,
    });

    const delivery = await emailDeliveryRepository.create({
      emailLogId: notificationLog.id,
      provider: dbProvider ? { connect: { id: dbProvider.id } } : undefined,
      status: 'QUEUED',
      queuedAt: new Date(),
    });

    await emailEventRepository.create({
      delivery: { connect: { id: delivery.id } },
      eventType: 'QUEUED',
    });

    if (params.attachments?.length) {
      await emailAttachmentRepository.createMany(
        params.attachments.map((a) => ({
          deliveryId: delivery.id,
          filename: a.filename,
          contentType: a.contentType,
          sizeBytes: a.sizeBytes,
          storageKey: a.storageKey,
          checksum: a.checksum,
        })),
      );
    }

    const provider = resolveEnterpriseEmailProvider(dbProvider?.providerType);
    const result = await provider.send({
      to: params.toEmail,
      subject: rendered.subject,
      body: rendered.textBody,
      html: rendered.html,
      from: env.EMAIL_FROM,
      fromName: env.EMAIL_FROM_NAME,
    });

    const now = new Date();
    const status = result.success ? 'SENT' : 'FAILED';

    await emailLogRepository.update(notificationLog.id, {
      status: result.success ? 'SENT' : 'FAILED',
      providerRef: result.providerRef,
      sentAt: result.success ? now : undefined,
      failedAt: result.success ? undefined : now,
      failureReason: result.error,
    });

    await emailDeliveryRepository.update(delivery.id, {
      status: result.success ? 'SENT' : 'FAILED',
      providerRef: result.providerRef,
      sentAt: result.success ? now : undefined,
      failedAt: result.success ? undefined : now,
      failureReason: result.error,
    });

    await emailEventRepository.create({
      delivery: { connect: { id: delivery.id } },
      eventType: result.success ? 'SENT' : 'FAILED',
      metadata: result.error ? { error: result.error } : undefined,
    });

    await communicationLogRepository.create({
      channel: 'EMAIL',
      eventType: params.eventType as never,
      recipientUser: params.userId ? { connect: { id: params.userId } } : undefined,
      recipientAddress: params.toEmail,
      subject: rendered.subject,
      renderedBody: rendered.textBody,
      payload: params.variables as Prisma.InputJsonValue,
      status: status as never,
      providerRef: result.providerRef,
      sentAt: result.success ? now : undefined,
      failedAt: result.success ? undefined : now,
      failureReason: result.error,
    });

    await emailAnalyticsRepository.upsertDaily({
      date: now,
      templateId: rendered.templateId,
      category: rendered.category ?? params.category,
      field: result.success ? 'sentCount' : 'failedCount',
    });

    if (!result.success) {
      await emailQueueRepository.enqueue({
        queueType: 'RETRY',
        status: 'PENDING',
        priority: (params.priority ?? 'NORMAL') as never,
        toEmail: params.toEmail,
        recipientUser: params.userId ? { connect: { id: params.userId } } : undefined,
        templateCode: params.templateCode ?? rendered.templateCode,
        subject: rendered.subject,
        htmlBody: rendered.html,
        textBody: rendered.textBody,
        variables: params.variables as Prisma.InputJsonValue,
        emailLogId: notificationLog.id,
        maxRetries: EMAIL_MAX_RETRIES,
        lastError: result.error,
      });
    }

    return { ...notificationLog, delivery, providerRef: result.providerRef, success: result.success };
  },
};
