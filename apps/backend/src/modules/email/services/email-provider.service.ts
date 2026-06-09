import type { Prisma } from '@kuberone/database';
import type { CreateEmailProviderInput, ListEmailProvidersQuery, UpdateEmailProviderInput } from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { emailProviderRepository } from '../repositories/email.repository.js';
import { buildPaginationMeta } from '../utils/email.utils.js';

export const emailProviderService = {
  async list(query: ListEmailProvidersQuery) {
    const where: Prisma.EmailProviderWhereInput = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      emailProviderRepository.list(where, skip, query.limit),
      emailProviderRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await emailProviderRepository.findById(id);
    if (!item) throw new NotFoundError('EmailProvider', id);
    return item;
  },

  async create(input: CreateEmailProviderInput) {
    const existing = await emailProviderRepository.findByCode(input.code);
    if (existing) throw new ConflictError(`Email provider ${input.code} already exists`);
    if (input.isDefault) {
      await emailProviderService.clearDefault();
    }
    return emailProviderRepository.create({
      code: input.code,
      name: input.name,
      providerType: input.providerType as never,
      isActive: input.isActive ?? true,
      isDefault: input.isDefault ?? false,
      config: input.config as Prisma.InputJsonValue,
      rateLimit: input.rateLimit,
    });
  },

  async update(id: string, input: UpdateEmailProviderInput) {
    await emailProviderService.getById(id);
    if (input.isDefault) await emailProviderService.clearDefault();
    return emailProviderRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      ...(input.config !== undefined ? { config: input.config as Prisma.InputJsonValue } : {}),
      ...(input.rateLimit !== undefined ? { rateLimit: input.rateLimit } : {}),
    });
  },

  async clearDefault() {
    const providers = await emailProviderRepository.list({ isDefault: true }, 0, 100);
    await Promise.all(providers.map((p) => emailProviderRepository.update(p.id, { isDefault: false })));
  },
};
