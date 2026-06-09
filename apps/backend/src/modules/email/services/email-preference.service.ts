import type { Prisma } from '@kuberone/database';
import type { ListEmailPreferencesQuery, UpsertEmailPreferenceInput } from '@kuberone/shared-validation';

import { emailPreferenceRepository } from '../repositories/email.repository.js';
import { buildPaginationMeta } from '../utils/email.utils.js';

export const emailPreferenceService = {
  async list(query: ListEmailPreferencesQuery) {
    const where: Prisma.EmailPreferenceWhereInput = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.category ? { category: query.category as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      emailPreferenceRepository.list(where, skip, query.limit),
      emailPreferenceRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async upsert(input: UpsertEmailPreferenceInput) {
    return emailPreferenceRepository.upsert(
      input.userId,
      input.category ?? null,
      input.eventType ?? null,
      { enabled: input.enabled, marketingOptIn: input.marketingOptIn },
    );
  },
};
