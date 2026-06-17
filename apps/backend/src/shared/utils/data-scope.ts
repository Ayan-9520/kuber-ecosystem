import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import { DataScope, UserType } from '@kuberone/shared-types';

import { ForbiddenError } from '../errors/app-error.js';

export interface BranchScopedRecord {
  id: string;
  branchId?: string | null;
  regionId?: string | null;
  assignedToId?: string | null;
  assignedSalesId?: string | null;
  assignedCreditId?: string | null;
  assignedOpsId?: string | null;
  partnerId?: string | null;
  customerId?: string | null;
  userId?: string | null;
  uploadedById?: string | null;
  rmEmployeeId?: string | null;
}

function assignedEmployeeIds(actor: AuthenticatedUser): string[] {
  return actor.employeeId ? [actor.employeeId] : [];
}

export function applyLeadScope(
  actor: AuthenticatedUser,
  where: Prisma.LeadWhereInput = {},
): Prisma.LeadWhereInput {
  if (actor.roles.includes('SUPER_ADMIN') || actor.roles.includes('ADMIN')) {
    return where;
  }

  if (actor.userType === UserType.PARTNER && actor.partnerId) {
    return { ...where, partnerId: actor.partnerId };
  }

  switch (actor.dataScope) {
    case DataScope.ORGANIZATION:
      return where;
    case DataScope.REGION:
      return actor.regionId ? { ...where, regionId: actor.regionId } : { ...where, id: '__none__' };
    case DataScope.BRANCH:
      return actor.branchId ? { ...where, branchId: actor.branchId } : { ...where, id: '__none__' };
    case DataScope.ASSIGNED: {
      const ids = assignedEmployeeIds(actor);
      return ids.length > 0 ? { ...where, assignedToId: { in: ids } } : { ...where, id: '__none__' };
    }
    case DataScope.OWN:
      return { ...where, createdById: actor.id };
    default:
      return { ...where, id: '__none__' };
  }
}

export function applyApplicationScope(
  actor: AuthenticatedUser,
  where: Prisma.ApplicationWhereInput = {},
): Prisma.ApplicationWhereInput {
  if (actor.roles.includes('SUPER_ADMIN') || actor.roles.includes('ADMIN')) {
    return where;
  }

  if (actor.userType === UserType.CUSTOMER && actor.customerId) {
    return { ...where, customerId: actor.customerId };
  }

  if (actor.userType === UserType.PARTNER && actor.partnerId) {
    return { ...where, partnerId: actor.partnerId };
  }

  switch (actor.dataScope) {
    case DataScope.ORGANIZATION:
      return where;
    case DataScope.REGION:
      return actor.regionId ? { ...where, regionId: actor.regionId } : { ...where, id: '__none__' };
    case DataScope.BRANCH:
      return actor.branchId ? { ...where, branchId: actor.branchId } : { ...where, id: '__none__' };
    case DataScope.ASSIGNED: {
      const ids = assignedEmployeeIds(actor);
      if (ids.length === 0) return { ...where, id: '__none__' };
      return {
        ...where,
        OR: [
          { assignedSalesId: { in: ids } },
          { assignedCreditId: { in: ids } },
          { assignedOpsId: { in: ids } },
        ],
      };
    }
    case DataScope.OWN:
      return actor.customerId
        ? { ...where, customerId: actor.customerId }
        : { ...where, createdById: actor.id };
    default:
      return { ...where, id: '__none__' };
  }
}

