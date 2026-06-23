import type { Prisma } from '@kuberone/database';
import type {
  CreateBankLoginInput,
  ListBankLoginsQuery,
  UpdateBankLoginInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import { bankLoginRepository } from '../repositories/bank-login.repository.js';
import type { RequestContext } from '../types/applications.types.js';
import { auditApplicationMutation, buildPaginationMeta } from '../utils/applications.utils.js';

import { resolveEmployeeIdForActor } from '../utils/employee-resolver.util.js';

import { applicationTimelineService } from './application-timeline.service.js';
import { applicationService } from './application.service.js';

export const bankLoginService = {
  async list(query: ListBankLoginsQuery) {
    const where: Prisma.BankLoginWhereInput = {
      ...(query.applicationId ? { applicationId: query.applicationId } : {}),
      ...(query.lenderId ? { lenderId: query.lenderId } : {}),
      ...(query.status ? { status: query.status as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      bankLoginRepository.list(where, skip, query.limit, orderBy),
      bankLoginRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const login = await bankLoginRepository.findById(id);
    if (!login) throw new NotFoundError('BankLogin', id);
    return login;
  },

  async create(input: CreateBankLoginInput, ctx: RequestContext) {
    const application = await applicationRepository.findById(input.applicationId);
    if (!application) throw new NotFoundError('Application', input.applicationId);
    const employeeId = await resolveEmployeeIdForActor(ctx.actorId);

    const login = await bankLoginRepository.create({
      applicationId: input.applicationId,
      lenderId: input.lenderId,
      loginReference: input.loginReference,
      loginDate: input.loginDate,
      submittedById: employeeId,
      status: input.status as never,
      notes: input.notes,
    });

    await applicationRepository.update(input.applicationId, {
      selectedLenderId: input.lenderId,
      updatedById: ctx.actorId,
    });

    await applicationService.transitionStatus(
      input.applicationId,
      'BANK_LOGIN',
      ctx,
      'Bank login recorded',
    );

    await applicationTimelineService.addEvent(
      input.applicationId,
      'BANK_UPDATE',
      'Bank login submitted',
      ctx,
      input.notes,
      { lenderId: input.lenderId, status: input.status },
    );

    await auditApplicationMutation(authAuditRepository.log, ctx, 'BANK_LOGIN_CREATED', 'bank_login', login.id, input);
    return login;
  },

  async update(id: string, input: UpdateBankLoginInput, ctx: RequestContext) {
    const existing = await bankLoginService.getById(id);
    const login = await bankLoginRepository.update(id, {
      ...input,
      status: input.status as never,
      acknowledgmentAt: input.acknowledgmentReceived ? new Date() : undefined,
    });

    if (input.status) {
      await applicationTimelineService.addEvent(
        existing.applicationId,
        'BANK_UPDATE',
        `Bank login status: ${input.status}`,
        ctx,
        input.notes ?? undefined,
      );
    }

    await auditApplicationMutation(authAuditRepository.log, ctx, 'BANK_LOGIN_UPDATED', 'bank_login', id, input);
    return login;
  },
};
