import type { ListChannelLogsQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { pushDeliveryService } from '../../push/services/push-delivery.service.js';
import { pushDeviceService } from '../../push/services/push-device.service.js';
import { pushOrchestratorService } from '../../push/services/push-orchestrator.service.js';
import { pushTopicService } from '../../push/services/push-topic.service.js';
import { pushNotificationRepository } from '../repositories/notification.repository.js';

/** Notification channel adapter — delegates to enterprise push orchestrator. */
export const pushService = {
  async list(query: ListChannelLogsQuery) {
    return pushDeliveryService.list(query as never);
  },

  async getById(id: string) {
    try {
      return await pushDeliveryService.getById(id);
    } catch {
      const legacy = await pushNotificationRepository.findById(id);
      if (!legacy) throw new NotFoundError('PushNotification', id);
      return legacy;
    }
  },

  async registerDevice(userId: string, params: { deviceId: string; platform: string; fcmToken?: string; appVersion?: string; appTarget?: string }) {
    return pushDeviceService.register(userId, {
      deviceId: params.deviceId,
      platform: params.platform as 'IOS' | 'ANDROID' | 'WEB',
      fcmToken: params.fcmToken,
      appVersion: params.appVersion,
      appTarget: (params.appTarget as 'CUSTOMER' | 'DSA' | 'EMPLOYEE' | 'ALL') ?? 'CUSTOMER',
    });
  },

  async subscribeTopic(userId: string, topicCode: string, deviceId?: string) {
    return pushTopicService.subscribe(userId, { topicCode, deviceId });
  },

  async unsubscribeTopic(userId: string, topicCode: string, deviceId?: string) {
    return pushTopicService.unsubscribe(userId, { topicCode, deviceId });
  },

  async listTopics(userId: string) {
    return pushTopicService.listSubscriptions(userId);
  },

  async sendToTopic(params: {
    topicCode: string;
    templateCode?: string;
    title?: string;
    body?: string;
    variables?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    eventType?: string;
  }) {
    return pushTopicService.sendToTopic(params);
  },

  async send(params: {
    userId: string;
    deviceId?: string;
    templateCode?: string;
    title?: string;
    body?: string;
    variables?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    eventType?: string;
    category?: string;
    priority?: string;
    scheduleAt?: Date;
    appTarget?: string;
  }) {
    return pushOrchestratorService.send({
      userId: params.userId,
      deviceId: params.deviceId,
      templateCode: params.templateCode,
      title: params.title,
      body: params.body,
      variables: params.variables,
      payload: params.payload,
      eventType: params.eventType,
      category: params.category,
      priority: params.priority,
      scheduleAt: params.scheduleAt,
      appTarget: params.appTarget,
    });
  },
};