export function applyDocumentScope(
  actor: AuthenticatedUser,
  where: Prisma.DocumentWhereInput = {},
): Prisma.DocumentWhereInput {
  if (actor.roles.includes('SUPER_ADMIN') || actor.roles.includes('ADMIN')) {
    return where;
  }

  if (actor.userType === UserType.CUSTOMER && actor.customerId) {
    return { ...where, customerId: actor.customerId };
  }

  if (actor.userType === UserType.PARTNER && actor.partnerId) {
    return { ...where, partnerId: actor.partnerId };
  }

  switch (actor.dataScope) {
    case DataScope.ORGANIZATION:
      return where;
    case DataScope.REGION:
    case DataScope.BRANCH:
      if (!actor.branchId) return { ...where, id: '__none__' };
      return {
        ...where,
        OR: [
          { application: { branchId: actor.branchId } },
          { lead: { branchId: actor.branchId } },
          { customer: { branchId: actor.branchId } },
        ],
      };
    case DataScope.ASSIGNED: {
      const ids = assignedEmployeeIds(actor);
      if (ids.length === 0) return { ...where, id: '__none__' };
      return {
        ...where,
        OR: [
          { lead: { assignedToId: { in: ids } } },
          { application: { assignedSalesId: { in: ids } } },
          { customer: { rmEmployeeId: { in: ids } } },
        ],
      };
    }
    case DataScope.OWN:
      return actor.customerId
        ? { ...where, customerId: actor.customerId }
        : { ...where, uploadedById: actor.id };
    default:
      return { ...where, id: '__none__' };
  }
}

export function applyTicketScope(
  actor: AuthenticatedUser,
  where: Prisma.TicketWhereInput = {},
): Prisma.TicketWhereInput {
  if (actor.roles.includes('SUPER_ADMIN') || actor.roles.includes('ADMIN')) {
    return where;
  }

  if (actor.userType === UserType.CUSTOMER && actor.customerId) {
    return { ...where, customerId: actor.customerId };
  }

  if (actor.userType === UserType.PARTNER && actor.partnerId) {
    return { ...where, partnerId: actor.partnerId };
  }

  switch (actor.dataScope) {
    case DataScope.ORGANIZATION:
      return where;
    case DataScope.REGION:
      return actor.regionId ? { ...where, regionId: actor.regionId } : { ...where, id: '__none__' };
    case DataScope.BRANCH:
      return actor.branchId ? { ...where, branchId: actor.branchId } : { ...where, id: '__none__' };
    case DataScope.ASSIGNED: {
      const ids = assignedEmployeeIds(actor);
      const or: Prisma.TicketWhereInput[] = [{ assignedUserId: actor.id }];
      if (ids.length > 0) or.push({ assignedToId: { in: ids } });
      return { ...where, OR: or };
    }
    case DataScope.OWN:
      return actor.customerId
        ? { ...where, customerId: actor.customerId }
        : { ...where, createdById: actor.id };
    default:
      return { ...where, id: '__none__' };
  }
}

export function applyCommissionScope(
  actor: AuthenticatedUser,
  where: Prisma.CommissionLedgerWhereInput = {},
): Prisma.CommissionLedgerWhereInput {
  if (actor.roles.includes('SUPER_ADMIN') || actor.roles.includes('ADMIN')) {
    return where;
  }

  if (actor.userType === UserType.PARTNER && actor.partnerId) {
    return { ...where, partnerId: actor.partnerId };
  }

  switch (actor.dataScope) {
    case DataScope.ORGANIZATION:
      return where;
    case DataScope.REGION:
      return actor.regionId
        ? { ...where, branch: { regionId: actor.regionId } }
        : { ...where, id: '__none__' };
    case DataScope.BRANCH:
      return actor.branchId ? { ...where, branchId: actor.branchId } : { ...where, id: '__none__' };
    case DataScope.ASSIGNED:
    case DataScope.OWN:
      return actor.partnerId ? { ...where, partnerId: actor.partnerId } : { ...where, id: '__none__' };
    default:
      return { ...where, id: '__none__' };
  }
}

export function assertLeadAccess(actor: AuthenticatedUser, lead: BranchScopedRecord): void {
  if (actor.roles.includes('SUPER_ADMIN') || actor.roles.includes('ADMIN')) return;

  if (actor.userType === UserType.PARTNER && actor.partnerId) {
    if (lead.partnerId !== actor.partnerId) {
      throw new ForbiddenError('Insufficient access to lead');
    }
    return;
  }

  switch (actor.dataScope) {
    case DataScope.ORGANIZATION:
      return;
    case DataScope.REGION:
      if (lead.regionId && actor.regionId && lead.regionId !== actor.regionId) {
        throw new ForbiddenError('Lead outside regional scope');
      }
      return;
    case DataScope.BRANCH:
      if (lead.branchId && actor.branchId && lead.branchId !== actor.branchId) {
        throw new ForbiddenError('Lead outside branch scope');
      }
      return;
    case DataScope.ASSIGNED:
      if (lead.assignedToId && actor.employeeId && lead.assignedToId !== actor.employeeId) {
        throw new ForbiddenError('Lead not assigned to you');
      }
      return;
    case DataScope.OWN:
      if (lead.userId && lead.userId !== actor.id) {
        throw new ForbiddenError('Insufficient access to lead');
      }
      return;
    default:
      throw new ForbiddenError('Insufficient data scope');
  }
}

