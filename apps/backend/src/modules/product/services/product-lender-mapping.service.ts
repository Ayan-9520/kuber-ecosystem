import type { Prisma } from '@kuberone/database';
import type {
  CreateProductLenderMappingInput,
  ListProductLenderMappingsQuery,
  UpdateProductLenderMappingInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { productLenderMappingRepository } from '../repositories/product-lender-mapping.repository.js';
import type { RequestContext } from '../types/product.types.js';
import { auditProductMutation, buildPaginationMeta } from '../utils/product.utils.js';

import { lenderService } from './lender.service.js';
import { productService } from './product.service.js';

export const productLenderMappingService = {
  async list(query: ListProductLenderMappingsQuery) {
    const where: Prisma.ProductLenderMappingWhereInput = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.variantId ? { variantId: query.variantId } : {}),
      ...(query.lenderId ? { lenderId: query.lenderId } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy ?? 'priority']: query.sortOrder };

    const [items, total] = await Promise.all([
      productLenderMappingRepository.list(where, skip, query.limit, orderBy),
      productLenderMappingRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const mapping = await productLenderMappingRepository.findById(id);
    if (!mapping) throw new NotFoundError('ProductLenderMapping', id);
    return mapping;
  },

  async create(input: CreateProductLenderMappingInput, ctx: RequestContext) {
    await productService.getById(input.productId);
    await lenderService.getById(input.lenderId);

    const mapping = await productLenderMappingRepository.create({
      productId: input.productId,
      variantId: input.variantId,
      lenderId: input.lenderId,
      lenderPolicyId: input.lenderPolicyId,
      eligibilityRuleIds: input.eligibilityRuleIds as Prisma.InputJsonValue,
      documentRuleIds: input.documentRuleIds as Prisma.InputJsonValue,
      priority: input.priority,
      config: input.config as Prisma.InputJsonValue,
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await auditProductMutation(
      authAuditRepository.log,
      ctx,
      'PRODUCT_LENDER_MAPPING_CREATED',
      'product_lender_mapping',
      mapping.id,
      input,
    );
    return mapping;
  },

  async update(id: string, input: UpdateProductLenderMappingInput, ctx: RequestContext) {
    await productLenderMappingService.getById(id);
    const mapping = await productLenderMappingRepository.update(id, {
      variantId: input.variantId,
      lenderPolicyId: input.lenderPolicyId,
      eligibilityRuleIds: input.eligibilityRuleIds as Prisma.InputJsonValue,
      documentRuleIds: input.documentRuleIds as Prisma.InputJsonValue,
      priority: input.priority,
      isActive: input.isActive,
      config: input.config as Prisma.InputJsonValue,
      updatedById: ctx.actorId,
    });
    await auditProductMutation(
      authAuditRepository.log,
      ctx,
      'PRODUCT_LENDER_MAPPING_UPDATED',
      'product_lender_mapping',
      id,
      input,
    );
    return mapping;
  },

  async remove(id: string, ctx: RequestContext) {
    await productLenderMappingService.getById(id);
    await productLenderMappingRepository.softDelete(id, ctx.actorId);
    await auditProductMutation(
      authAuditRepository.log,
      ctx,
      'PRODUCT_LENDER_MAPPING_DELETED',
      'product_lender_mapping',
      id,
    );
  },
};
