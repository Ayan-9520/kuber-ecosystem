import type { Prisma } from '@kuberone/database';
import type { CreatePushProviderInput, ListPushProvidersQuery, UpdatePushProviderInput } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { pushProviderRepository } from '../repositories/push.repository.js';
import { buildPaginationMeta } from '../utils/push.utils.js';

export const pushProviderService = {
  async list(query: ListPushProvidersQuery) {
    const where: Prisma.PushProviderWhereInput = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      pushProviderRepository.list(where, skip, query.limit),
      pushProviderRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await pushProviderRepository.findById(id);
    if (!item) throw new NotFoundError('PushProvider', id);
    return item;
  },

  async create(input: CreatePushProviderInput) {
    return pushProviderRepository.create({
      code: input.code,
      name: input.name,
      providerType: input.providerType as never,
      isActive: input.isActive,
      isDefault: input.isDefault,
      config: input.config as Prisma.InputJsonValue,
      rateLimit: input.rateLimit,
    });
  },

  async update(id: string, input: UpdatePushProviderInput) {
    await pushProviderService.getById(id);
    return pushProviderRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.providerType !== undefined ? { providerType: input.providerType as never } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      ...(input.config !== undefined ? { config: input.config as Prisma.InputJsonValue } : {}),
      ...(input.rateLimit !== undefined ? { rateLimit: input.rateLimit } : {}),
    });
  },
};
