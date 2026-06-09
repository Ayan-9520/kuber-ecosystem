import type { Prisma } from '@kuberone/database';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { DEFAULT_FACTOR_WEIGHTS, DEFAULT_WEIGHT_VERSION } from '../constants/lead-scoring.constants.js';
import { leadScoringRepository } from '../repositories/lead-scoring.repository.js';
import type { RequestContext } from '../types/lead-scoring.types.js';
import type { UpsertWeightConfigInput, CreateScoringRuleInput, UpdateScoringRuleInput } from '../validators/lead-scoring.validator.js';

export const weightConfigService = {
  async getActiveWeights(version?: string): Promise<Record<string, number>> {
    const rows = await leadScoringRepository.findActiveWeights(version ?? DEFAULT_WEIGHT_VERSION);
    if (rows.length === 0) return { ...DEFAULT_FACTOR_WEIGHTS };

    const weights: Record<string, number> = { ...DEFAULT_FACTOR_WEIGHTS };
    for (const row of rows) {
      weights[row.factor] = Number(row.weight);
    }
    return weights;
  },

  async list(query: { page: number; limit: number; version?: string; factor?: string; isActive?: boolean; sortBy: string; sortOrder: 'asc' | 'desc' }) {
    const where: Prisma.LeadWeightConfigWhereInput = {
      ...(query.version ? { version: query.version } : {}),
      ...(query.factor ? { factor: query.factor } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder } as Prisma.LeadWeightConfigOrderByWithRelationInput;

    const [items, total] = await Promise.all([
      leadScoringRepository.listWeights(where, skip, query.limit, orderBy),
      leadScoringRepository.countWeights(where),
    ]);

    return {
      items,
      meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) || 1 },
    };
  },

  async upsert(input: UpsertWeightConfigInput, ctx: RequestContext) {
    const version = input.version ?? DEFAULT_WEIGHT_VERSION;
    const results = [];

    for (const w of input.weights) {
      const row = await leadScoringRepository.upsertWeight(version, w.factor, w.weight, ctx.actorId);
      results.push(row);
    }

    await leadScoringRepository.createAudit({
      userId: ctx.actorId,
      action: 'WEIGHT_UPDATED',
      entityType: 'lead_weight_config',
      newValues: { version, weights: input.weights } as never,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return { version, weights: results };
  },
};

export const scoringRulesService = {
  async list(query: { page: number; limit: number; factor?: string; ruleType?: string; isActive?: boolean; sortBy: string; sortOrder: 'asc' | 'desc' }) {
    const where: Prisma.LeadScoringRuleWhereInput = {
      ...(query.factor ? { factor: query.factor } : {}),
      ...(query.ruleType ? { ruleType: query.ruleType as never } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder } as Prisma.LeadScoringRuleOrderByWithRelationInput;

    const [items, total] = await Promise.all([
      leadScoringRepository.listRules(where, skip, query.limit, orderBy),
      leadScoringRepository.countRules(where),
    ]);

    return {
      items,
      meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) || 1 },
    };
  },

  async create(input: CreateScoringRuleInput, ctx: RequestContext) {
    const existing = await leadScoringRepository.findRuleByCode(input.code);
    if (existing) throw new ConflictError(`Scoring rule ${input.code} already exists`);

    const rule = await leadScoringRepository.createRule({
      code: input.code,
      name: input.name,
      factor: input.factor,
      ruleType: input.ruleType,
      condition: input.condition as never,
      scoreImpact: input.scoreImpact,
      priority: input.priority,
      isActive: input.isActive,
      description: input.description,
      createdById: ctx.actorId,
    });

    await leadScoringRepository.createAudit({
      userId: ctx.actorId,
      action: 'RULE_CREATED',
      entityType: 'lead_scoring_rule',
      entityId: rule.id,
      newValues: rule as never,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return rule;
  },

  async update(id: string, data: UpdateScoringRuleInput, ctx: RequestContext) {
    const existing = await leadScoringRepository.findRuleById(id);
    if (!existing) throw new NotFoundError('LeadScoringRule', id);

    const rule = await leadScoringRepository.updateRule(id, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.factor !== undefined ? { factor: data.factor } : {}),
      ...(data.ruleType !== undefined ? { ruleType: data.ruleType } : {}),
      ...(data.condition !== undefined ? { condition: data.condition as never } : {}),
      ...(data.scoreImpact !== undefined ? { scoreImpact: data.scoreImpact } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      updatedById: ctx.actorId,
      version: existing.version + 1,
    });

    await leadScoringRepository.createAudit({
      userId: ctx.actorId,
      action: 'RULE_UPDATED',
      entityType: 'lead_scoring_rule',
      entityId: id,
      oldValues: existing as never,
      newValues: rule as never,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return rule;
  },
};
