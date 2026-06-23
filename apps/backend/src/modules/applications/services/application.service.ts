import type { ApplicationStatus, Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  CreateApplicationInput,
  ListApplicationsQuery,
  SubmitApplicationInput,
  UpdateApplicationInput,
  AssignApplicationInput,
} from '@kuberone/shared-validation';

import { AppError, NotFoundError } from '../../../shared/errors/app-error.js';
import { prisma } from '../../../config/database.js';
import { emitAutomationEvent } from '../../../shared/utils/automation-emitter.util.js';
import {
  applyApplicationScope,
  assertApplicationAccess,
} from '../../../shared/utils/data-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { customerRepository } from '../../customers/repositories/customer.repository.js';
import { leadStatusHistoryRepository } from '../../leads/repositories/lead-status-history.repository.js';
import { productRepository } from '../../product/repositories/product.repository.js';
import { applicationStatusRepository } from '../repositories/application-status.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import type { RequestContext } from '../types/applications.types.js';
import {
  auditApplicationMutation,
  buildPaginationMeta,
  generateApplicationNumber,
} from '../utils/applications.utils.js';
import { serializeApplication } from '../utils/application-serializer.js';

import { applicationTimelineService } from './application-timeline.service.js';
import { applicationWorkflowService } from './application-workflow.service.js';
import { customerLeadBridgeService } from './customer-lead-bridge.service.js';
import { eligibilityResultService } from './eligibility-result.service.js';

function buildListWhere(query: ListApplicationsQuery): Prisma.ApplicationWhereInput {
  return {
    ...(query.includeDeleted ? {} : { deletedAt: null }),
    ...(query.status ? { status: query.status as never } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.productId ? { productId: query.productId } : {}),
    ...(query.variantId ? { variantId: query.variantId } : {}),
    ...(query.leadId ? { leadId: query.leadId } : {}),
    ...(query.partnerId ? { partnerId: query.partnerId } : {}),
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.regionId ? { regionId: query.regionId } : {}),
    ...(query.assignedSalesId ? { assignedSalesId: query.assignedSalesId } : {}),
    ...(query.assignedCreditId ? { assignedCreditId: query.assignedCreditId } : {}),
    ...(query.selectedLenderId ? { selectedLenderId: query.selectedLenderId } : {}),
    ...(query.search
      ? {
          OR: [
            { applicationNumber: { contains: query.search } },
            { purpose: { contains: query.search } },
            { customer: { fullName: { contains: query.search } } },
          ],
        }
      : {}),
    ...(query.fromDate || query.toDate
      ? {
          createdAt: {
            ...(query.fromDate ? { gte: query.fromDate } : {}),
            ...(query.toDate ? { lte: query.toDate } : {}),
          },
        }
      : {}),
  };
}

async function resolvePartnerContext(
  customerId: string,
  input: CreateApplicationInput,
): Promise<{ partnerId?: string; leadId?: string }> {
  if (input.partnerId && input.leadId) {
    return { partnerId: input.partnerId, leadId: input.leadId };
  }

  const lead = await prisma.lead.findFirst({
    where: { customerId, deletedAt: null, partnerId: { not: null } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, partnerId: true },
  });
  if (lead?.partnerId) {
    return {
      partnerId: input.partnerId ?? lead.partnerId ?? undefined,
      leadId: input.leadId ?? lead.id,
    };
  }

  const referral = await prisma.referral.findFirst({
    where: { customerId, deletedAt: null, partnerId: { not: null } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, partnerId: true, leadId: true },
  });
  if (referral?.partnerId) {
    return {
      partnerId: input.partnerId ?? referral.partnerId ?? undefined,
      leadId: input.leadId ?? referral.leadId ?? undefined,
    };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { user: { select: { phone: true } } },
  });
  const customerPhone = String(customer?.user?.phone ?? '')
    .replace(/\D/g, '')
    .slice(-10);

  if (customerPhone.length >= 10) {
    const referralByPhone = await prisma.referral.findFirst({
      where: {
        deletedAt: null,
        partnerId: { not: null },
        refereePhone: { contains: customerPhone },
        status: { in: ['PENDING', 'ACTIVE'] },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, partnerId: true, leadId: true, customerId: true },
    });
    if (referralByPhone?.partnerId) {
      if (!referralByPhone.customerId) {
        await prisma.referral.update({
          where: { id: referralByPhone.id },
          data: { customerId },
        });
      }
      return {
        partnerId: input.partnerId ?? referralByPhone.partnerId ?? undefined,
        leadId: input.leadId ?? referralByPhone.leadId ?? undefined,
      };
    }

    const partnerLead = await prisma.lead.findFirst({
      where: {
        deletedAt: null,
        partnerId: { not: null },
        prospectPhone: { contains: customerPhone },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, partnerId: true, customerId: true },
    });
    if (partnerLead?.partnerId) {
      if (!partnerLead.customerId) {
        await prisma.lead.update({
          where: { id: partnerLead.id },
          data: { customerId },
        });
      }
      return {
        partnerId: input.partnerId ?? partnerLead.partnerId ?? undefined,
        leadId: input.leadId ?? partnerLead.id,
      };
    }
  }

  return { partnerId: input.partnerId, leadId: input.leadId };
}

