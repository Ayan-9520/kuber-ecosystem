import type { Prisma } from '@kuberone/database';
import type {
  CreateEligibilityRuleInput,
  EvaluateEligibilityInput,
  ListEligibilityRulesQuery,
  UpdateEligibilityRuleInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { eligibilityRuleRepository } from '../repositories/eligibility-rule.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import type { RequestContext } from '../types/product.types.js';
import { auditProductMutation, buildPaginationMeta } from '../utils/product.utils.js';

import { eligibilityEngineService } from './eligibility-engine.service.js';
import { productService } from './product.service.js';

export const eligibilityRuleService = {
  async list(query: ListEligibilityRulesQuery) {
    const where: Prisma.EligibilityRuleWhereInput = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.variantId ? { variantId: query.variantId } : {}),
      ...(query.ruleType ? { ruleType: query.ruleType as never } : {}),
      ...(query.search ? { ruleName: { contains: query.search } } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy ?? 'priority']: query.sortOrder };

    const [items, total] = await Promise.all([
      eligibilityRuleRepository.list(where, skip, query.limit, orderBy),
      eligibilityRuleRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const rule = await eligibilityRuleRepository.findById(id);
    if (!rule) throw new NotFoundError('EligibilityRule', id);
    return rule;
  },

  async create(input: CreateEligibilityRuleInput, ctx: RequestContext) {
    await productService.getById(input.productId);

    const rule = await eligibilityRuleRepository.create({
      ...input,
      ruleType: input.ruleType as never,
      ruleDefinition: input.ruleDefinition as Prisma.InputJsonValue,
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await auditProductMutation(authAuditRepository.log, ctx, 'ELIGIBILITY_RULE_CREATED', 'eligibility_rule', rule.id, input);
    return rule;
  },

  async update(id: string, input: UpdateEligibilityRuleInput, ctx: RequestContext) {
    await eligibilityRuleService.getById(id);
    const rule = await eligibilityRuleRepository.update(id, {
      ...input,
      ruleType: input.ruleType as never,
      ruleDefinition: input.ruleDefinition as Prisma.InputJsonValue,
      updatedById: ctx.actorId,
    });
    await auditProductMutation(authAuditRepository.log, ctx, 'ELIGIBILITY_RULE_UPDATED', 'eligibility_rule', id, input);
    return rule;
  },

  async remove(id: string, ctx: RequestContext) {
    await eligibilityRuleService.getById(id);
    await eligibilityRuleRepository.softDelete(id, ctx.actorId);
    await auditProductMutation(authAuditRepository.log, ctx, 'ELIGIBILITY_RULE_DELETED', 'eligibility_rule', id);
  },

  async evaluate(input: EvaluateEligibilityInput) {
    const product = await productRepository.findById(input.productId);
    if (!product) throw new NotFoundError('Product', input.productId);

    const rules = await eligibilityRuleRepository.listActiveForProduct(input.productId, input.variantId);
    const ruleResults = rules.map((rule) => {
      const definition = rule.ruleDefinition as Record<string, unknown>;
      const result = eligibilityEngineService.evaluateRule(rule.ruleName, definition as never, input.applicant);
      return { ruleName: rule.ruleName, ...result };
    });

    return eligibilityEngineService.aggregate(ruleResults, Number(product.maxAmount));
  },
};
