import type { ListChannelLogsQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { smsDeliveryService } from '../../sms/services/sms-delivery.service.js';
import { smsOrchestratorService } from '../../sms/sms.module.js';
import { smsLogRepository } from '../repositories/notification.repository.js';

/** Notification channel adapter — delegates to enterprise SMS orchestrator. */
export const smsService = {
  async list(query: ListChannelLogsQuery) {
    return smsDeliveryService.list(query as never);
  },

  async getById(id: string) {
    try {
      return await smsDeliveryService.getById(id);
    } catch {
      const legacy = await smsLogRepository.findById(id);
      if (!legacy) throw new NotFoundError('SmsLog', id);
      return legacy;
    }
  },

  async send(params: {
    userId?: string;
    toPhone: string;
    templateCode?: string;
    body?: string;
    variables?: Record<string, unknown>;
    eventType?: string;
    category?: string;
    priority?: string;
    scheduleAt?: Date;
    isOtp?: boolean;
    otpPurpose?: string;
    retryCount?: number;
  }) {
    return smsOrchestratorService.send({
      toPhone: params.toPhone,
      userId: params.userId,
      templateCode: params.templateCode,
      body: params.body,
      variables: params.variables,
      eventType: params.eventType,
      category: params.category,
      priority: params.priority,
      scheduleAt: params.scheduleAt,
      isOtp: params.isOtp,
      otpPurpose: params.otpPurpose,
      retryCount: params.retryCount,
    });
  },
};
