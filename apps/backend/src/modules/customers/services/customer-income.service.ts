import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  CreateCustomerIncomeInput,
  UpdateCustomerIncomeInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { assertCustomerAccess } from '../../../shared/utils/customer-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { customerIncomeRepository } from '../repositories/customer-income.repository.js';
import type { RequestContext } from '../types/customers.types.js';

import { loadCustomer } from './customer.service.js';

export const customerIncomeService = {
  async list(actor: AuthenticatedUser, customerId: string, employmentId?: string) {
    const customer = await loadCustomer(customerId);
    assertCustomerAccess(actor, customer);
    return customerIncomeRepository.listByCustomer(customerId, employmentId);
  },

  async create(actor: AuthenticatedUser, input: CreateCustomerIncomeInput, ctx: RequestContext) {
    const customer = await loadCustomer(input.customerId);
    assertCustomerAccess(actor, customer);

    const income = await customerIncomeRepository.create({
      ...input,
      incomeType: input.incomeType as never,
      frequency: input.frequency as never,
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_INCOME_CREATED',
      entityType: 'customer_income',
      entityId: income.id,
      newValues: { customerId: input.customerId },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return income;
  },

  async update(
    actor: AuthenticatedUser,
    id: string,
    input: UpdateCustomerIncomeInput,
    ctx: RequestContext,
  ) {
    const existing = await customerIncomeRepository.findById(id);
    if (!existing) throw new NotFoundError('CustomerIncome', id);

    const customer = await loadCustomer(existing.customerId);
    assertCustomerAccess(actor, customer);

    const updated = await customerIncomeRepository.update(id, {
      ...input,
      incomeType: input.incomeType as never,
      frequency: input.frequency as never,
      updatedById: ctx.actorId,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_INCOME_UPDATED',
      entityType: 'customer_income',
      entityId: id,
      newValues: input,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return updated;
  },

  async remove(actor: AuthenticatedUser, id: string, ctx: RequestContext): Promise<void> {
    const existing = await customerIncomeRepository.findById(id);
    if (!existing) throw new NotFoundError('CustomerIncome', id);

    const customer = await loadCustomer(existing.customerId);
    assertCustomerAccess(actor, customer);

    await customerIncomeRepository.softDelete(id, ctx.actorId);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_INCOME_DELETED',
      entityType: 'customer_income',
      entityId: id,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  },
};
