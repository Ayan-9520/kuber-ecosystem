import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  CreateCustomerAddressInput,
  UpdateCustomerAddressInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { assertCustomerAccess } from '../../../shared/utils/customer-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { customerAddressRepository } from '../repositories/customer-address.repository.js';
import type { RequestContext } from '../types/customers.types.js';

import { loadCustomer } from './customer.service.js';

export const customerAddressService = {
  async list(actor: AuthenticatedUser, customerId: string, addressType?: string) {
    const customer = await loadCustomer(customerId);
    assertCustomerAccess(actor, customer);
    return customerAddressRepository.listByCustomer(customerId, addressType);
  },

  async create(actor: AuthenticatedUser, input: CreateCustomerAddressInput, ctx: RequestContext) {
    const customer = await loadCustomer(input.customerId);
    assertCustomerAccess(actor, customer);

    if (input.isPrimary) {
      await customerAddressRepository.clearPrimary(input.customerId);
    }

    const address = await customerAddressRepository.create({
      ...input,
      addressType: input.addressType as never,
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_ADDRESS_CREATED',
      entityType: 'customer_address',
      entityId: address.id,
      newValues: { customerId: input.customerId, addressType: input.addressType },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return address;
  },

  async update(
    actor: AuthenticatedUser,
    id: string,
    input: UpdateCustomerAddressInput,
    ctx: RequestContext,
  ) {
    const existing = await customerAddressRepository.findById(id);
    if (!existing) throw new NotFoundError('CustomerAddress', id);

    const customer = await loadCustomer(existing.customerId);
    assertCustomerAccess(actor, customer);

    if (input.isPrimary) {
      await customerAddressRepository.clearPrimary(existing.customerId);
    }

    const updated = await customerAddressRepository.update(id, {
      ...input,
      addressType: input.addressType as never,
      updatedById: ctx.actorId,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_ADDRESS_UPDATED',
      entityType: 'customer_address',
      entityId: id,
      newValues: input,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return updated;
  },

  async remove(actor: AuthenticatedUser, id: string, ctx: RequestContext): Promise<void> {
    const existing = await customerAddressRepository.findById(id);
    if (!existing) throw new NotFoundError('CustomerAddress', id);

    const customer = await loadCustomer(existing.customerId);
    assertCustomerAccess(actor, customer);

    await customerAddressRepository.softDelete(id, ctx.actorId);

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_ADDRESS_DELETED',
      entityType: 'customer_address',
      entityId: id,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  },
};
