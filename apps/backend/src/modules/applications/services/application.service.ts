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
import { emitAutomationEvent } from '../../../shared/utils/automation-emitter.util.js';
import {
  applyApplicationScope,
  assertApplicationAccess,
} from '../../../shared/utils/data-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { customerRepository } from '../../customers/repositories/customer.repository.js';
import { productRepository } from '../../product/repositories/product.repository.js';
import { applicationStatusRepository } from '../repositories/application-status.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import type { RequestContext } from '../types/applications.types.js';
import {
  auditApplicationMutation,
  buildPaginationMeta,
  generateApplicationNumber,
} from '../utils/applications.utils.js';

import { applicationTimelineService } from './application-timeline.service.js';
import { applicationWorkflowService } from './application-workflow.service.js';
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

export const applicationService = {
  async list(actor: AuthenticatedUser, query: ListApplicationsQuery) {
    const where = applyApplicationScope(actor, buildListWhere(query));
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      applicationRepository.list(where, skip, query.limit, orderBy),
      applicationRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(actor: AuthenticatedUser, id: string) {
    const application = await applicationRepository.findById(id);
    if (!application) throw new NotFoundError('Application', id);
    assertApplicationAccess(actor, application);
    const latestEligibility = await eligibilityResultService.getLatest(id);
    return { ...application, latestEligibility };
  },

  async create(input: CreateApplicationInput, ctx: RequestContext) {
    const [customer, product] = await Promise.all([
      customerRepository.findById(input.customerId),
      productRepository.findById(input.productId),
    ]);
    if (!customer) throw new NotFoundError('Customer', input.customerId);
    if (!product) throw new NotFoundError('Product', input.productId);

    const last = await applicationRepository.getLastApplicationNumber();
    const applicationNumber = generateApplicationNumber(last?.applicationNumber);

    const application = await applicationRepository.create({
      applicationNumber,
      customerId: input.customerId,
      leadId: input.leadId,
      productId: input.productId,
      variantId: input.variantId,
      partnerId: input.partnerId,
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
    await applicationWorkflowService.onApplicationCreated(application.id, input.leadId, ctx);
    emitAutomationEvent({
      triggerType: 'APPLICATION_CREATED',
      subjectType: 'application',
      subjectId: application.id,
      userId: customer.userId ?? ctx.actorId,
      context: { applicationNumber, customerId: input.customerId, leadId: input.leadId },
    });
    return applicationRepository.findById(application.id);
  },

  async update(actor: AuthenticatedUser, id: string, input: UpdateApplicationInput, ctx: RequestContext) {
    const existing = await applicationRepository.findById(id);
    if (!existing) throw new NotFoundError('Application', id);
    assertApplicationAccess(actor, existing);

    if (input.status && input.status !== existing.status) {
      await applicationWorkflowService.transition(id, input.status as never, ctx, input.statusReason);
    }

    const application = await applicationRepository.update(id, {
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
    return application;
  },

  async submit(actor: AuthenticatedUser, id: string, input: SubmitApplicationInput, ctx: RequestContext) {
    const application = await applicationRepository.findById(id);
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

    await applicationRepository.update(id, {
      submittedAt: new Date(),
      updatedById: ctx.actorId,
    });

    await applicationWorkflowService.transition(id, 'SUBMITTED', ctx, 'Application submitted');
    await applicationTimelineService.addEvent(id, 'STATUS_CHANGE', 'Application submitted', ctx);

    await auditApplicationMutation(authAuditRepository.log, ctx, 'APPLICATION_SUBMITTED', 'application', id);
    return applicationRepository.findById(id);
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
