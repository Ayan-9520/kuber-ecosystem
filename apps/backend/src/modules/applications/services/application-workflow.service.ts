import type { ApplicationStatus } from '@kuberone/database';

import { AppError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { customerRepository } from '../../customers/repositories/customer.repository.js';
import { leadRepository } from '../../leads/repositories/lead.repository.js';
import { notificationDispatchService } from '../../notifications/services/notification-dispatch.service.js';
import { STATUS_TRANSITIONS, TERMINAL_APPLICATION_STATUSES } from '../constants/applications.constants.js';
import { applicationStatusRepository } from '../repositories/application-status.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import type { RequestContext } from '../types/applications.types.js';
import { auditApplicationMutation } from '../utils/applications.utils.js';

import { applicationTimelineService } from './application-timeline.service.js';

const STATUS_NOTIFICATION_MAP: Partial<Record<ApplicationStatus, string>> = {
  SUBMITTED: 'APPLICATION_SUBMITTED',
  DOCUMENT_PENDING: 'DOCUMENT_REQUESTED',
  CREDIT_REVIEW: 'APPLICATION_SUBMITTED',
  SANCTIONED: 'SANCTION_ISSUED',
  DISBURSED: 'DISBURSEMENT_COMPLETED',
  REJECTED: 'DOCUMENT_REJECTED',
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

    return updated;
  },

  async onApplicationCreated(applicationId: string, leadId: string | null | undefined, ctx: RequestContext) {
    if (!leadId) return;

    const lead = await leadRepository.findById(leadId);
    if (!lead) return;

    await leadRepository.update(leadId, {
      status: 'APPLICATION_CREATED',
      convertedAt: new Date(),
      updatedById: ctx.actorId,
    });

    await auditApplicationMutation(authAuditRepository.log, ctx, 'LEAD_CONVERTED', 'lead', leadId, {
      applicationId,
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
