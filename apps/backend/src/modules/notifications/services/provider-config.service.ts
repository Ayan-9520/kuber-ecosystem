import type { Prisma } from '@kuberone/database';
import type { CreateCommunicationProviderInput, ListCommunicationProvidersQuery, UpdateCommunicationProviderInput } from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { communicationProviderRepository } from '../repositories/communication-channels.repository.js';
import { buildPaginationMeta } from '../utils/notifications.utils.js';

export const providerConfigService = {
  async list(query: ListCommunicationProvidersQuery) {
    const where: Prisma.CommunicationProviderWhereInput = {
      ...(query.channel ? { channel: query.channel as never } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      communicationProviderRepository.list(where, skip, query.limit),
      communicationProviderRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await communicationProviderRepository.findById(id);
    if (!item) throw new NotFoundError('CommunicationProvider', id);
    return item;
  },

  async create(input: CreateCommunicationProviderInput) {
    const existing = await communicationProviderRepository.findByCode(input.code);
    if (existing) throw new ConflictError(`Provider code ${input.code} already exists`);
    if (input.isDefault) {
      await providerConfigService.clearDefault(input.channel);
    }
    return communicationProviderRepository.create({
      code: input.code,
      name: input.name,
      channel: input.channel as never,
      providerType: input.providerType as never,
      isActive: input.isActive ?? true,
      isDefault: input.isDefault ?? false,
      config: input.config as Prisma.InputJsonValue,
      rateLimit: input.rateLimit,
    });
  },

  async update(id: string, input: UpdateCommunicationProviderInput) {
    await providerConfigService.getById(id);
    if (input.isDefault && input.channel) {
      await providerConfigService.clearDefault(input.channel);
    }
    return communicationProviderRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      ...(input.config !== undefined ? { config: input.config as Prisma.InputJsonValue } : {}),
      ...(input.rateLimit !== undefined ? { rateLimit: input.rateLimit } : {}),
    });
  },

  async clearDefault(channel: string) {
    const providers = await communicationProviderRepository.list({ channel: channel as never, isDefault: true }, 0, 100);
    await Promise.all(providers.map((p) => communicationProviderRepository.update(p.id, { isDefault: false })));
  },

  async getRateLimit(channel: string): Promise<number | null> {
    const provider = await communicationProviderRepository.findDefault(channel);
    return provider?.rateLimit ?? null;
  },
};
