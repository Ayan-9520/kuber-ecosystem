import type { Prisma } from '@kuberone/database';
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { productFamilyRepository } from '../repositories/product-family.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import type { RequestContext } from '../types/product.types.js';
import { auditProductMutation, buildPaginationMeta } from '../utils/product.utils.js';

export const productService = {
  async list(query: ListProductsQuery) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.familyId ? { familyId: query.familyId } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
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
    const orderBy = { [query.sortBy ?? 'createdAt']: query.sortOrder };

    const [items, total] = await Promise.all([
      productRepository.list(where, skip, query.limit, orderBy),
      productRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product', id);
    return product;
  },

  async create(input: CreateProductInput, ctx: RequestContext) {
    const family = await productFamilyRepository.findById(input.familyId);
    if (!family) throw new NotFoundError('ProductFamily', input.familyId);

    const existing = await productRepository.findByCode(input.code);
    if (existing) throw new ConflictError('Product code already exists');

    if (input.minAmount >= input.maxAmount) {
      throw new ValidationError({ maxAmount: ['maxAmount must be greater than minAmount'] });
    }
    if (input.minTenureMonths > input.maxTenureMonths) {
      throw new ValidationError({ maxTenureMonths: ['maxTenureMonths must be >= minTenureMonths'] });
    }

    const product = await productRepository.create({
      ...input,
      priority: input.priority as never,
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await auditProductMutation(authAuditRepository.log, ctx, 'PRODUCT_CREATED', 'product', product.id, input);
    return product;
  },

  async update(id: string, input: UpdateProductInput, ctx: RequestContext) {
    await productService.getById(id);
    const product = await productRepository.update(id, {
      ...input,
      priority: input.priority as never,
      updatedById: ctx.actorId,
    });
    await auditProductMutation(authAuditRepository.log, ctx, 'PRODUCT_UPDATED', 'product', id, input);
    return product;
  },

  async deactivate(id: string, ctx: RequestContext) {
    await productService.getById(id);
    const product = await productRepository.update(id, {
      isActive: false,
      updatedById: ctx.actorId,
    });
    await auditProductMutation(authAuditRepository.log, ctx, 'PRODUCT_DEACTIVATED', 'product', id);
    return product;
  },

  async remove(id: string, ctx: RequestContext) {
    await productService.getById(id);
    await productRepository.softDelete(id, ctx.actorId);
    await auditProductMutation(authAuditRepository.log, ctx, 'PRODUCT_DELETED', 'product', id);
  },
};
