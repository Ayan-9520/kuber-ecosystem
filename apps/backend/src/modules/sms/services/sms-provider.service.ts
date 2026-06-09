import type { Prisma } from '@kuberone/database';
import type { CreateSmsProviderInput, ListSmsProvidersQuery, UpdateSmsProviderInput } from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { smsProviderRepository } from '../repositories/sms.repository.js';
import { buildPaginationMeta } from '../utils/sms.utils.js';

export const smsProviderService = {
  async list(query: ListSmsProvidersQuery) {
    const where: Prisma.SmsProviderWhereInput = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      smsProviderRepository.list(where, skip, query.limit),
      smsProviderRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await smsProviderRepository.findById(id);
    if (!item) throw new NotFoundError('SmsProvider', id);
    return item;
  },

  async create(input: CreateSmsProviderInput) {
    const existing = await smsProviderRepository.findByCode(input.code);
    if (existing) throw new ConflictError(`SMS provider ${input.code} already exists`);
    if (input.isDefault) await smsProviderService.clearDefault();
    return smsProviderRepository.create({
      code: input.code,
      name: input.name,
      providerType: input.providerType as never,
      isActive: input.isActive ?? true,
      isDefault: input.isDefault ?? false,
      config: input.config as Prisma.InputJsonValue,
      rateLimit: input.rateLimit,
    });
  },

  async update(id: string, input: UpdateSmsProviderInput) {
    await smsProviderService.getById(id);
    if (input.isDefault) await smsProviderService.clearDefault();
    return smsProviderRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      ...(input.config !== undefined ? { config: input.config as Prisma.InputJsonValue } : {}),
      ...(input.rateLimit !== undefined ? { rateLimit: input.rateLimit } : {}),
    });
  },

  async clearDefault() {
    const providers = await smsProviderRepository.list({ isDefault: true }, 0, 100);
    await Promise.all(providers.map((p) => smsProviderRepository.update(p.id, { isDefault: false })));
  },
};
