import type { Prisma } from '@kuberone/database';
import type {
  CreateEmployeeInput,
  ListEmployeesQuery,
  UpdateEmployeeInput,
} from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { employeeRepository } from '../repositories/employee.repository.js';
import type { EmployeeResponse, EmployeeWithBranch, RequestContext } from '../types/employees.types.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function toApiEmployee(row: EmployeeWithBranch): EmployeeResponse {
  return {
    id: row.id,
    userId: row.userId,
    branchId: row.branchId,
    employeeCode: row.employeeCode,
    firstName: row.firstName,
    lastName: row.lastName,
    designation: row.designation,
    department: row.department,
    reportsToId: row.reportsToId,
    isActive: row.isActive,
    joinedAt: row.joinedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() ?? null,
    branch: {
      id: row.branch.id,
      code: row.branch.code,
      name: row.branch.name,
      regionId: row.branch.regionId,
      city: row.branch.city,
      state: row.branch.state,
      isActive: row.branch.isActive,
    },
  };
}

function buildListWhere(query: ListEmployeesQuery): Prisma.EmployeeWhereInput {
  return {
    deletedAt: null,
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    ...(query.search
      ? {
          OR: [
            { employeeCode: { contains: query.search } },
            { firstName: { contains: query.search } },
            { lastName: { contains: query.search } },
          ],
        }
      : {}),
  };
}

async function assertBranchExists(branchId: string) {
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) throw new NotFoundError('Branch', branchId);
  return branch;
}

async function assertUserExists(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User', userId);
  return user;
}

async function assertReportsToExists(reportsToId: string) {
  const manager = await employeeRepository.findById(reportsToId);
  if (!manager || manager.deletedAt) throw new NotFoundError('Employee', reportsToId);
  return manager;
}

export const employeeService = {
  health: async (): Promise<{ module: string; status: string }> => ({
    module: 'employees',
    status: 'ok',
  }),

  async list(query: ListEmployeesQuery) {
    const where = buildListWhere(query);
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [rows, total] = await Promise.all([
      employeeRepository.list(where, skip, query.limit, orderBy),
      employeeRepository.count(where),
    ]);

    return {
      items: rows.map(toApiEmployee),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getById(id: string) {
    const row = await employeeRepository.findById(id);
    if (!row || row.deletedAt) throw new NotFoundError('Employee', id);
    return toApiEmployee(row);
  },

  async create(input: CreateEmployeeInput, ctx: RequestContext) {
    await assertUserExists(input.userId);
    await assertBranchExists(input.branchId);

    const existingUser = await employeeRepository.findByUserId(input.userId);
    if (existingUser && !existingUser.deletedAt) {
      throw new ConflictError('Employee already exists for this user');
    }

    const existingCode = await employeeRepository.findByEmployeeCode(input.employeeCode);
    if (existingCode && !existingCode.deletedAt) {
      throw new ConflictError('Employee code already exists');
    }

    if (input.reportsToId) {
      await assertReportsToExists(input.reportsToId);
    }

    const row = await employeeRepository.create({
      userId: input.userId,
      branch: { connect: { id: input.branchId } },
      employeeCode: input.employeeCode,
      firstName: input.firstName,
      lastName: input.lastName,
      designation: input.designation,
      department: input.department,
      reportsToId: input.reportsToId,
      isActive: input.isActive,
      joinedAt: input.joinedAt,
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    return toApiEmployee(row);
  },

  async update(id: string, input: UpdateEmployeeInput, ctx: RequestContext) {
    await employeeService.getById(id);

    if (input.branchId) {
      await assertBranchExists(input.branchId);
    }

    if (input.reportsToId) {
      await assertReportsToExists(input.reportsToId);
    }

    if (input.employeeCode) {
      const existingCode = await employeeRepository.findByEmployeeCode(input.employeeCode);
      if (existingCode && existingCode.id !== id && !existingCode.deletedAt) {
        throw new ConflictError('Employee code already exists');
      }
    }

    const row = await employeeRepository.update(id, {
      ...(input.branchId !== undefined ? { branch: { connect: { id: input.branchId } } } : {}),
      ...(input.employeeCode !== undefined ? { employeeCode: input.employeeCode } : {}),
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      ...(input.designation !== undefined ? { designation: input.designation } : {}),
      ...(input.department !== undefined ? { department: input.department } : {}),
      ...(input.reportsToId !== undefined ? { reportsToId: input.reportsToId } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.joinedAt !== undefined ? { joinedAt: input.joinedAt } : {}),
      updatedById: ctx.actorId,
    });

    return toApiEmployee(row);
  },

  async remove(id: string, ctx: RequestContext) {
    await employeeService.getById(id);
    const row = await employeeRepository.softDelete(id, ctx.actorId);
    return toApiEmployee(row);
  },
};
