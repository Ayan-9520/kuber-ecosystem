import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { UpsertCustomerProfileInput } from '@kuberone/shared-validation';

import { assertCustomerAccess } from '../../../shared/utils/customer-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { customerProfileRepository } from '../repositories/customer-profile.repository.js';
import type { RequestContext } from '../types/customers.types.js';

import { loadCustomer } from './customer.service.js';

export const customerProfileService = {
  async get(actor: AuthenticatedUser, customerId: string) {
    const customer = await loadCustomer(customerId);
    assertCustomerAccess(actor, customer);

    const profile = await customerProfileRepository.findByCustomerId(customerId);
    return profile;
  },

  async upsert(actor: AuthenticatedUser, input: UpsertCustomerProfileInput, ctx: RequestContext) {
    const customer = await loadCustomer(input.customerId);
    assertCustomerAccess(actor, customer);

    const profile = await customerProfileRepository.upsert({
      ...input,
      actorId: ctx.actorId,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_PROFILE_UPSERTED',
      entityType: 'customer_profile',
      entityId: profile.id,
      newValues: { customerId: input.customerId },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return profile;
  },
};
