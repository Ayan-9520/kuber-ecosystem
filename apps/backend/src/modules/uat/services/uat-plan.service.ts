import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { CreateUatPlanInput, ListUatPlansQuery, UpdateUatPlanInput } from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { uatRepository } from '../repositories/uat.repository.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const uatPlanService = {
  async list(_actor: AuthenticatedUser, query: ListUatPlansQuery) {
    const { page, limit, sortBy, sortOrder, status, search } = query;
    const where = {
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
      uatRepository.plan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: { select: { id: true, email: true } },
          _count: { select: { cycles: true } },
        },
      }),
      uatRepository.plan.count(where),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(_actor: AuthenticatedUser, id: string) {
    const plan = await uatRepository.plan.findById(id);
    if (!plan) throw new NotFoundError('UatPlan', id);
    return plan;
  },

  async create(actor: AuthenticatedUser, input: CreateUatPlanInput) {
    const existing = await uatRepository.plan.findByCode(input.code);
    if (existing) throw new ConflictError('UAT plan code already exists');
    return uatRepository.plan.create({
      code: input.code,
      name: input.name,
      description: input.description,
      version: input.version,
      startDate: input.startDate,
      endDate: input.endDate,
      owner: input.ownerId ? { connect: { id: input.ownerId } } : undefined,
      createdBy: { connect: { id: actor.id } },
    });
  },

  async update(_actor: AuthenticatedUser, id: string, input: UpdateUatPlanInput) {
    const plan = await uatRepository.plan.findById(id);
    if (!plan) throw new NotFoundError('UatPlan', id);
    if (input.code && input.code !== plan.code) {
      const existing = await uatRepository.plan.findByCode(input.code);
      if (existing) throw new ConflictError('UAT plan code already exists');
    }
    return uatRepository.plan.update(id, {
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.version !== undefined ? { version: input.version } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
      ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
      ...(input.ownerId !== undefined ? { owner: { connect: { id: input.ownerId } } } : {}),
    });
  },
};
