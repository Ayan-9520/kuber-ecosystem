import type { TrackPushEventInput } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { rateLimitService } from '../../notifications/services/rate-limit.service.js';
import {
  pushAnalyticsRepository,
  pushDeliveryRepository,
  pushEventRepository,
  pushNotificationLogRepository,
} from '../repositories/push.repository.js';

const EVENT_STATUS_MAP: Record<string, { status: string; field: 'deliveredCount' | 'openedCount' | 'clickedCount' | 'dismissedCount'; dateField: string }> = {
  DELIVERED: { status: 'DELIVERED', field: 'deliveredCount', dateField: 'deliveredAt' },
  OPENED: { status: 'OPENED', field: 'openedCount', dateField: 'openedAt' },
  CLICKED: { status: 'CLICKED', field: 'clickedCount', dateField: 'clickedAt' },
  DISMISSED: { status: 'DISMISSED', field: 'dismissedCount', dateField: 'dismissedAt' },
};

export const pushTrackingService = {
  async trackEvent(input: TrackPushEventInput) {
    const rateKey = `push-track:${input.deliveryId ?? input.providerRef ?? 'anon'}`;
    if (!rateLimitService.check(rateKey, 60)) {
      return { success: false, reason: 'Rate limit exceeded' };
    }

    const delivery = input.deliveryId
      ? (await pushDeliveryRepository.findById(input.deliveryId)) ??
        (await pushDeliveryRepository.findByPushNotificationId(input.deliveryId))
      : input.providerRef
        ? await pushDeliveryRepository.findByProviderRef(input.providerRef)
        : null;

    if (!delivery) throw new NotFoundError('PushNotificationDelivery', input.deliveryId ?? input.providerRef ?? 'unknown');

    const mapping = EVENT_STATUS_MAP[input.eventType];
    if (!mapping) throw new NotFoundError('PushEventType', input.eventType);
    const now = new Date();

    const statusUpdate: Record<string, unknown> = { status: mapping.status };
    if (input.eventType === 'DELIVERED') statusUpdate.deliveredAt = now;
    if (input.eventType === 'OPENED') statusUpdate.openedAt = now;
    if (input.eventType === 'CLICKED') statusUpdate.clickedAt = now;
    if (input.eventType === 'DISMISSED') statusUpdate.dismissedAt = now;
    await pushDeliveryRepository.update(delivery.id, statusUpdate as never);

    await pushEventRepository.create({
      delivery: { connect: { id: delivery.id } },
      eventType: input.eventType as never,
      metadata: input.metadata as never,
    });

    await pushNotificationLogRepository.create({
      delivery: { connect: { id: delivery.id } },
      action: input.eventType,
      status: mapping.status,
      metadata: input.metadata as never,
    });

    await pushAnalyticsRepository.upsertDaily({
      date: now,
      templateId: delivery.templateId ?? undefined,
      providerId: delivery.providerId ?? undefined,
      field: mapping.field,
    });

    return { success: true, deliveryId: delivery.id };
  },
};
