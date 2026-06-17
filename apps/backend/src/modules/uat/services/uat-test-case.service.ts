import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { createUatTestCaseSchema, listUatTestCasesQuerySchema } from '@kuberone/shared-validation';
import type { z } from 'zod';


import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { uatRepository } from '../repositories/uat.repository.js';

type ListUatTestCasesQuery = z.infer<typeof listUatTestCasesQuerySchema>;
type CreateUatTestCaseInput = z.infer<typeof createUatTestCaseSchema>;

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const uatTestCaseService = {
  async list(_actor: AuthenticatedUser, query: ListUatTestCasesQuery) {
    const { page, limit, sortBy, sortOrder, scenarioId, cycleId, businessFlow, testType, search } = query;
    const where = {
      isActive: true,
      ...(scenarioId ? { scenarioId } : {}),
      ...(cycleId ? { scenario: { cycleId } } : {}),
      ...(businessFlow ? { scenario: { businessFlow } } : {}),
      ...(testType ? { testType } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { code: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      uatRepository.testCase.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          scenario: {
            select: { id: true, code: true, name: true, businessFlow: true, userGroup: true, cycleId: true },
          },
        },
      }),
      uatRepository.testCase.count(where),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(_actor: AuthenticatedUser, id: string) {
    const testCase = await uatRepository.testCase.findById(id);
    if (!testCase) throw new NotFoundError('UatTestCase', id);
    return testCase;
  },

  async create(_actor: AuthenticatedUser, input: CreateUatTestCaseInput) {
    const scenario = await uatRepository.scenario.findById(input.scenarioId);
    if (!scenario) throw new NotFoundError('UatScenario', input.scenarioId);
    const existing = await uatRepository.testCase.findByCode(input.code);
    if (existing) throw new ConflictError('UAT test case code already exists');
    return uatRepository.testCase.create({
      code: input.code,
      title: input.title,
      description: input.description,
      testType: input.testType,
      preconditions: input.preconditions,
      steps: input.steps ?? [],
      expectedResult: input.expectedResult,
      businessRule: input.businessRule,
      priority: input.priority,
      sortOrder: input.sortOrder,
      scenario: { connect: { id: input.scenarioId } },
    });
  },
};
