import type { Prisma } from '@kuberone/database';
import type {
  CreateTicketCategoryInput,
  ListTicketCategoriesQuery,
  UpdateTicketCategoryInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { ticketCategoryRepository } from '../repositories/ticket.repository.js';
import { buildPaginationMeta } from '../utils/support.utils.js';

export const ticketCategoryService = {
  async list(query: ListTicketCategoriesQuery) {
    const where: Prisma.TicketCategoryWhereInput = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { code: { contains: query.search } },
            ],
          }
        : {}),
    };

    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      ticketCategoryRepository.list(where, skip, query.limit, orderBy),
      ticketCategoryRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const category = await ticketCategoryRepository.findById(id);
    if (!category) throw new NotFoundError('TicketCategory', id);
    return category;
  },

  async create(input: CreateTicketCategoryInput) {
    return ticketCategoryRepository.create({
      code: input.code,
      name: input.name,
      description: input.description,
      sortOrder: input.sortOrder,
    });
  },

  async update(id: string, input: UpdateTicketCategoryInput) {
    await ticketCategoryService.getById(id);
    return ticketCategoryRepository.update(id, {
      code: input.code,
      name: input.name,
      description: input.description,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    });
  },
};
