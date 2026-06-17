import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { CreateUatDefectInput, ListUatDefectsQuery, UpdateUatDefectInput } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { uatRepository } from '../repositories/uat.repository.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

function generateDefectCode(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DEF-${ts}-${rand}`;
}

export const uatDefectService = {
  async list(_actor: AuthenticatedUser, query: ListUatDefectsQuery) {
    const { page, limit, sortBy, sortOrder, testCaseId, severity, status, businessFlow, search } = query;
    const where = {
      ...(testCaseId ? { testCaseId } : {}),
      ...(severity ? { severity } : {}),
      ...(status ? { status } : {}),
      ...(businessFlow ? { businessFlow } : {}),
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
      uatRepository.defect.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          testCase: { select: { id: true, code: true, title: true } },
          assignedTo: { select: { id: true, email: true } },
          reportedBy: { select: { id: true, email: true } },
        },
      }),
      uatRepository.defect.count(where),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(_actor: AuthenticatedUser, id: string) {
    const defect = await uatRepository.defect.findById(id);
    if (!defect) throw new NotFoundError('UatDefect', id);
    return defect;
  },

  async create(actor: AuthenticatedUser, input: CreateUatDefectInput) {
    if (input.testCaseId) {
      const testCase = await uatRepository.testCase.findById(input.testCaseId);
      if (!testCase) throw new NotFoundError('UatTestCase', input.testCaseId);
    }
    let code = generateDefectCode();
    while (await uatRepository.defect.findByCode(code)) {
      code = generateDefectCode();
    }
    return uatRepository.defect.create({
      code,
      title: input.title,
      description: input.description,
      severity: input.severity,
      businessFlow: input.businessFlow,
      testCase: input.testCaseId ? { connect: { id: input.testCaseId } } : undefined,
      assignedTo: input.assignedToId ? { connect: { id: input.assignedToId } } : undefined,
      reportedBy: { connect: { id: actor.id } },
    });
  },

  async update(actor: AuthenticatedUser, id: string, input: UpdateUatDefectInput) {
    const defect = await uatRepository.defect.findById(id);
    if (!defect) throw new NotFoundError('UatDefect', id);

    const isResolved = input.status === 'CLOSED' || input.status === 'FIXED';
    const isAssigned = input.status === 'ASSIGNED' && input.assignedToId;

    return uatRepository.defect.update(id, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.severity !== undefined ? { severity: input.severity } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.assignedToId !== undefined ? { assignedTo: { connect: { id: input.assignedToId } } } : {}),
      ...(isAssigned ? { status: 'ASSIGNED' } : {}),
      ...(isResolved
        ? {
            resolvedBy: { connect: { id: actor.id } },
            resolvedAt: new Date(),
          }
        : {}),
    });
  },
};
