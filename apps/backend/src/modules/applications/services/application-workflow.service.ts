import type { ApplicationStatus, LeadStatus } from '@kuberone/database';

import { AppError, NotFoundError } from '../../../shared/errors/app-error.js';
import { prisma } from '../../../config/database.js';
import { emitAutomationEvent } from '../../../shared/utils/automation-emitter.util.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { customerRepository } from '../../customers/repositories/customer.repository.js';
import { leadRepository } from '../../leads/repositories/lead.repository.js';
import { leadStatusHistoryRepository } from '../../leads/repositories/lead-status-history.repository.js';
import { notificationDispatchService } from '../../notifications/services/notification-dispatch.service.js';
import { STATUS_TRANSITIONS, TERMINAL_APPLICATION_STATUSES } from '../constants/applications.constants.js';
import { applicationStatusRepository } from '../repositories/application-status.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import type { RequestContext } from '../types/applications.types.js';
import { auditApplicationMutation } from '../utils/applications.utils.js';

import { applicationTimelineService } from './application-timeline.service.js';

const STATUS_AUTOMATION_TRIGGER_MAP: Partial<Record<ApplicationStatus, string>> = {
  SUBMITTED: 'APPLICATION_APPROVED',
  SANCTIONED: 'APPLICATION_SANCTIONED',
  DISBURSED: 'APPLICATION_DISBURSED',
  REJECTED: 'APPLICATION_REJECTED',
};

const STATUS_NOTIFICATION_MAP: Partial<Record<ApplicationStatus, string>> = {
  SUBMITTED: 'APPLICATION_SUBMITTED',
  DOCUMENT_PENDING: 'DOCUMENT_REQUESTED',
  CREDIT_REVIEW: 'APPLICATION_SUBMITTED',
  SANCTIONED: 'SANCTION_ISSUED',
  DISBURSED: 'DISBURSEMENT_COMPLETED',
  REJECTED: 'DOCUMENT_REJECTED',
};

const LEAD_STATUS_BY_APPLICATION: Partial<Record<ApplicationStatus, LeadStatus>> = {
  SANCTIONED: 'SANCTIONED',
  DISBURSED: 'DISBURSED',
  CLOSED: 'DISBURSED',
  REJECTED: 'REJECTED',
};

const LEAD_SYNC_REASON: Partial<Record<ApplicationStatus, string>> = {
  SANCTIONED: 'Application sanctioned',
  DISBURSED: 'Application disbursed',
  CLOSED: 'Application closed after disbursement',
  REJECTED: 'Application rejected',
};