export function assertApplicationAccess(actor: AuthenticatedUser, app: BranchScopedRecord): void {
  if (actor.roles.includes('SUPER_ADMIN') || actor.roles.includes('ADMIN')) return;

  if (actor.userType === UserType.CUSTOMER && actor.customerId) {
    if (app.customerId !== actor.customerId) {
      throw new ForbiddenError('Insufficient access to application');
    }
    return;
  }

  if (actor.userType === UserType.PARTNER && actor.partnerId) {
    if (app.partnerId !== actor.partnerId) {
      throw new ForbiddenError('Insufficient access to application');
    }
    return;
  }

  switch (actor.dataScope) {
    case DataScope.ORGANIZATION:
      return;
    case DataScope.REGION:
      if (app.regionId && actor.regionId && app.regionId !== actor.regionId) {
        throw new ForbiddenError('Application outside regional scope');
      }
      return;
    case DataScope.BRANCH:
      if (app.branchId && actor.branchId && app.branchId !== actor.branchId) {
        throw new ForbiddenError('Application outside branch scope');
      }
      return;
    case DataScope.ASSIGNED: {
      const ids = assignedEmployeeIds(actor);
      const assigned =
        (app.assignedSalesId && ids.includes(app.assignedSalesId)) ||
        (app.assignedCreditId && ids.includes(app.assignedCreditId)) ||
        (app.assignedOpsId && ids.includes(app.assignedOpsId));
      if (!assigned) throw new ForbiddenError('Application not assigned to you');
      return;
    }
    case DataScope.OWN:
      if (app.customerId && actor.customerId && app.customerId !== actor.customerId) {
        throw new ForbiddenError('Insufficient access to application');
      }
      return;
    default:
      throw new ForbiddenError('Insufficient data scope');
  }
}

export function assertDocumentAccess(actor: AuthenticatedUser, doc: BranchScopedRecord): void {
  if (actor.roles.includes('SUPER_ADMIN') || actor.roles.includes('ADMIN')) return;

  if (actor.userType === UserType.CUSTOMER && actor.customerId) {
    if (doc.customerId !== actor.customerId) {
      throw new ForbiddenError('Insufficient access to document');
    }
    return;
  }

  if (actor.userType === UserType.PARTNER && actor.partnerId) {
    if (doc.partnerId !== actor.partnerId) {
      throw new ForbiddenError('Insufficient access to document');
    }
    return;
  }

  switch (actor.dataScope) {
    case DataScope.ORGANIZATION:
      return;
    case DataScope.REGION:
      if (doc.regionId && actor.regionId && doc.regionId !== actor.regionId) {
        throw new ForbiddenError('Document outside regional scope');
      }
      if (!doc.regionId && doc.uploadedById && doc.uploadedById !== actor.id) {
        throw new ForbiddenError('Insufficient access to document');
      }
      return;
    case DataScope.BRANCH:
      if (doc.branchId && actor.branchId && doc.branchId !== actor.branchId) {
        throw new ForbiddenError('Document outside branch scope');
      }
      if (!doc.branchId && doc.uploadedById && doc.uploadedById !== actor.id) {
        throw new ForbiddenError('Insufficient access to document');
      }
      return;
    case DataScope.ASSIGNED:
      if (doc.uploadedById && doc.uploadedById === actor.id) return;
      throw new ForbiddenError('Document not accessible in assigned scope');
    case DataScope.OWN:
      if (doc.uploadedById && doc.uploadedById !== actor.id) {
        throw new ForbiddenError('Insufficient access to document');
      }
      return;
    default:
      throw new ForbiddenError('Insufficient data scope');
  }
}
