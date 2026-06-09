import type {
  BulkUpsertPreferencesInput,
  ListNotificationPreferencesQuery,
  UpsertNotificationPreferenceInput,
} from '@kuberone/shared-validation';

import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { notificationPreferenceRepository } from '../repositories/notification.repository.js';
import type { RequestContext } from '../types/notifications.types.js';
import { auditNotificationMutation, buildPaginationMeta } from '../utils/notifications.utils.js';

export const notificationPreferenceService = {
  async list(query: ListNotificationPreferencesQuery) {
    const where = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.eventType ? { eventType: query.eventType as never } : {}),
      ...(query.channel ? { channel: query.channel as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { eventType: query.sortOrder };

    const [items, total] = await Promise.all([
      notificationPreferenceRepository.list(where, skip, query.limit, orderBy),
      notificationPreferenceRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async upsert(input: UpsertNotificationPreferenceInput, ctx: RequestContext) {
    const item = await notificationPreferenceRepository.upsert(
      input.userId,
      input.eventType,
      input.channel,
      input.enabled,
    );
    await auditNotificationMutation(authAuditRepository.log, ctx, 'NOTIFICATION_PREFERENCE_UPSERT', item.id, input);
    return item;
  },

  async bulkUpsert(input: BulkUpsertPreferencesInput, ctx: RequestContext) {
    const results = [];
    for (const pref of input.preferences) {
      results.push(
        await notificationPreferenceRepository.upsert(input.userId, pref.eventType, pref.channel, pref.enabled),
      );
    }
    await auditNotificationMutation(authAuditRepository.log, ctx, 'NOTIFICATION_PREFERENCES_BULK', input.userId, {
      count: results.length,
    });
    return results;
  },
};
