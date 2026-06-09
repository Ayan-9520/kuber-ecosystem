import type { Prisma } from '@kuberone/database';
import type { ListPushPreferencesQuery, UpsertPushPreferenceInput } from '@kuberone/shared-validation';

import { pushPreferenceRepository } from '../repositories/push.repository.js';
import { buildPaginationMeta } from '../utils/push.utils.js';

export const pushPreferenceService = {
  async list(query: ListPushPreferencesQuery) {
    const where: Prisma.PushPreferenceWhereInput = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.category ? { category: query.category as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      pushPreferenceRepository.list(where, skip, query.limit),
      pushPreferenceRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async upsert(input: UpsertPushPreferenceInput) {
    return pushPreferenceRepository.upsert(
      input.userId,
      input.pushDeviceId ?? null,
      input.category ?? null,
      input.eventType ?? null,
      {
        enabled: input.enabled,
        marketingOptIn: input.marketingOptIn,
        doNotDisturb: input.doNotDisturb,
        muteUntil: input.muteUntil,
      },
    );
  },
};
