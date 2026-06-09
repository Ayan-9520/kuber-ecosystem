import { emailLogRepository } from '../../notifications/repositories/notification.repository.js';
import { communicationLogRepository } from '../../notifications/repositories/notification.repository.js';
import { emailAnalyticsRepository, emailDeliveryRepository, emailEventRepository } from '../repositories/email.repository.js';

export const emailWebhookService = {
  async handleSendGrid(events: Array<{ sg_message_id?: string; event?: string }>) {
    const results = [];
    for (const event of events) {
      if (!event.sg_message_id) continue;
      const ref = event.sg_message_id.split('.')[0] ?? event.sg_message_id;
      const delivery = await emailDeliveryRepository.findByProviderRef(ref);
      const log = await emailLogRepository.findByProviderRef(ref);
      const now = new Date();

      if (delivery) {
        const updates: Record<string, unknown> = {};
        let eventType: 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'FAILED' = 'DELIVERED';

        if (event.event === 'delivered') {
          updates.status = 'DELIVERED';
          updates.deliveredAt = now;
          eventType = 'DELIVERED';
        } else if (event.event === 'open') {
          updates.status = 'OPENED';
          updates.openedAt = now;
          eventType = 'OPENED';
        } else if (event.event === 'click') {
          updates.status = 'CLICKED';
          updates.clickedAt = now;
          eventType = 'CLICKED';
        } else if (event.event === 'bounce') {
          updates.status = 'BOUNCED';
          updates.bouncedAt = now;
          eventType = 'BOUNCED';
        } else if (event.event === 'dropped') {
          updates.status = 'FAILED';
          updates.failedAt = now;
          eventType = 'FAILED';
        }

        if (Object.keys(updates).length) {
          await emailDeliveryRepository.update(delivery.id, updates);
          await emailEventRepository.create({
            delivery: { connect: { id: delivery.id } },
            eventType,
            metadata: { providerEvent: event.event },
          });

          const analyticsField =
            eventType === 'DELIVERED' ? 'deliveredCount' :
            eventType === 'OPENED' ? 'openedCount' :
            eventType === 'CLICKED' ? 'clickedCount' :
            eventType === 'BOUNCED' ? 'bouncedCount' : 'failedCount';

          await emailAnalyticsRepository.upsertDaily({ date: now, field: analyticsField });
        }
      }

      if (log) {
        if (event.event === 'delivered') await emailLogRepository.update(log.id, { status: 'DELIVERED', deliveredAt: now });
        else if (event.event === 'open') await emailLogRepository.update(log.id, { status: 'OPENED', openedAt: now });
        else if (event.event === 'bounce' || event.event === 'dropped') {
          await emailLogRepository.update(log.id, { status: 'FAILED', failedAt: now, failureReason: event.event });
        }
      }

      const commLog = await communicationLogRepository.findByProviderRef(ref);
      if (commLog && event.event) {
        await communicationLogRepository.update(commLog.id, {
          status: event.event === 'open' ? 'OPENED' : event.event === 'delivered' ? 'DELIVERED' : commLog.status,
          deliveredAt: event.event === 'delivered' ? now : commLog.deliveredAt,
          openedAt: event.event === 'open' ? now : commLog.openedAt,
        });
      }

      results.push({ providerRef: ref, event: event.event });
    }
    return results;
  },
};
