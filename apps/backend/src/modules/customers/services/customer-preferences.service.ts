import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { UpsertCustomerPreferencesInput } from '@kuberone/shared-validation';

import { assertCustomerAccess } from '../../../shared/utils/customer-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { customerPreferencesRepository } from '../repositories/customer-preferences.repository.js';
import type { RequestContext } from '../types/customers.types.js';

import { loadCustomer } from './customer.service.js';

export const customerPreferencesService = {
  async get(actor: AuthenticatedUser, customerId: string) {
    const customer = await loadCustomer(customerId);
    assertCustomerAccess(actor, customer);
    return customerPreferencesRepository.findByCustomerId(customerId);
  },

  async upsert(
    actor: AuthenticatedUser,
    input: UpsertCustomerPreferencesInput,
    ctx: RequestContext,
  ) {
    const customer = await loadCustomer(input.customerId);
    assertCustomerAccess(actor, customer);

    const { customerId, ...prefs } = input;
    const preferences = await customerPreferencesRepository.upsert(
      customerId,
      prefs,
      ctx.actorId,
    );

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: 'CUSTOMER_PREFERENCES_UPSERTED',
      entityType: 'customer_preferences',
      entityId: preferences.id,
      newValues: { customerId },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return preferences;
  },
};
