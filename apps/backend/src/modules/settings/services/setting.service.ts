import type { Prisma } from '@kuberone/database';
import type { ListSettingsQuery, UpdateSettingInput } from '@kuberone/shared-validation';

import { NotFoundError, ValidationError } from '../../../shared/errors/app-error.js';
import { settingRepository } from '../repositories/setting.repository.js';

export interface RequestContext {
  actorId: string;
}

function toSettingResponse(row: { id: string; key: string; value: unknown; category: string; updatedAt: Date }) {
  return {
    id: row.id,
    key: row.key,
    value: row.value,
    category: row.category,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function buildPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function buildListWhere(query: ListSettingsQuery): Prisma.SystemSettingWhereInput {
  return {
    ...(query.category ? { category: query.category } : {}),
    ...(query.search
      ? {
          OR: [{ key: { contains: query.search } }, { category: { contains: query.search } }],
        }
      : {}),
  };
}

export const settingService = {
  health: async (): Promise<{ module: string; status: string }> => ({
    module: 'settings',
    status: 'ok',
  }),

  async list(query: ListSettingsQuery) {
    const where = buildListWhere(query);
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await Promise.all([
      settingRepository.list(where, skip, query.limit),
      settingRepository.count(where),
    ]);

    return {
      items: rows.map(toSettingResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getByKey(key: string) {
    const row = await settingRepository.findByKey(key);
    if (!row) throw new NotFoundError('Setting', key);
    return toSettingResponse(row);
  },

  async update(key: string, input: UpdateSettingInput, ctx: RequestContext) {
    const existing = await settingRepository.findByKey(key);
    if (!existing) throw new NotFoundError('Setting', key);

    const row = await settingRepository.update(key, {
      value: input.value as Prisma.InputJsonValue,
      ...(input.category !== undefined ? { category: input.category } : {}),
      updatedById: ctx.actorId,
    });

    return toSettingResponse(row);
  },

  async upsert(key: string, input: UpdateSettingInput, ctx: RequestContext) {
    const existing = await settingRepository.findByKey(key);
    const category = input.category ?? existing?.category;

    if (!category) {
      throw new ValidationError({ category: ['Category is required when creating a setting'] });
    }

    const row = await settingRepository.upsert(key, {
      value: input.value as Prisma.InputJsonValue,
      category,
      updatedById: ctx.actorId,
    });

    return toSettingResponse(row);
  },
};
