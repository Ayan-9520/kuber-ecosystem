import type { Prisma } from '@kuberone/database';
import type {
  CreateCommissionRuleInput,
  ListCommissionRulesQuery,
  UpdateCommissionRuleInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { commissionRuleRepository } from '../repositories/commission.repository.js';
import type { RequestContext } from '../types/commissions.types.js';
import { auditCommissionMutation, buildPaginationMeta } from '../utils/commissions.utils.js';

export const commissionRuleService = {
  async list(query: ListCommissionRulesQuery) {
    const where: Prisma.CommissionRuleWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.partnerType ? { partnerType: query.partnerType as never } : {}),
      ...(query.commissionType ? { commissionType: query.commissionType as never } : {}),
      ...(query.calculationMethod ? { calculationMethod: query.calculationMethod as never } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.lenderId ? { lenderId: query.lenderId } : {}),
      ...(query.search
        ? { OR: [{ name: { contains: query.search } }, { ruleCode: { contains: query.search } }] }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      commissionRuleRepository.list(where, skip, query.limit, orderBy),
      commissionRuleRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await commissionRuleRepository.findById(id);
    if (!item || item.deletedAt) throw new NotFoundError('CommissionRule', id);
    return item;
  },

  async create(input: CreateCommissionRuleInput, ctx: RequestContext) {
    const existing = await commissionRuleRepository.findByCode(input.ruleCode);
    if (existing) throw new ConflictError('Commission rule code already exists');

    const item = await commissionRuleRepository.create({
      ruleCode: input.ruleCode,
      name: input.name,
      description: input.description,
      partnerType: input.partnerType as never,
      commissionType: input.commissionType as never,
      calculationMethod: input.calculationMethod as never,
      fixedAmount: input.fixedAmount,
      percentage: input.percentage,
      slabDefinition: input.slabDefinition as Prisma.InputJsonValue,
      product: input.productId ? { connect: { id: input.productId } } : undefined,
      lender: input.lenderId ? { connect: { id: input.lenderId } } : undefined,
      campaign: input.campaignId ? { connect: { id: input.campaignId } } : undefined,
      minBaseAmount: input.minBaseAmount,
      maxBaseAmount: input.maxBaseAmount,
      minCommission: input.minCommission,
      maxCommission: input.maxCommission,
      priority: input.priority,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      createdBy: { connect: { id: ctx.actorId } },
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_RULE_CREATED', item.id, input);
    return item;
  },

  async update(id: string, input: UpdateCommissionRuleInput, ctx: RequestContext) {
    await commissionRuleService.getById(id);
    const item = await commissionRuleRepository.update(id, {
      ...input,
      partnerType: input.partnerType as never,
      commissionType: input.commissionType as never,
      calculationMethod: input.calculationMethod as never,
      slabDefinition: input.slabDefinition as Prisma.InputJsonValue,
      product: input.productId ? { connect: { id: input.productId } } : undefined,
      lender: input.lenderId ? { connect: { id: input.lenderId } } : undefined,
      updatedBy: { connect: { id: ctx.actorId } },
    });
    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_RULE_UPDATED', id, input);
    return item;
  },

  async remove(id: string, ctx: RequestContext) {
    await commissionRuleService.getById(id);
    await commissionRuleRepository.softDelete(id, ctx.actorId);
    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_RULE_DELETED', id);
    return { id, deleted: true };
  },
};
