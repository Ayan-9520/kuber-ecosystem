import type {
  CreateProductFamilyInput,
  ListQuery,
  UpdateProductFamilyInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { productFamilyRepository } from '../repositories/product-family.repository.js';
import type { RequestContext } from '../types/product.types.js';
import { auditProductMutation, buildPaginationMeta } from '../utils/product.utils.js';

export const productFamilyService = {
  async list(query: ListQuery & { sortBy?: string }) {
    const where = {
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
    const orderBy = { [query.sortBy ?? 'displayOrder']: query.sortOrder };

    const [items, total] = await Promise.all([
      productFamilyRepository.list(where, skip, query.limit, orderBy),
      productFamilyRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const family = await productFamilyRepository.findById(id);
    if (!family) throw new NotFoundError('ProductFamily', id);
    return family;
  },

  async create(input: CreateProductFamilyInput, ctx: RequestContext) {
    const existing = await productFamilyRepository.findByCode(input.code);
    if (existing) throw new ConflictError('Product family code already exists');

    const family = await productFamilyRepository.create({
      ...input,
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await auditProductMutation(authAuditRepository.log, ctx, 'PRODUCT_FAMILY_CREATED', 'product_family', family.id, input);
    return family;
  },

  async update(id: string, input: UpdateProductFamilyInput, ctx: RequestContext) {
    await productFamilyService.getById(id);
    const family = await productFamilyRepository.update(id, {
      ...input,
      updatedById: ctx.actorId,
    });
    await auditProductMutation(authAuditRepository.log, ctx, 'PRODUCT_FAMILY_UPDATED', 'product_family', id, input);
    return family;
  },

  async deactivate(id: string, ctx: RequestContext) {
    await productFamilyService.getById(id);
    const family = await productFamilyRepository.update(id, {
      isActive: false,
      updatedById: ctx.actorId,
    });
    await auditProductMutation(authAuditRepository.log, ctx, 'PRODUCT_FAMILY_DEACTIVATED', 'product_family', id);
    return family;
  },
};
