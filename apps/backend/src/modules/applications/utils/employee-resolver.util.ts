import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';

/** Resolves an employee row for ops actions (bank login, credit review). Falls back to any active employee when admin user has no linked employee record. */
export async function resolveEmployeeIdForActor(actorUserId: string): Promise<string> {
  const linked = await prisma.employee.findFirst({
    where: { userId: actorUserId, deletedAt: null },
    select: { id: true },
  });
  if (linked) return linked.id;

  const fallback = await prisma.employee.findFirst({
    where: { deletedAt: null, isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  if (fallback) return fallback.id;

  throw new NotFoundError('Employee', actorUserId);
}
