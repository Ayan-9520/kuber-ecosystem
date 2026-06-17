import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  CalculateCommissionInput,
  ExportCommissionLedgerQuery,
  ListCommissionLedgerQuery,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { applyCommissionScope } from '../../../shared/utils/data-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { DEFAULT_CURRENCY } from '../constants/commissions.constants.js';
import { commissionLedgerRepository } from '../repositories/commission.repository.js';
import type { RequestContext } from '../types/commissions.types.js';
import {
  auditCommissionMutation,
  buildPaginationMeta,
  generateLedgerNumber,
  ledgerToCsv,
} from '../utils/commissions.utils.js';

import { commissionCalculationEngineService } from './commission-calculation-engine.service.js';

function buildLedgerWhere(query: ListCommissionLedgerQuery | ExportCommissionLedgerQuery): Prisma.CommissionLedgerWhereInput {
  return {
    ...(query.includeDeleted ? {} : { deletedAt: null }),
    ...(query.partnerId ? { partnerId: query.partnerId } : {}),
    ...(query.commissionType ? { commissionType: query.commissionType as never } : {}),
    ...(query.entryType ? { entryType: query.entryType as never } : {}),
    ...(query.status ? { status: query.status as never } : {}),
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.productId ? { productId: query.productId } : {}),
    ...(query.lenderId ? { lenderId: query.lenderId } : {}),
    ...(query.leadId ? { leadId: query.leadId } : {}),
    ...(query.applicationId ? { applicationId: query.applicationId } : {}),
    ...(query.search
      ? {
          OR: [{ ledgerNumber: { contains: query.search } }, { notes: { contains: query.search } }],
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

export const commissionLedgerService = {
  async list(actor: AuthenticatedUser, query: ListCommissionLedgerQuery) {
    const where = applyCommissionScope(actor, buildLedgerWhere(query));
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      commissionLedgerRepository.list(where, skip, query.limit, orderBy),
      commissionLedgerRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async exportCsv(actor: AuthenticatedUser, query: ExportCommissionLedgerQuery) {
    const items = await commissionLedgerRepository.list(
      applyCommissionScope(actor, buildLedgerWhere(query)),
      0,
      10000,
      { createdAt: 'desc' },
    );
    return ledgerToCsv(items);
  },

  async getById(id: string) {
    const item = await commissionLedgerRepository.findById(id);
    if (!item || item.deletedAt) throw new NotFoundError('CommissionLedger', id);
    return item;
  },

  async calculate(input: CalculateCommissionInput, ctx: RequestContext) {
    const result = await commissionCalculationEngineService.calculate(input);

    const last = await commissionLedgerRepository.getLastLedgerNumber();
    const item = await commissionLedgerRepository.create({
      ledgerNumber: generateLedgerNumber(last?.ledgerNumber),
      partner: { connect: { id: input.partnerId } },
      commissionType: input.commissionType as never,
      entryType: 'CREDIT',
      status: result.commissionAmount > 0 ? 'CALCULATED' : 'PENDING',
      baseAmount: input.baseAmount,
      commissionAmount: result.commissionAmount,
      currency: DEFAULT_CURRENCY,
      rule: result.ruleId ? { connect: { id: result.ruleId } } : undefined,
      lead: input.leadId ? { connect: { id: input.leadId } } : undefined,
      application: input.applicationId ? { connect: { id: input.applicationId } } : undefined,
      referral: input.referralId ? { connect: { id: input.referralId } } : undefined,
      branch: input.branchId ? { connect: { id: input.branchId } } : undefined,
      product: input.productId ? { connect: { id: input.productId } } : undefined,
      lender: input.lenderId ? { connect: { id: input.lenderId } } : undefined,
      campaign: input.campaignId ? { connect: { id: input.campaignId } } : undefined,
      calculationMethod: result.calculationMethod as never,
      calculationDetails: result.calculationDetails as Prisma.InputJsonValue,
      notes: input.notes,
      calculatedAt: new Date(),
      createdBy: { connect: { id: ctx.actorId } },
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_CALCULATED', item.id, {
      amount: result.commissionAmount,
    });

    return item;
  },

  async remove(id: string, ctx: RequestContext) {
    await commissionLedgerService.getById(id);
    await commissionLedgerRepository.softDelete(id, ctx.actorId);
    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_LEDGER_DELETED', id);
    return { id, deleted: true };
  },
};