async function syncCustomerFromWizardMetadata(
  customerId: string,
  metadata: Record<string, unknown> | undefined,
): Promise<void> {
  const wizard = metadata?.wizard as Record<string, unknown> | undefined;
  const personal = wizard?.personal as Record<string, unknown> | undefined;
  const firstName = String(personal?.firstName ?? '').trim();
  const lastName = String(personal?.lastName ?? '').trim();
  if (!firstName) return;

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      firstName,
      lastName: lastName || null,
      fullName: `${firstName} ${lastName}`.trim(),
    },
  });
}

export const applicationService = {
  async list(actor: AuthenticatedUser, query: ListApplicationsQuery) {
    const where = applyApplicationScope(actor, buildListWhere(query));
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      applicationRepository.list(where, skip, query.limit, orderBy),
      applicationRepository.count(where),
    ]);

    return {
      items: items.map((item) => serializeApplication(item)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getById(actor: AuthenticatedUser, id: string) {
    const application = await applicationRepository.findById(id);
    if (!application) throw new NotFoundError('Application', id);
    assertApplicationAccess(actor, application);
    const latestEligibility = await eligibilityResultService.getLatest(id);
    return { ...serializeApplication(application), latestEligibility };
  },

  async create(input: CreateApplicationInput, ctx: RequestContext) {
    const [customer, product] = await Promise.all([
      customerRepository.findById(input.customerId),
      productRepository.findById(input.productId),
    ]);
    if (!customer) throw new NotFoundError('Customer', input.customerId);
    if (!product) throw new NotFoundError('Product', input.productId);

    await syncCustomerFromWizardMetadata(
      input.customerId,
      input.metadata as Record<string, unknown> | undefined,
    );

    const { partnerId, leadId: partnerLeadId } = await resolvePartnerContext(input.customerId, input);
    const leadId =
      partnerLeadId ??
      (await customerLeadBridgeService.ensureLeadForApplication(customer, input, ctx));

    if (leadId && partnerLeadId) {
      await customerLeadBridgeService.syncLeadFromApplication(leadId, customer, input, ctx);
    }

    const last = await applicationRepository.getLastApplicationNumber();
    const applicationNumber = generateApplicationNumber(last?.applicationNumber);

    const application = await applicationRepository.create({
      applicationNumber,
      customerId: input.customerId,
      leadId,
      productId: input.productId,
      variantId: input.variantId,
      partnerId,
      branchId: input.branchId ?? customer.branchId,
      regionId: input.regionId,
      requestedAmount: input.requestedAmount,
      requestedTenureMonths: input.requestedTenureMonths,
      purpose: input.purpose,
      selectedLenderId: input.selectedLenderId,
      metadata: input.metadata as Prisma.InputJsonValue,
      status: 'DRAFT',
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await applicationService.recordStatus(application.id, null, 'DRAFT', ctx, 'Application created');

    if (input.runEligibility) {
      await eligibilityResultService.evaluate(
        { applicationId: application.id, applicantProfile: input.applicantProfile },
        ctx,
        input.applicantProfile,
      );
    }

    await auditApplicationMutation(authAuditRepository.log, ctx, 'APPLICATION_CREATED', 'application', application.id, input);
    await applicationWorkflowService.onApplicationCreated(application.id, leadId, ctx);

    const wizardMeta = input.metadata as Record<string, unknown> | undefined;
    const wizard = wizardMeta?.wizard as Record<string, unknown> | undefined;
    const uploadedDocuments = Array.isArray(wizard?.uploadedDocuments)
      ? (wizard!.uploadedDocuments as string[])
      : [];
    if (uploadedDocuments.length > 0) {
      await customerLeadBridgeService.linkDocumentsToApplication(
        application.id,
        input.customerId,
        uploadedDocuments,
        leadId,
      );
    }

    emitAutomationEvent({
      triggerType: 'APPLICATION_CREATED',
      subjectType: 'application',
      subjectId: application.id,
      userId: customer.userId ?? ctx.actorId,
      context: { applicationNumber, customerId: input.customerId, leadId },
    });
    const saved = await applicationRepository.findById(application.id);
    return saved ? serializeApplication(saved) : saved;
  },

  async update(actor: AuthenticatedUser, id: string, input: UpdateApplicationInput, ctx: RequestContext) {
    const existing = await applicationRepository.findById(id);
    if (!existing) throw new NotFoundError('Application', id);
    assertApplicationAccess(actor, existing);

    if (input.status && input.status !== existing.status) {
      await applicationWorkflowService.transition(id, input.status as never, ctx, input.statusReason);
    }

    await applicationRepository.update(id, {
      variantId: input.variantId,
      partnerId: input.partnerId,
      branchId: input.branchId,
      regionId: input.regionId,
      requestedAmount: input.requestedAmount,
      requestedTenureMonths: input.requestedTenureMonths,
      purpose: input.purpose,
      selectedLenderId: input.selectedLenderId,
      metadata: input.metadata as Prisma.InputJsonValue,
      version: { increment: 1 },
      updatedById: ctx.actorId,
    });

    await auditApplicationMutation(authAuditRepository.log, ctx, 'APPLICATION_UPDATED', 'application', id, input);
    const saved = await applicationRepository.findById(id);
    return saved ? serializeApplication(saved) : saved;
  },

  async submit(actor: AuthenticatedUser, id: string, input: SubmitApplicationInput, ctx: RequestContext) {
    let application = await applicationRepository.findById(id);
    if (!application) throw new NotFoundError('Application', id);
    assertApplicationAccess(actor, application);
    if (application.status !== 'DRAFT') {
      throw new AppError(400, 'BAD_REQUEST', 'Only draft applications can be submitted');
    }

    if (input.runEligibility) {
      await eligibilityResultService.evaluate(
        { applicationId: id, applicantProfile: input.applicantProfile },
        ctx,
        input.applicantProfile,
      );
    }

    application = await applicationRepository.update(id, {
      submittedAt: new Date(),
      updatedById: ctx.actorId,
    });

    await applicationWorkflowService.transition(id, 'SUBMITTED', ctx, 'Application submitted');
    await applicationTimelineService.addEvent(id, 'STATUS_CHANGE', 'Application submitted', ctx);

    if (application.leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: application.leadId },
        select: { status: true, requestedAmount: true, prospectPhone: true, prospectEmail: true },
      });
      const fromStatus = lead?.status ?? 'NEW';
      const wizard = (application.metadata as Record<string, unknown> | undefined)?.wizard as
        | Record<string, unknown>
        | undefined;
      const personal = wizard?.personal as Record<string, unknown> | undefined;

      const customerUser = await prisma.user.findFirst({
        where: { customer: { id: application.customerId } },
        select: { phone: true, email: true },
      });
      const normalizedPhone = String(personal?.phone ?? customerUser?.phone ?? '')
        .replace(/\D/g, '')
        .slice(-10);

      await prisma.lead.update({
        where: { id: application.leadId },
        data: {
          status: 'APPLICATION_CREATED',
          requestedAmount: application.requestedAmount ?? lead?.requestedAmount,
          ...(lead?.prospectPhone && lead.prospectPhone.length >= 10
            ? {}
            : normalizedPhone.length >= 10
              ? { prospectPhone: normalizedPhone }
              : {}),
          ...(lead?.prospectEmail
            ? {}
            : personal?.email
              ? { prospectEmail: String(personal.email) }
              : customerUser?.email
                ? { prospectEmail: customerUser.email }
                : {}),
          updatedById: ctx.actorId,
        },
      });
      await leadStatusHistoryRepository.create({
        leadId: application.leadId,
        fromStatus,
        toStatus: 'APPLICATION_CREATED',
        changedById: ctx.actorId,
        reason: 'Customer submitted loan application',
      });
    }

    await auditApplicationMutation(authAuditRepository.log, ctx, 'APPLICATION_SUBMITTED', 'application', id);
    const saved = await applicationRepository.findById(id);
    return saved ? serializeApplication(saved) : saved;
  },

  async assign(actor: AuthenticatedUser, id: string, input: AssignApplicationInput, ctx: RequestContext) {
    const application = await applicationRepository.findById(id);
    if (!application) throw new NotFoundError('Application', id);
    assertApplicationAccess(actor, application);

    const updated = await applicationRepository.update(id, {
      assignedSalesId: input.assignedSalesId,
      assignedCreditId: input.assignedCreditId,
      assignedOpsId: input.assignedOpsId,
      updatedById: ctx.actorId,
    });

    await applicationTimelineService.addEvent(id, 'ASSIGNMENT', 'Application assigned', ctx, undefined, input);

    await auditApplicationMutation(authAuditRepository.log, ctx, 'APPLICATION_ASSIGNED', 'application', id, input);
    return updated;
  },

  async remove(actor: AuthenticatedUser, id: string, ctx: RequestContext) {
    await applicationService.getById(actor, id);
    await applicationRepository.softDelete(id, ctx.actorId);
    await auditApplicationMutation(authAuditRepository.log, ctx, 'APPLICATION_DELETED', 'application', id);
  },

  async recordStatus(
    applicationId: string,
    fromStatus: ApplicationStatus | null,
    toStatus: ApplicationStatus,
    ctx: RequestContext,
    reason?: string,
  ) {
    await applicationStatusRepository.create({
      applicationId,
      fromStatus,
      toStatus,
      changedById: ctx.actorId,
      reason,
    });
  },

  async transitionStatus(
    applicationId: string,
    toStatus: ApplicationStatus,
    ctx: RequestContext,
    reason?: string,
  ) {
    return applicationWorkflowService.transition(applicationId, toStatus, ctx, reason);
  },
};