export const applicationWorkflowService = {
  validateTransition(fromStatus: ApplicationStatus, toStatus: ApplicationStatus): void {
    if (fromStatus === toStatus) return;

    if (
      TERMINAL_APPLICATION_STATUSES.includes(fromStatus as never) &&
      fromStatus !== 'DISBURSED'
    ) {
      throw new AppError(400, 'BAD_REQUEST', `Cannot transition from terminal status ${fromStatus}`);
    }

    const allowed = STATUS_TRANSITIONS[fromStatus] ?? [];
    if (allowed.length > 0 && !allowed.includes(toStatus)) {
      throw new AppError(400, 'BAD_REQUEST', `Invalid transition ${fromStatus} → ${toStatus}`);
    }
  },

  async transition(
    applicationId: string,
    toStatus: ApplicationStatus,
    ctx: RequestContext,
    reason?: string,
  ) {
    const application = await applicationRepository.findById(applicationId);
    if (!application) throw new NotFoundError('Application', applicationId);

    if (application.status === toStatus) return application;

    applicationWorkflowService.validateTransition(application.status, toStatus);

    await applicationStatusRepository.create({
      applicationId,
      fromStatus: application.status,
      toStatus,
      changedById: ctx.actorId,
      reason,
    });

    const updated = await applicationRepository.update(applicationId, {
      status: toStatus,
      updatedById: ctx.actorId,
      version: { increment: 1 },
      ...(toStatus === 'SUBMITTED' ? { submittedAt: new Date() } : {}),
      ...(toStatus === 'SANCTIONED' ? { approvedAt: new Date() } : {}),
      ...(toStatus === 'DISBURSED' ? { disbursedAt: new Date() } : {}),
    });

    await applicationTimelineService.addEvent(
      applicationId,
      'STATUS_CHANGE',
      `${application.status} → ${toStatus}`,
      ctx,
      reason,
    );

    await auditApplicationMutation(
      authAuditRepository.log,
      ctx,
      'APPLICATION_STATUS_CHANGED',
      'application',
      applicationId,
      { from: application.status, to: toStatus, reason },
    );

    await applicationWorkflowService.notifyStatusChange(updated, toStatus, ctx);

    await applicationWorkflowService.syncLinkedLeadStatus(
      updated,
      toStatus,
      application.status,
      ctx,
      reason,
    );

    const automationTrigger = STATUS_AUTOMATION_TRIGGER_MAP[toStatus];
    if (automationTrigger) {
      const customerRecord = await customerRepository.findById(updated.customerId);
      emitAutomationEvent({
        triggerType: automationTrigger,
        subjectType: 'application',
        subjectId: applicationId,
        userId: customerRecord?.userId ?? ctx.actorId,
        context: { fromStatus: application.status, toStatus, applicationNumber: updated.applicationNumber },
      });
    }

    return updated;
  },

  async onApplicationCreated(applicationId: string, leadId: string | null | undefined, ctx: RequestContext) {
    if (!leadId) return;

    const [lead, application] = await Promise.all([
      leadRepository.findById(leadId),
      applicationRepository.findById(applicationId),
    ]);
    if (!lead || !application) return;

    const wizard = (application.metadata as Record<string, unknown> | undefined)?.wizard as
      | Record<string, unknown>
      | undefined;
    const personal = wizard?.personal as Record<string, unknown> | undefined;
    const customerUser = application.customerId
      ? await prisma.user.findFirst({
          where: { customer: { id: application.customerId } },
          select: { phone: true, email: true },
        })
      : null;
    const normalizedPhone = String(personal?.phone ?? customerUser?.phone ?? '')
      .replace(/\D/g, '')
      .slice(-10);

    await leadRepository.update(leadId, {
      status: 'APPLICATION_CREATED',
      convertedAt: new Date(),
      requestedAmount: application.requestedAmount ?? lead.requestedAmount,
      ...(lead.prospectPhone && lead.prospectPhone.length >= 10
        ? {}
        : normalizedPhone.length >= 10
          ? { prospectPhone: normalizedPhone }
          : {}),
      ...(lead.prospectEmail
        ? {}
        : personal?.email
          ? { prospectEmail: String(personal.email) }
          : customerUser?.email
            ? { prospectEmail: customerUser.email }
            : {}),
      updatedById: ctx.actorId,
    });

    if (lead.status !== 'APPLICATION_CREATED') {
      await leadStatusHistoryRepository.create({
        leadId,
        fromStatus: lead.status,
        toStatus: 'APPLICATION_CREATED',
        changedById: ctx.actorId,
        reason: 'Customer started loan application',
      });
    }

    await auditApplicationMutation(authAuditRepository.log, ctx, 'LEAD_CONVERTED', 'lead', leadId, {
      applicationId,
    });
  },

  async syncLinkedLeadStatus(
    application: { id: string; leadId: string | null; status: ApplicationStatus },
    toStatus: ApplicationStatus,
    fromApplicationStatus: ApplicationStatus,
    ctx: RequestContext,
    reason?: string,
  ) {
    const leadStatus = LEAD_STATUS_BY_APPLICATION[toStatus];
    if (!leadStatus || !application.leadId) return;

    const lead = await leadRepository.findById(application.leadId);
    if (!lead || lead.deletedAt) return;
    if (lead.status === leadStatus) return;

    await leadRepository.update(application.leadId, {
      status: leadStatus,
      ...(leadStatus === 'DISBURSED' ? { convertedAt: lead.convertedAt ?? new Date() } : {}),
      updatedById: ctx.actorId,
    });

    await leadStatusHistoryRepository.create({
      leadId: application.leadId,
      fromStatus: lead.status,
      toStatus: leadStatus,
      changedById: ctx.actorId,
      reason: reason ?? LEAD_SYNC_REASON[toStatus] ?? `Application ${fromApplicationStatus} → ${toStatus}`,
    });

    await auditApplicationMutation(authAuditRepository.log, ctx, 'LEAD_STATUS_SYNCED', 'lead', application.leadId, {
      applicationId: application.id,
      applicationStatus: toStatus,
      leadStatus,
    });
  },

  async notifyStatusChange(
    application: { id: string; customerId: string; applicationNumber: string },
    toStatus: ApplicationStatus,
    ctx: RequestContext,
  ) {
    const eventType = STATUS_NOTIFICATION_MAP[toStatus];
    if (!eventType) return;

    const customerRecord = await customerRepository.findById(application.customerId);
    if (!customerRecord?.userId) return;

    try {
      await notificationDispatchService.dispatchMultiChannel({
        userId: customerRecord.userId,
        eventType,
        channels: ['IN_APP', 'EMAIL', 'SMS'],
        variables: {
          applicationNumber: application.applicationNumber,
          status: toStatus,
        },
        entityType: 'application',
        entityId: application.id,
      });
    } catch {
      await authAuditRepository.log({
        userId: ctx.actorId,
        action: 'NOTIFICATION_DISPATCH_FAILED',
        entityType: 'application',
        entityId: application.id,
        newValues: { eventType, status: toStatus },
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
        requestId: ctx.requestId,
      });
    }
  },
};
