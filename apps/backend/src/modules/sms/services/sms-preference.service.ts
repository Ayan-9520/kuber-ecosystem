import type { Prisma } from '@kuberone/database';
import type { ListSmsPreferencesQuery, UpsertSmsPreferenceInput } from '@kuberone/shared-validation';

import { smsPreferenceRepository } from '../repositories/sms.repository.js';
import { buildPaginationMeta } from '../utils/sms.utils.js';

export const smsPreferenceService = {
  async list(query: ListSmsPreferencesQuery) {
    const where: Prisma.SmsPreferenceWhereInput = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.category ? { category: query.category as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      smsPreferenceRepository.list(where, skip, query.limit),
      smsPreferenceRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async upsert(input: UpsertSmsPreferenceInput) {
    return smsPreferenceRepository.upsert(
      input.userId,
      input.category ?? null,
      input.eventType ?? null,
      { enabled: input.enabled, marketingOptIn: input.marketingOptIn },
    );
  },
};
