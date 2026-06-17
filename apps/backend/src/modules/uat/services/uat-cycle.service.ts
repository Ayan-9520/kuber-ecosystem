import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { createUatCycleSchema, listUatCyclesQuerySchema, updateUatCycleSchema } from '@kuberone/shared-validation';
import type { z } from 'zod';


import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { UAT_SIGNOFF_TYPES } from '../constants/uat.constants.js';
import { uatRepository } from '../repositories/uat.repository.js';

type ListUatCyclesQuery = z.infer<typeof listUatCyclesQuerySchema>;
type CreateUatCycleInput = z.infer<typeof createUatCycleSchema>;
type UpdateUatCycleInput = z.infer<typeof updateUatCycleSchema>;

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const uatCycleService = {
  async list(_actor: AuthenticatedUser, query: ListUatCyclesQuery) {
    const { page, limit, sortBy, sortOrder, planId, status, search } = query;
    const where = {
      ...(planId ? { planId } : {}),
      ...(status ? { status } : {}),
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
      uatRepository.cycle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          plan: { select: { id: true, code: true, name: true } },
          _count: { select: { scenarios: true, executions: true, signoffs: true } },
        },
      }),
      uatRepository.cycle.count(where),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(_actor: AuthenticatedUser, id: string) {
    const cycle = await uatRepository.cycle.findById(id);
    if (!cycle) throw new NotFoundError('UatCycle', id);
    return cycle;
  },

  async create(actor: AuthenticatedUser, input: CreateUatCycleInput) {
    const plan = await uatRepository.plan.findById(input.planId);
    if (!plan) throw new NotFoundError('UatPlan', input.planId);
    const existing = await uatRepository.cycle.findByCode(input.code);
    if (existing) throw new ConflictError('UAT cycle code already exists');

    const cycle = await uatRepository.cycle.create({
      code: input.code,
      name: input.name,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      plan: { connect: { id: input.planId } },
      createdBy: { connect: { id: actor.id } },
    });

    await Promise.all(
      UAT_SIGNOFF_TYPES.map((signoffType) =>
        uatRepository.signoff.create({
          cycle: { connect: { id: cycle.id } },
          signoffType,
          status: 'PENDING',
        }),
      ),
    );

    return uatRepository.cycle.findById(cycle.id);
  },

  async update(_actor: AuthenticatedUser, id: string, input: UpdateUatCycleInput) {
    const cycle = await uatRepository.cycle.findById(id);
    if (!cycle) throw new NotFoundError('UatCycle', id);
    if (input.code && input.code !== cycle.code) {
      const existing = await uatRepository.cycle.findByCode(input.code);
      if (existing) throw new ConflictError('UAT cycle code already exists');
    }
    return uatRepository.cycle.update(id, {
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
      ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
      ...(input.planId !== undefined ? { plan: { connect: { id: input.planId } } } : {}),
    });
  },
};
