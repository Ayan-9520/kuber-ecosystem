import type { Prisma } from '@kuberone/database';
import type {
  CreateLenderInput,
  ListLendersQuery,
  UpdateLenderInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { lenderRepository } from '../repositories/lender.repository.js';
import type { RequestContext } from '../types/product.types.js';
import { auditProductMutation, buildPaginationMeta } from '../utils/product.utils.js';

export const lenderService = {
  async list(query: ListLendersQuery) {
    const where: Prisma.LenderWhereInput = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.lenderType ? { lenderType: query.lenderType as never } : {}),
      ...(query.integrationType ? { integrationType: query.integrationType as never } : {}),
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
    const orderBy = { [query.sortBy ?? 'name']: query.sortOrder };

    const [items, total] = await Promise.all([
      lenderRepository.list(where, skip, query.limit, orderBy),
      lenderRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const lender = await lenderRepository.findById(id);
    if (!lender) throw new NotFoundError('Lender', id);
    return lender;
  },

  async create(input: CreateLenderInput, ctx: RequestContext) {
    const existing = await lenderRepository.findByCode(input.code);
    if (existing) throw new ConflictError('Lender code already exists');

    const lender = await lenderRepository.create({
      ...input,
      lenderType: input.lenderType as never,
      integrationType: input.integrationType as never,
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await auditProductMutation(authAuditRepository.log, ctx, 'LENDER_CREATED', 'lender', lender.id, input);
    return lender;
  },

  async update(id: string, input: UpdateLenderInput, ctx: RequestContext) {
    await lenderService.getById(id);
    const lender = await lenderRepository.update(id, {
      ...input,
      lenderType: input.lenderType as never,
      integrationType: input.integrationType as never,
      updatedById: ctx.actorId,
    });
    await auditProductMutation(authAuditRepository.log, ctx, 'LENDER_UPDATED', 'lender', id, input);
    return lender;
  },

  async deactivate(id: string, ctx: RequestContext) {
    await lenderService.getById(id);
    const lender = await lenderRepository.update(id, {
      isActive: false,
      updatedById: ctx.actorId,
    });
    await auditProductMutation(authAuditRepository.log, ctx, 'LENDER_DEACTIVATED', 'lender', id);
    return lender;
  },
};
