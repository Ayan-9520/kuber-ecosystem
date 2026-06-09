import type { Prisma } from '@kuberone/database';
import type {
  CreateSanctionInput,
  ListSanctionsQuery,
  UpdateSanctionInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import { sanctionRepository } from '../repositories/sanction.repository.js';
import type { RequestContext } from '../types/applications.types.js';
import { auditApplicationMutation, buildPaginationMeta, calculateEmi } from '../utils/applications.utils.js';

import { applicationTimelineService } from './application-timeline.service.js';
import { applicationWorkflowService } from './application-workflow.service.js';

export const sanctionService = {
  async list(query: ListSanctionsQuery) {
    const where: Prisma.SanctionWhereInput = {
      ...(query.applicationId ? { applicationId: query.applicationId } : {}),
      ...(query.lenderId ? { lenderId: query.lenderId } : {}),
      ...(query.status ? { status: query.status as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      sanctionRepository.list(where, skip, query.limit, orderBy),
      sanctionRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const sanction = await sanctionRepository.findById(id);
    if (!sanction) throw new NotFoundError('Sanction', id);
    return sanction;
  },

  async create(input: CreateSanctionInput, ctx: RequestContext) {
    const application = await applicationRepository.findById(input.applicationId);
    if (!application) throw new NotFoundError('Application', input.applicationId);

    const existing = await sanctionRepository.findByApplicationId(input.applicationId);
    if (existing) throw new ConflictError('Sanction already exists for application');

    const emi =
      input.emiAmount ??
      calculateEmi(input.sanctionAmount, input.interestRate, input.tenureMonths);

    const sanction = await sanctionRepository.create({
      applicationId: input.applicationId,
      lenderId: input.lenderId,
      sanctionAmount: input.sanctionAmount,
      tenureMonths: input.tenureMonths,
      interestRate: input.interestRate,
      processingFee: input.processingFee,
      emiAmount: emi,
      sanctionDate: input.sanctionDate,
      validityDate: input.validityDate,
      conditions: input.conditions,
      status: input.status as never,
      createdById: ctx.actorId,
    });

    await applicationWorkflowService.transition(input.applicationId, 'SANCTIONED', ctx, 'Sanction issued');

    await applicationRepository.update(input.applicationId, {
      approvedAmount: input.sanctionAmount,
      tenureMonths: input.tenureMonths,
      interestRate: input.interestRate,
      emiAmount: emi,
      selectedLenderId: input.lenderId,
      updatedById: ctx.actorId,
    });

    await applicationTimelineService.addEvent(
      input.applicationId,
      'SANCTION',
      `Sanctioned: ${input.sanctionAmount}`,
      ctx,
      input.conditions,
      { roi: input.interestRate, tenure: input.tenureMonths, emi },
    );

    await auditApplicationMutation(authAuditRepository.log, ctx, 'SANCTION_CREATED', 'sanction', sanction.id, input);
    return sanction;
  },

  async update(id: string, input: UpdateSanctionInput, ctx: RequestContext) {
    await sanctionService.getById(id);
    const sanction = await sanctionRepository.update(id, {
      ...input,
      status: input.status as never,
    });
    await auditApplicationMutation(authAuditRepository.log, ctx, 'SANCTION_UPDATED', 'sanction', id, input);
    return sanction;
  },
};
