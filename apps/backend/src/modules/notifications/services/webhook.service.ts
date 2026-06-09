import {
  communicationLogRepository,
  emailLogRepository,
  smsLogRepository,
  whatsAppLogRepository,
} from '../repositories/notification.repository.js';

type WhatsAppWebhookEntry = {
  changes?: Array<{
    value?: {
      statuses?: Array<{ id: string; status: string; timestamp?: string }>;
      messages?: Array<{ id: string }>;
    };
  }>;
};

export const webhookService = {
  async handleWhatsApp(payload: WhatsAppWebhookEntry) {
    const statuses = payload.changes?.flatMap((c) => c.value?.statuses ?? []) ?? [];
    const results = [];
    for (const status of statuses) {
      const log = await whatsAppLogRepository.findByProviderRef(status.id);
      if (!log) continue;
      const now = new Date();
      const updates: Record<string, unknown> = { deliveryStatus: status.status };
      if (status.status === 'delivered') {
        updates.deliveredAt = now;
        updates.status = 'DELIVERED';
      } else if (status.status === 'read') {
        updates.readAt = now;
        updates.status = 'DELIVERED';
      } else if (status.status === 'failed') {
        updates.failedAt = now;
        updates.status = 'FAILED';
      }
      await whatsAppLogRepository.update(log.id, updates);
      const commLog = await communicationLogRepository.findByProviderRef(status.id);
      if (commLog) {
        await communicationLogRepository.update(commLog.id, {
          status: updates.status as never,
          deliveredAt: updates.deliveredAt as Date | undefined,
          failedAt: updates.failedAt as Date | undefined,
        });
      }
      results.push({ providerRef: status.id, status: status.status });
    }
    return results;
  },

  async handleSendGrid(events: Array<{ sg_message_id?: string; event?: string }>) {
    const results = [];
    for (const event of events) {
      if (!event.sg_message_id) continue;
      const ref = event.sg_message_id.split('.')[0] ?? event.sg_message_id;
      const log = await emailLogRepository.findByProviderRef(ref);
      if (!log) continue;
      const now = new Date();
      if (event.event === 'delivered') {
        await emailLogRepository.update(log.id, { status: 'DELIVERED', deliveredAt: now });
      } else if (event.event === 'open') {
        await emailLogRepository.update(log.id, { status: 'OPENED', openedAt: now });
      } else if (event.event === 'bounce' || event.event === 'dropped') {
        await emailLogRepository.update(log.id, { status: 'FAILED', failedAt: now, failureReason: event.event });
      }
      const commLog = ref ? await communicationLogRepository.findByProviderRef(ref) : null;
      if (commLog) {
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

  async handleSmsDlr(payload: { request_id?: string; status?: string }) {
    if (!payload.request_id) return [];
    const log = await smsLogRepository.findByProviderRef(payload.request_id);
    if (!log) return [];
    const now = new Date();
    const status = payload.status?.toLowerCase();
    if (status === 'delivered') {
      await smsLogRepository.update(log.id, { status: 'DELIVERED', deliveredAt: now });
    } else if (status === 'failed') {
      await smsLogRepository.update(log.id, { status: 'FAILED', failedAt: now });
    }
    return [{ providerRef: payload.request_id, status: payload.status }];
  },
};
