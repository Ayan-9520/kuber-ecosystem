import type { Prisma } from '@kuberone/database';
import type {
  CreateProductVariantInput,
  ListProductVariantsQuery,
  UpdateProductVariantInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { productVariantRepository } from '../repositories/product-variant.repository.js';
import type { RequestContext } from '../types/product.types.js';
import { auditProductMutation, buildPaginationMeta } from '../utils/product.utils.js';

import { productService } from './product.service.js';

export const productVariantService = {
  async list(query: ListProductVariantsQuery) {
    const where: Prisma.ProductVariantWhereInput = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.variantCode ? { variantCode: query.variantCode } : {}),
      ...(query.search ? { name: { contains: query.search } } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy ?? 'createdAt']: query.sortOrder };

    const [items, total] = await Promise.all([
      productVariantRepository.list(where, skip, query.limit, orderBy),
      productVariantRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const variant = await productVariantRepository.findById(id);
    if (!variant) throw new NotFoundError('ProductVariant', id);
    return variant;
  },

  async create(input: CreateProductVariantInput, ctx: RequestContext) {
    await productService.getById(input.productId);

    const existing = await productVariantRepository.list(
      { productId: input.productId, variantCode: input.variantCode as never },
      0,
      1,
      { createdAt: 'desc' },
    );
    if (existing.length > 0) throw new ConflictError('Variant code already exists for product');

    const variant = await productVariantRepository.create({
      ...input,
      variantCode: input.variantCode as never,
      config: input.config as Prisma.InputJsonValue,
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await auditProductMutation(authAuditRepository.log, ctx, 'PRODUCT_VARIANT_CREATED', 'product_variant', variant.id, input);
    return variant;
  },

  async update(id: string, input: UpdateProductVariantInput, ctx: RequestContext) {
    await productVariantService.getById(id);
    const variant = await productVariantRepository.update(id, {
      ...input,
      variantCode: input.variantCode as never,
      config: input.config as Prisma.InputJsonValue,
      updatedById: ctx.actorId,
    });
    await auditProductMutation(authAuditRepository.log, ctx, 'PRODUCT_VARIANT_UPDATED', 'product_variant', id, input);
    return variant;
  },

  async setActive(id: string, isActive: boolean, ctx: RequestContext) {
    await productVariantService.getById(id);
    const variant = await productVariantRepository.update(id, {
      isActive,
      updatedById: ctx.actorId,
    });
    await auditProductMutation(
      authAuditRepository.log,
      ctx,
      isActive ? 'PRODUCT_VARIANT_ACTIVATED' : 'PRODUCT_VARIANT_DEACTIVATED',
      'product_variant',
      id,
    );
    return variant;
  },
};
