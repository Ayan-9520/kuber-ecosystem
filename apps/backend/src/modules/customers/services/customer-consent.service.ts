import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { CreateCustomerConsentInput } from '@kuberone/shared-validation';

import { assertCustomerAccess } from '../../../shared/utils/customer-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { customerConsentRepository } from '../repositories/customer-consent.repository.js';
import type { RequestContext } from '../types/customers.types.js';

import { loadCustomer } from './customer.service.js';

export const customerConsentService = {
  async list(actor: AuthenticatedUser, customerId: string, consentType?: string) {
    const customer = await loadCustomer(customerId);
    assertCustomerAccess(actor, customer);
    return customerConsentRepository.listByCustomer(customerId, consentType);
  },

  async create(
    actor: AuthenticatedUser,
    input: CreateCustomerConsentInput,
    ctx: RequestContext,
  ) {
    const customer = await loadCustomer(input.customerId);
    assertCustomerAccess(actor, customer);

    const consent = await customerConsentRepository.create({
      customerId: input.customerId,
      consentType: input.consentType as never,
      consentVersion: input.consentVersion,
      granted: input.granted,
      grantedAt: input.granted ? new Date() : undefined,
      revokedAt: input.granted ? undefined : new Date(),
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      createdById: ctx.actorId,
    });

    await authAuditRepository.log({
      userId: ctx.actorId,
      action: input.granted ? 'CUSTOMER_CONSENT_GRANTED' : 'CUSTOMER_CONSENT_REVOKED',
      entityType: 'customer_consent',
      entityId: consent.id,
      newValues: {
        customerId: input.customerId,
        consentType: input.consentType,
        granted: input.granted,
      },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });

    return consent;
  },
};
