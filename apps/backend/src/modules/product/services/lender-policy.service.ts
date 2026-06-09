import type { Prisma } from '@kuberone/database';
import type {
  CreateLenderPolicyInput,
  ListLenderPoliciesQuery,
  UpdateLenderPolicyInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { lenderPolicyRepository } from '../repositories/lender-policy.repository.js';
import type { RequestContext } from '../types/product.types.js';
import { auditProductMutation, buildPaginationMeta } from '../utils/product.utils.js';

import { lenderService } from './lender.service.js';
import { productService } from './product.service.js';

export const lenderPolicyService = {
  async list(query: ListLenderPoliciesQuery) {
    const where: Prisma.LenderPolicyWhereInput = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.lenderId ? { lenderId: query.lenderId } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy ?? 'effectiveFrom']: query.sortOrder };

    const [items, total] = await Promise.all([
      lenderPolicyRepository.list(where, skip, query.limit, orderBy),
      lenderPolicyRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const policy = await lenderPolicyRepository.findById(id);
    if (!policy) throw new NotFoundError('LenderPolicy', id);
    return policy;
  },

  async create(input: CreateLenderPolicyInput, ctx: RequestContext) {
    await lenderService.getById(input.lenderId);
    await productService.getById(input.productId);

    const policy = await lenderPolicyRepository.create({
      lenderId: input.lenderId,
      productId: input.productId,
      minAmount: input.minAmount,
      maxAmount: input.maxAmount,
      maxLtv: input.maxLtv,
      maxFoir: input.maxFoir,
      minCibil: input.minCibil,
      processingFeePct: input.processingFeePct,
      commissionRate: input.commissionRate,
      turnaroundDays: input.turnaroundDays,
      policyS3Key: input.policyConfig ? JSON.stringify(input.policyConfig) : input.policyS3Key,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await auditProductMutation(authAuditRepository.log, ctx, 'LENDER_POLICY_CREATED', 'lender_policy', policy.id, input);
    return policy;
  },

  async update(id: string, input: UpdateLenderPolicyInput, ctx: RequestContext) {
    await lenderPolicyService.getById(id);
    const policy = await lenderPolicyRepository.update(id, {
      ...input,
      policyS3Key: input.policyConfig ? JSON.stringify(input.policyConfig) : input.policyS3Key,
      updatedById: ctx.actorId,
    });
    await auditProductMutation(authAuditRepository.log, ctx, 'LENDER_POLICY_UPDATED', 'lender_policy', id, input);
    return policy;
  },
};
