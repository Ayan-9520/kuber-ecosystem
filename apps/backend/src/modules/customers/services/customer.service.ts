import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  CreateCustomerInput,
  ListCustomersQuery,
  UpdateCustomerInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import {
  assertCustomerAccess,
  buildCustomerListWhere,
} from '../../../shared/utils/customer-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { userRepository } from '../../auth/repositories/user.repository.js';
import { toCustomerResponse } from '../dtos/customer.dto.js';
import { customerRepository, generateCustomerCode } from '../repositories/customer.repository.js';
import type { RequestContext } from '../types/customers.types.js';

export const customerService = {
  async list(actor: AuthenticatedUser, query: ListCustomersQuery) {
    const where = buildCustomerListWhere(actor, query);
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      customerRepository.list(where, skip, query.limit, orderBy),
      customerRepository.count(where),
    ]);

    return {
      items: items.map(toCustomerResponse),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  async getById(actor: AuthenticatedUser, id: string) {
    const customer = await loadCustomer(id);
    assertCustomerAccess(actor, customer);
    return toCustomerResponse(customer);
  },

  async create(_actor: AuthenticatedUser, input: CreateCustomerInput, ctx: RequestContext) {
    const user = await userRepository.findById(input.userId);
    if (!user) throw new NotFoundError('User', input.userId);

    const existing = await customerRepository.findByUserId(input.userId);
    if (existing) throw new ConflictError('Customer already exists for this user');

    const fullName = [input.firstName, input.lastName].filter(Boolean).join(' ').trim();
    const customer = await customerRepository.create({
      ...input,
      customerCode: generateCustomerCode(),
      fullName,
      createdById: ctx.actorId,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_CREATED',
      entityType: 'customer',
      entityId: customer.id,
      newValues: { customerCode: customer.customerCode, userId: customer.userId },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return toCustomerResponse(customer);
  },

  async update(
    actor: AuthenticatedUser,
    id: string,
    input: UpdateCustomerInput,
    ctx: RequestContext,
  ) {
    const customer = await loadCustomer(id);
    assertCustomerAccess(actor, customer);

    const fullName =
      input.firstName || input.lastName
        ? [input.firstName ?? customer.firstName, input.lastName ?? customer.lastName]
            .filter(Boolean)
            .join(' ')
            .trim()
        : undefined;

    const updated = await customerRepository.update(id, {
      ...input,
      fullName,
      updatedById: ctx.actorId,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_UPDATED',
      entityType: 'customer',
      entityId: id,
      newValues: input as Prisma.InputJsonValue,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return toCustomerResponse(updated);
  },

  async remove(actor: AuthenticatedUser, id: string, ctx: RequestContext): Promise<void> {
    const customer = await loadCustomer(id);
    assertCustomerAccess(actor, customer);

    await customerRepository.softDelete(id, ctx.actorId);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_DELETED',
      entityType: 'customer',
      entityId: id,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  },
};

export async function loadCustomer(id: string) {
  const customer = await customerRepository.findById(id);
  if (!customer) throw new NotFoundError('Customer', id);
  return customer;
}
