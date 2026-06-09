import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import { leadAssignmentRepository } from '../repositories/lead-assignment.repository.js';

export type AssignmentStrategy = 'ROUND_ROBIN' | 'LOAD_BALANCE' | 'AUTO' | 'BRANCH';

export const leadAssignmentEngineService = {
  async resolveAssignee(
    branchId: string | undefined,
    strategy: AssignmentStrategy = 'ROUND_ROBIN',
  ): Promise<string> {
    if (!branchId) {
      const fallback = await prisma.employee.findFirst({
        where: { isActive: true, deletedAt: null },
        select: { id: true },
      });
      if (!fallback) throw new NotFoundError('Employee', 'active');
      return fallback.id;
    }

    const employees = await leadAssignmentRepository.listAssigneesByBranch(branchId);
    if (employees.length === 0) throw new NotFoundError('Employee', `branch:${branchId}`);

    if (strategy === 'ROUND_ROBIN') {
      const lastAssignment = await prisma.leadAssignment.findFirst({
        where: { branchId, assignmentType: { in: ['ROUND_ROBIN', 'AUTO', 'LOAD_BALANCE', 'BRANCH'] } },
        orderBy: { assignedAt: 'desc' },
        select: { assignedToId: true },
      });
      if (!lastAssignment) return employees[0]!.id;
      const idx = employees.findIndex((e) => e.id === lastAssignment.assignedToId);
      return employees[(idx + 1) % employees.length]!.id;
    }

    if (strategy === 'LOAD_BALANCE' || strategy === 'AUTO' || strategy === 'BRANCH') {
      const loads = await Promise.all(
        employees.map(async (e) => ({
          id: e.id,
          count: await leadAssignmentRepository.countActiveByAssignee(e.id),
        })),
      );
      loads.sort((a, b) => a.count - b.count);
      return loads[0]!.id;
    }

    return employees[0]!.id;
  },
};
