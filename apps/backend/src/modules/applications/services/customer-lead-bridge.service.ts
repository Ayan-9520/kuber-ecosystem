import type { Prisma } from '@kuberone/database';
import type { CreateApplicationInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { emitAutomationEvent } from '../../../shared/utils/automation-emitter.util.js';
import { leadSourceRepository } from '../../leads/repositories/lead-source.repository.js';
import { leadStatusHistoryRepository } from '../../leads/repositories/lead-status-history.repository.js';
import { leadRepository } from '../../leads/repositories/lead.repository.js';
import { leadScoreService } from '../../leads/services/lead-score.service.js';
import { TERMINAL_STATUSES } from '../../leads/constants/leads.constants.js';
import type { RequestContext } from '../types/applications.types.js';
import { generateLeadNumber } from '../../leads/utils/leads.utils.js';
import { productRepository } from '../../product/repositories/product.repository.js';

type CustomerRow = {
  id: string;
  userId: string | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  branchId: string | null;
  user?: { phone: string | null; email: string | null } | null;
};

function wizardPersonal(metadata: Record<string, unknown> | undefined) {
  const wizard = metadata?.wizard as Record<string, unknown> | undefined;
  return wizard?.personal as Record<string, unknown> | undefined;
}

function prospectNameFrom(customer: CustomerRow, personal?: Record<string, unknown>): string {
  const fromWizard = [personal?.firstName, personal?.lastName].filter(Boolean).join(' ').trim();
  if (fromWizard) return fromWizard;
  if (customer.fullName?.trim()) return customer.fullName.trim();
  const fromParts = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim();
  return fromParts || 'Customer';
}

function buildLeadContactPayload(
  customer: CustomerRow,
  input: CreateApplicationInput,
  personal: Record<string, unknown> | undefined,
  user: { phone: string | null; email: string | null } | null,
  actorId: string,
) {
  const wizard = (input.metadata as Record<string, unknown> | undefined)?.wizard;
  const metadata = input.metadata as Prisma.InputJsonValue | undefined;

  return {
    customerId: customer.id,
    prospectName: prospectNameFrom(customer, personal),
    prospectPhone: String(personal?.phone ?? user?.phone ?? '').replace(/\D/g, '').slice(-10),
    prospectEmail: (personal?.email as string | undefined) ?? user?.email ?? undefined,
    productId: input.productId,
    variantId: input.variantId,
    branchId: input.branchId ?? customer.branchId ?? undefined,
    regionId: input.regionId,
    requestedAmount: input.requestedAmount,
    metadata: {
      channel: 'MOBILE_APP',
      wizardProfile: (wizard as Record<string, unknown> | undefined)?.wizardProfile,
      productName: (wizard as Record<string, unknown> | undefined)?.productName,
      ...(metadata && typeof metadata === 'object' ? { applicationWizard: wizard } : {}),
    } as Prisma.InputJsonValue,
    updatedById: actorId,
  };
}

function buildLeadPayload(
  customer: CustomerRow,
  input: CreateApplicationInput,
  sourceId: string,
  personal: Record<string, unknown> | undefined,
  user: { phone: string | null; email: string | null } | null,
  actorId: string,
) {
  return {
    ...buildLeadContactPayload(customer, input, personal, user, actorId),
    sourceId,
  };
}

async function resolveCustomerUser(customer: CustomerRow) {
  return (
    customer.user ??
    (customer.userId
      ? await prisma.user.findUnique({
          where: { id: customer.userId },
          select: { phone: true, email: true },
        })
      : null)
  );
}

async function scoreBridgeLead(leadId: string, input: CreateApplicationInput, ctx: RequestContext) {
  const product = await productRepository.findById(input.productId);
  const scoringProfile = {
    loanAmount: input.requestedAmount,
    productType: product?.family?.code,
  };
  await leadScoreService.scoreLead({ leadId, scoringProfile }, ctx, scoringProfile);
}

export const customerLeadBridgeService = {
  /** Syncs contact/product fields from a mobile application onto an existing CRM lead (e.g. partner-referred). */
  async syncLeadFromApplication(
    leadId: string,
    customer: CustomerRow,
    input: CreateApplicationInput,
    ctx: RequestContext,
  ): Promise<void> {
    const personal = wizardPersonal(input.metadata as Record<string, unknown> | undefined);
    const user = await resolveCustomerUser(customer);
    const payload = buildLeadContactPayload(customer, input, personal, user, ctx.actorId);
    if (payload.prospectPhone.length < 10) return;

    await leadRepository.update(leadId, payload);
  },

  /** Creates a CRM lead when a customer starts a self-service application (mobile app). */
  async ensureLeadForApplication(
    customer: CustomerRow,
    input: CreateApplicationInput,
    ctx: RequestContext,
    existingLeadId?: string | null,
  ): Promise<string | undefined> {
    if (existingLeadId) {
      await customerLeadBridgeService.syncLeadFromApplication(existingLeadId, customer, input, ctx);
      return existingLeadId;
    }

    const openLead = await prisma.lead.findFirst({
      where: {
        customerId: customer.id,
        productId: input.productId,
        deletedAt: null,
        status: { notIn: [...TERMINAL_STATUSES] },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    const source = await leadSourceRepository.findByCode('MOBILE_APP');
    if (!source) return undefined;

    const personal = wizardPersonal(input.metadata as Record<string, unknown> | undefined);
    const user = await resolveCustomerUser(customer);

    const prospectPhone = String(personal?.phone ?? user?.phone ?? '').replace(/\D/g, '').slice(-10);
    if (prospectPhone.length < 10) return undefined;

    const payload = buildLeadPayload(customer, input, source.id, personal, user, ctx.actorId);

    if (openLead) {
      await leadRepository.update(openLead.id, { ...payload, priority: 'MEDIUM' });
      await scoreBridgeLead(openLead.id, input, ctx);
      return openLead.id;
    }

    const last = await leadRepository.getLastLeadNumber();
    const leadNumber = generateLeadNumber(last?.leadNumber);

    const lead = await leadRepository.create({
      leadNumber,
      ...payload,
      priority: 'MEDIUM',
      status: 'NEW',
      createdById: ctx.actorId,
    });

    await leadStatusHistoryRepository.create({
      leadId: lead.id,
      fromStatus: null,
      toStatus: 'NEW',
      changedById: ctx.actorId,
      reason: 'Lead created from customer mobile application',
    });

    emitAutomationEvent({
      triggerType: 'LEAD_CREATED',
      subjectType: 'lead',
      subjectId: lead.id,
      userId: ctx.actorId,
      context: {
        leadNumber,
        customerId: customer.id,
        productId: input.productId,
        source: 'MOBILE_APP',
      },
    });

    await scoreBridgeLead(lead.id, input, ctx);

    return lead.id;
  },

  async linkDocumentsToApplication(
    applicationId: string,
    customerId: string,
    documentIds: string[],
    leadId?: string | null,
  ): Promise<void> {
    if (documentIds.length === 0) return;

    await prisma.document.updateMany({
      where: {
        id: { in: documentIds },
        customerId,
        deletedAt: null,
      },
      data: {
        applicationId,
        ...(leadId ? { leadId } : {}),
      },
    });
  },
};
