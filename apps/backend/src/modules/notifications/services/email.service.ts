import type { ListChannelLogsQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { emailOrchestratorService } from '../../email/email.module.js';
import { emailDeliveryService } from '../../email/services/email-delivery.service.js';
import { emailLogRepository } from '../repositories/notification.repository.js';

/** Notification channel adapter — delegates to enterprise email orchestrator. */
export const emailService = {
  async list(query: ListChannelLogsQuery) {
    return emailDeliveryService.list(query as never);
  },

  async getById(id: string) {
    try {
      return await emailDeliveryService.getById(id);
    } catch {
      const legacy = await emailLogRepository.findById(id);
      if (!legacy) throw new NotFoundError('EmailLog', id);
      return legacy;
    }
  },

  async send(params: {
    userId?: string;
    toEmail: string;
    templateCode?: string;
    subject?: string;
    body?: string;
    variables?: Record<string, unknown>;
    eventType?: string;
    category?: string;
    priority?: string;
    scheduleAt?: Date;
  }) {
    return emailOrchestratorService.send({
      toEmail: params.toEmail,
      userId: params.userId,
      templateCode: params.templateCode,
      subject: params.subject,
      textBody: params.body,
      variables: params.variables,
      eventType: params.eventType,
      category: params.category,
      priority: params.priority,
      scheduleAt: params.scheduleAt,
    });
  },
};
