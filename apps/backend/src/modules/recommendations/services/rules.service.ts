import type { Prisma } from '@kuberone/database';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { recommendationsRepository } from '../repositories/recommendations.repository.js';
import type { RequestContext } from '../types/recommendations.types.js';
import type { CreateRuleInput, UpdateRuleInput } from '../validators/recommendations.validator.js';

export const recommendationRulesService = {
  async list(query: { page: number; limit: number; category?: string; ruleType?: string; isActive?: boolean; sortBy: string; sortOrder: 'asc' | 'desc' }) {
    const where: Prisma.RecommendationRuleWhereInput = {
      ...(query.category ? { category: query.category } : {}),
      ...(query.ruleType ? { ruleType: query.ruleType as never } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder } as Prisma.RecommendationRuleOrderByWithRelationInput;
    const [items, total] = await Promise.all([
      recommendationsRepository.listRules(where, skip, query.limit, orderBy),
      recommendationsRepository.countRules(where),
    ]);
    return { items, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) || 1 } };
  },

  async create(input: CreateRuleInput, ctx: RequestContext) {
    if (await recommendationsRepository.findRuleByCode(input.code)) {
      throw new ConflictError(`Rule ${input.code} already exists`);
    }
    const rule = await recommendationsRepository.createRule({
      code: input.code,
      name: input.name,
      ruleType: input.ruleType,
      category: input.category,
      condition: input.condition as never,
      scoreImpact: input.scoreImpact,
      priority: input.priority,
      isActive: input.isActive,
      description: input.description,
      createdById: ctx.actorId,
    });
    await recommendationsRepository.createAudit({
      userId: ctx.actorId,
      action: 'RULE_CREATED',
      entityType: 'recommendation_rule',
      entityId: rule.id,
      newValues: rule as never,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
    return rule;
  },

  async update(id: string, input: UpdateRuleInput, ctx: RequestContext) {
    const existing = await recommendationsRepository.findRuleById(id);
    if (!existing) throw new NotFoundError('RecommendationRule', id);
    const rule = await recommendationsRepository.updateRule(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.ruleType !== undefined ? { ruleType: input.ruleType } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.condition !== undefined ? { condition: input.condition as never } : {}),
      ...(input.scoreImpact !== undefined ? { scoreImpact: input.scoreImpact } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      updatedById: ctx.actorId,
      version: existing.version + 1,
    });
    return rule;
  },
};
