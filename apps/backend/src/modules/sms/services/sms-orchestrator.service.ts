import type { Prisma } from '@kuberone/database';

import { ValidationError } from '../../../shared/errors/app-error.js';
import { communicationLogRepository, smsLogRepository } from '../../notifications/repositories/notification.repository.js';
import { rateLimitService } from '../../notifications/services/rate-limit.service.js';
import { SMS_MAX_RETRIES, TRANSACTIONAL_SMS_EVENTS } from '../constants/sms.constants.js';
import { resolveEnterpriseSmsProvider } from '../providers/sms.factory.js';
import {
  smsAnalyticsRepository,
  smsDeliveryRepository,
  smsEventRepository,
  smsPreferenceRepository,
  smsProviderRepository,
  smsQueueRepository,
} from '../repositories/sms.repository.js';
import type { SendSmsParams } from '../types/sms.types.js';
import { normalizePhone, validatePhone } from '../utils/sms.utils.js';

import { smsTemplateService } from './sms-template.service.js';

export const smsOrchestratorService = {
  async send(params: SendSmsParams) {
    const toPhone = normalizePhone(params.toPhone);
    if (!validatePhone(params.toPhone)) {
      throw new ValidationError({ toPhone: ['Invalid mobile number'] });
    }

    const isTransactional = params.isOtp || (params.eventType && TRANSACTIONAL_SMS_EVENTS.has(params.eventType));
    if (params.userId && !isTransactional && params.category !== 'OTP') {
      const pref = await smsPreferenceRepository.findForUser(params.userId, params.category, params.eventType);
      if (pref && !pref.enabled) return { skipped: true, reason: 'User SMS preference disabled' };
      if (params.category === 'MARKETING' && pref && !pref.marketingOptIn) return { skipped: true, reason: 'Marketing opt-out' };
    }

    if (params.scheduleAt && params.scheduleAt.getTime() > Date.now()) {
      const rendered = await smsTemplateService.render({
        templateCode: params.templateCode,
        eventType: params.eventType,
        body: params.body,
        variables: params.variables,
      });
      const queued = await smsQueueRepository.enqueue({
        queueType: params.isOtp ? 'OTP' : 'SCHEDULED',
        status: 'PENDING',
        priority: (params.priority ?? (params.isOtp ? 'URGENT' : 'NORMAL')) as never,
        toPhone,
        recipientUser: params.userId ? { connect: { id: params.userId } } : undefined,
        templateCode: params.templateCode,
        body: rendered.body,
        variables: params.variables as Prisma.InputJsonValue,
        scheduledAt: params.scheduleAt,
        maxRetries: SMS_MAX_RETRIES,
      });
      return { scheduled: true, queueId: queued.id };
    }

    return smsOrchestratorService.dispatchNow({ ...params, toPhone });
  },

  async dispatchNow(params: SendSmsParams & { toPhone: string }) {
    const rendered = await smsTemplateService.render({
      templateCode: params.templateCode,
      eventType: params.eventType,
      body: params.body,
      variables: params.variables,
    });

    const dbProvider = await smsProviderRepository.findDefault();
    const rateKey = params.isOtp ? `sms:otp:${params.toPhone}` : `sms:${dbProvider?.code ?? 'default'}`;
    const rateLimit = dbProvider?.rateLimit ?? (params.isOtp ? 5 : null);
    if (rateLimit && !rateLimitService.check(rateKey, rateLimit)) {
      throw new ValidationError({ rateLimit: ['SMS rate limit exceeded'] });
    }

    const notificationLog = await smsLogRepository.create({
      toPhone: params.toPhone,
      body: rendered.body,
      payload: params.variables as Prisma.InputJsonValue,
      status: 'QUEUED',
      retryCount: params.retryCount ?? 0,
      recipientUser: params.userId ? { connect: { id: params.userId } } : undefined,
    });

    const delivery = await smsDeliveryRepository.create({
      smsLogId: notificationLog.id,
      provider: dbProvider ? { connect: { id: dbProvider.id } } : undefined,
      status: 'QUEUED',
      isOtp: params.isOtp ?? false,
      otpPurpose: params.otpPurpose,
      queuedAt: new Date(),
    });

    await smsEventRepository.create({
      delivery: { connect: { id: delivery.id } },
      eventType: 'QUEUED',
    });

    const provider = resolveEnterpriseSmsProvider(dbProvider?.providerType);
    const result = await provider.send({
      to: params.toPhone,
      body: rendered.body,
      dltTemplateId: rendered.dltTemplateId ?? undefined,
    });

    const now = new Date();
    const failed = !result.success;
    const retryCount = notificationLog.retryCount;

    await smsLogRepository.update(notificationLog.id, {
      status: failed ? (retryCount >= SMS_MAX_RETRIES ? 'FAILED' : 'QUEUED') : 'SENT',
      providerRef: result.providerRef,
      sentAt: failed ? undefined : now,
      failedAt: failed ? now : undefined,
      failureReason: result.error,
      retryCount: failed ? retryCount + 1 : retryCount,
    });

    await smsDeliveryRepository.update(delivery.id, {
      status: failed ? 'FAILED' : 'SENT',
      providerRef: result.providerRef,
      sentAt: failed ? undefined : now,
      failedAt: failed ? now : undefined,
      failureReason: result.error,
      retryCount: failed ? retryCount + 1 : retryCount,
    });

    await smsEventRepository.create({
      delivery: { connect: { id: delivery.id } },
      eventType: failed ? 'FAILED' : 'SENT',
      metadata: result.error ? { error: result.error } : undefined,
    });

    await communicationLogRepository.create({
      channel: 'SMS',
      eventType: params.eventType as never,
      recipientUser: params.userId ? { connect: { id: params.userId } } : undefined,
      recipientAddress: params.toPhone,
      renderedBody: rendered.body,
      payload: params.variables as Prisma.InputJsonValue,
      status: failed ? 'FAILED' : 'SENT',
      providerRef: result.providerRef,
      sentAt: failed ? undefined : now,
      failedAt: failed ? now : undefined,
      failureReason: result.error,
      retryCount: failed ? retryCount + 1 : retryCount,
    });

    const analyticsField = params.isOtp ? 'otpSentCount' : result.success ? 'sentCount' : 'failedCount';
    await smsAnalyticsRepository.upsertDaily({
      date: now,
      templateId: rendered.templateId,
      category: rendered.category ?? params.category ?? (params.isOtp ? 'OTP' : undefined),
      providerId: dbProvider?.id,
      field: analyticsField,
    });

    if (failed && retryCount < SMS_MAX_RETRIES) {
      await smsQueueRepository.enqueue({
        queueType: 'RETRY',
        status: 'PENDING',
        priority: (params.priority ?? 'NORMAL') as never,
        toPhone: params.toPhone,
        templateCode: params.templateCode ?? rendered.templateCode,
        body: rendered.body,
        variables: params.variables as Prisma.InputJsonValue,
        smsLogId: notificationLog.id,
        maxRetries: SMS_MAX_RETRIES,
        lastError: result.error,
      });
    }

    return { ...notificationLog, delivery, providerRef: result.providerRef, success: result.success };
  },
};
