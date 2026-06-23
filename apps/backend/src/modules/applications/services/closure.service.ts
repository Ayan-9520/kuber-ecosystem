import type { CreateClosureInput } from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import { closureRepository } from '../repositories/closure.repository.js';
import type { RequestContext } from '../types/applications.types.js';
import { auditApplicationMutation } from '../utils/applications.utils.js';

import { applicationTimelineService } from './application-timeline.service.js';
import { applicationWorkflowService } from './application-workflow.service.js';

export const closureService = {
  async getByApplicationId(applicationId: string) {
    const closure = await closureRepository.findByApplicationId(applicationId);
    if (!closure) throw new NotFoundError('Closure', applicationId);
    return closure;
  },

  async create(input: CreateClosureInput, ctx: RequestContext) {
    const application = await applicationRepository.findById(input.applicationId);
    if (!application) throw new NotFoundError('Application', input.applicationId);

    const existing = await closureRepository.findByApplicationId(input.applicationId);
    if (existing) throw new ConflictError('Closure already exists for application');

    const closure = await closureRepository.create({
      applicationId: input.applicationId,
      closureType: input.closureType as never,
      closureDate: input.closureDate,
      closureReason: input.closureReason,
      rmAssignedId: input.rmAssignedId,
      archivedAt: new Date(),
      createdById: ctx.actorId,
    });

    if (application.status !== 'CLOSED') {
      await applicationWorkflowService.transition(
        input.applicationId,
        'CLOSED',
        ctx,
        input.closureReason,
      );
    }

    await applicationTimelineService.addEvent(
      input.applicationId,
      'CLOSURE',
      `Closed: ${input.closureType}`,
      ctx,
      input.closureReason,
    );

    await auditApplicationMutation(authAuditRepository.log, ctx, 'CLOSURE_CREATED', 'closure', closure.id, input);
    return closure;
  },
};
