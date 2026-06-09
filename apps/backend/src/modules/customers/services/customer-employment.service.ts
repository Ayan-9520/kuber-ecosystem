import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  CreateCustomerEmploymentInput,
  UpdateCustomerEmploymentInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { assertCustomerAccess } from '../../../shared/utils/customer-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { customerEmploymentRepository } from '../repositories/customer-employment.repository.js';
import type { RequestContext } from '../types/customers.types.js';

import { loadCustomer } from './customer.service.js';

export const customerEmploymentService = {
  async list(actor: AuthenticatedUser, customerId: string, isCurrent?: boolean) {
    const customer = await loadCustomer(customerId);
    assertCustomerAccess(actor, customer);
    return customerEmploymentRepository.listByCustomer(customerId, isCurrent);
  },

  async create(
    actor: AuthenticatedUser,
    input: CreateCustomerEmploymentInput,
    ctx: RequestContext,
  ) {
    const customer = await loadCustomer(input.customerId);
    assertCustomerAccess(actor, customer);

    if (input.isCurrent) {
      await customerEmploymentRepository.clearCurrent(input.customerId);
    }

    const employment = await customerEmploymentRepository.create({
      ...input,
      employmentType: input.employmentType as never,
      yearsInCurrentJob: input.yearsInCurrentJob,
      totalExperienceYears: input.totalExperienceYears,
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_EMPLOYMENT_CREATED',
      entityType: 'customer_employment',
      entityId: employment.id,
      newValues: { customerId: input.customerId },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return employment;
  },

  async update(
    actor: AuthenticatedUser,
    id: string,
    input: UpdateCustomerEmploymentInput,
    ctx: RequestContext,
  ) {
    const existing = await customerEmploymentRepository.findById(id);
    if (!existing) throw new NotFoundError('CustomerEmployment', id);

    const customer = await loadCustomer(existing.customerId);
    assertCustomerAccess(actor, customer);

    if (input.isCurrent) {
      await customerEmploymentRepository.clearCurrent(existing.customerId);
    }

    const updated = await customerEmploymentRepository.update(id, {
      ...input,
      employmentType: input.employmentType as never,
      updatedById: ctx.actorId,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_EMPLOYMENT_UPDATED',
      entityType: 'customer_employment',
      entityId: id,
      newValues: input,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return updated;
  },

  async remove(actor: AuthenticatedUser, id: string, ctx: RequestContext): Promise<void> {
    const existing = await customerEmploymentRepository.findById(id);
    if (!existing) throw new NotFoundError('CustomerEmployment', id);

    const customer = await loadCustomer(existing.customerId);
    assertCustomerAccess(actor, customer);

    await customerEmploymentRepository.softDelete(id, ctx.actorId);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_EMPLOYMENT_DELETED',
      entityType: 'customer_employment',
      entityId: id,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  },
};
