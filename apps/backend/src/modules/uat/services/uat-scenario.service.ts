import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { createUatScenarioSchema, listUatScenariosQuerySchema } from '@kuberone/shared-validation';
import type { z } from 'zod';


import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { uatRepository } from '../repositories/uat.repository.js';

type ListUatScenariosQuery = z.infer<typeof listUatScenariosQuerySchema>;
type CreateUatScenarioInput = z.infer<typeof createUatScenarioSchema>;

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const uatScenarioService = {
  async list(_actor: AuthenticatedUser, query: ListUatScenariosQuery) {
    const { page, limit, sortBy, sortOrder, cycleId, businessFlow, userGroup, search } = query;
    const where = {
      isActive: true,
      ...(cycleId ? { cycleId } : {}),
      ...(businessFlow ? { businessFlow } : {}),
      ...(userGroup ? { userGroup } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { code: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      uatRepository.scenario.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { testCases: true } } },
      }),
      uatRepository.scenario.count(where),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(_actor: AuthenticatedUser, id: string) {
    const scenario = await uatRepository.scenario.findById(id);
    if (!scenario) throw new NotFoundError('UatScenario', id);
    return scenario;
  },

  async create(_actor: AuthenticatedUser, input: CreateUatScenarioInput) {
    const cycle = await uatRepository.cycle.findById(input.cycleId);
    if (!cycle) throw new NotFoundError('UatCycle', input.cycleId);
    const existing = await uatRepository.scenario.findByCode(input.code);
    if (existing) throw new ConflictError('UAT scenario code already exists');
    return uatRepository.scenario.create({
      code: input.code,
      name: input.name,
      description: input.description,
      businessFlow: input.businessFlow,
      userGroup: input.userGroup,
      acceptanceCriteria: input.acceptanceCriteria ?? [],
      priority: input.priority,
      sortOrder: input.sortOrder,
      cycle: { connect: { id: input.cycleId } },
    });
  },
};
