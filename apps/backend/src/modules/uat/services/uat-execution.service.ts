import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { executeUatTestCaseSchema, listUatExecutionsQuerySchema } from '@kuberone/shared-validation';
import type { z } from 'zod';


import { NotFoundError, ValidationError } from '../../../shared/errors/app-error.js';
import { uatRepository } from '../repositories/uat.repository.js';

type ListUatExecutionsQuery = z.infer<typeof listUatExecutionsQuerySchema>;
type ExecuteUatTestCaseInput = z.infer<typeof executeUatTestCaseSchema>;

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const uatExecutionService = {
  async list(_actor: AuthenticatedUser, query: ListUatExecutionsQuery) {
    const { page, limit, sortBy, sortOrder, cycleId, testCaseId, status, businessFlow } = query;
    const where = {
      ...(cycleId ? { cycleId } : {}),
      ...(testCaseId ? { testCaseId } : {}),
      ...(status ? { status } : {}),
      ...(businessFlow ? { testCase: { scenario: { businessFlow } } } : {}),
    };
    const [items, total] = await Promise.all([
      uatRepository.execution.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          testCase: {
            include: {
              scenario: { select: { businessFlow: true, name: true } },
            },
          },
          executedBy: { select: { id: true, email: true } },
        },
      }),
      uatRepository.execution.count(where),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(_actor: AuthenticatedUser, id: string) {
    const execution = await uatRepository.execution.findById(id);
    if (!execution) throw new NotFoundError('UatExecution', id);
    return execution;
  },

  async execute(actor: AuthenticatedUser, input: ExecuteUatTestCaseInput) {
    const [cycle, testCase] = await Promise.all([
      uatRepository.cycle.findById(input.cycleId),
      uatRepository.testCase.findById(input.testCaseId),
    ]);
    if (!cycle) throw new NotFoundError('UatCycle', input.cycleId);
    if (!testCase) throw new NotFoundError('UatTestCase', input.testCaseId);
    if (testCase.scenario.cycleId !== input.cycleId) {
      throw new ValidationError({ cycleId: ['Test case does not belong to this cycle'] });
    }

    const evidence = input.evidence as Prisma.InputJsonValue | undefined;
    const isExecuted = ['PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'].includes(input.status);
    return uatRepository.execution.upsert(
      input.cycleId,
      input.testCaseId,
      {
        cycle: { connect: { id: input.cycleId } },
        testCase: { connect: { id: input.testCaseId } },
        status: input.status,
        actualResult: input.actualResult,
        notes: input.notes,
        evidence,
        duration: input.duration,
        executedBy: isExecuted ? { connect: { id: actor.id } } : undefined,
        executedAt: isExecuted ? new Date() : undefined,
      },
      {
        status: input.status,
        actualResult: input.actualResult,
        notes: input.notes,
        evidence,
        duration: input.duration,
        executedBy: isExecuted ? { connect: { id: actor.id } } : undefined,
        executedAt: isExecuted ? new Date() : undefined,
      },
    );
  },
};
