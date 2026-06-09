import type { Prisma } from '@kuberone/database';
import type {
  CreateDisbursementInput,
  ListDisbursementsQuery,
  UpdateDisbursementInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import { disbursementRepository } from '../repositories/disbursement.repository.js';
import type { RequestContext } from '../types/applications.types.js';
import { auditApplicationMutation, buildPaginationMeta } from '../utils/applications.utils.js';

import { applicationTimelineService } from './application-timeline.service.js';
import { applicationWorkflowService } from './application-workflow.service.js';
import { closureService } from './closure.service.js';

export const disbursementService = {
  async list(query: ListDisbursementsQuery) {
    const where: Prisma.DisbursementWhereInput = {
      ...(query.applicationId ? { applicationId: query.applicationId } : {}),
      ...(query.lenderId ? { lenderId: query.lenderId } : {}),
      ...(query.status ? { status: query.status as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      disbursementRepository.list(where, skip, query.limit, orderBy),
      disbursementRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const disbursement = await disbursementRepository.findById(id);
    if (!disbursement) throw new NotFoundError('Disbursement', id);
    return disbursement;
  },

  async create(input: CreateDisbursementInput, ctx: RequestContext) {
    const application = await applicationRepository.findById(input.applicationId);
    if (!application) throw new NotFoundError('Application', input.applicationId);

    const disbursement = await disbursementRepository.create({
      applicationId: input.applicationId,
      lenderId: input.lenderId,
      disbursementAmount: input.disbursementAmount,
      disbursementDate: input.disbursementDate,
      bankReference: input.bankReference,
      disbursementMode: input.disbursementMode as never,
      trancheNumber: input.trancheNumber,
      status: input.status as never,
      createdById: ctx.actorId,
    });

    if (input.status === 'COMPLETED') {
      await applicationWorkflowService.transition(
        input.applicationId,
        'DISBURSED',
        ctx,
        'Disbursement completed',
      );

      await closureService.create(
        {
          applicationId: input.applicationId,
          closureType: 'DISBURSED_COMPLETE',
          closureDate: input.disbursementDate,
          closureReason: 'Disbursement completed',
        },
        ctx,
      );
    }

    await applicationTimelineService.addEvent(
      input.applicationId,
      'DISBURSEMENT',
      `Disbursement: ${input.disbursementAmount}`,
      ctx,
      input.bankReference,
      { status: input.status, mode: input.disbursementMode },
    );

    await auditApplicationMutation(
      authAuditRepository.log,
      ctx,
      'DISBURSEMENT_CREATED',
      'disbursement',
      disbursement.id,
      input,
    );
    return disbursement;
  },

  async update(id: string, input: UpdateDisbursementInput, ctx: RequestContext) {
    const existing = await disbursementService.getById(id);
    const disbursement = await disbursementRepository.update(id, {
      ...input,
      status: input.status as never,
      disbursementMode: input.disbursementMode as never,
    });

    if (input.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      await applicationWorkflowService.transition(existing.applicationId, 'DISBURSED', ctx, 'Disbursement completed');
    }

    await auditApplicationMutation(authAuditRepository.log, ctx, 'DISBURSEMENT_UPDATED', 'disbursement', id, input);
    return disbursement;
  },
};
