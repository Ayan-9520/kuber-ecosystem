import { communicationLogRepository, smsLogRepository } from '../../notifications/repositories/notification.repository.js';
import { smsAnalyticsRepository, smsDeliveryRepository, smsEventRepository } from '../repositories/sms.repository.js';

export const smsWebhookService = {
  async handleDlr(payload: { request_id?: string; status?: string; message_id?: string }) {
    const ref = payload.request_id ?? payload.message_id;
    if (!ref) return [];

    const delivery = await smsDeliveryRepository.findByProviderRef(ref);
    const log = await smsLogRepository.findByProviderRef(ref);
    const now = new Date();
    const status = payload.status?.toLowerCase();

    if (delivery) {
      const updates: Record<string, unknown> = {};
      let eventType: 'DELIVERED' | 'FAILED' | 'REJECTED' | 'EXPIRED' = 'DELIVERED';

      if (status === 'delivered') {
        updates.status = 'DELIVERED';
        updates.deliveredAt = now;
        eventType = 'DELIVERED';
      } else if (status === 'failed') {
        updates.status = 'FAILED';
        updates.failedAt = now;
        eventType = 'FAILED';
      } else if (status === 'rejected') {
        updates.status = 'REJECTED';
        updates.rejectedAt = now;
        eventType = 'REJECTED';
      } else if (status === 'expired') {
        updates.status = 'EXPIRED';
        updates.expiredAt = now;
        eventType = 'EXPIRED';
      }

      if (Object.keys(updates).length) {
        await smsDeliveryRepository.update(delivery.id, updates);
        await smsEventRepository.create({
          delivery: { connect: { id: delivery.id } },
          eventType,
          metadata: { providerStatus: payload.status },
        });
        const field = eventType === 'DELIVERED' ? 'deliveredCount' : eventType === 'REJECTED' ? 'rejectedCount' : 'failedCount';
        await smsAnalyticsRepository.upsertDaily({ date: now, field });
      }
    }

    if (log && status === 'delivered') {
      await smsLogRepository.update(log.id, { status: 'DELIVERED', deliveredAt: now });
    }

    const commLog = await communicationLogRepository.findByProviderRef(ref);
    if (commLog && status === 'delivered') {
      await communicationLogRepository.update(commLog.id, { status: 'DELIVERED', deliveredAt: now });
    }

    return [{ providerRef: ref, status: payload.status }];
  },
};
