import type { Prisma } from '@kuberone/database';
import type {
  CreateCommissionAdjustmentInput,
  ListCommissionAdjustmentsQuery,
} from '@kuberone/shared-validation';

import { AppError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import {
  commissionAdjustmentRepository,
  commissionLedgerRepository,
} from '../repositories/commission.repository.js';
import type { RequestContext } from '../types/commissions.types.js';
import { auditCommissionMutation, buildPaginationMeta, generateAdjustmentNumber, generateLedgerNumber, roundMoney } from '../utils/commissions.utils.js';

export const commissionAdjustmentService = {
  async list(query: ListCommissionAdjustmentsQuery) {
    const where: Prisma.CommissionAdjustmentWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.partnerId ? { partnerId: query.partnerId } : {}),
      ...(query.ledgerId ? { ledgerId: query.ledgerId } : {}),
      ...(query.status ? { status: query.status as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      commissionAdjustmentRepository.list(where, skip, query.limit, orderBy),
      commissionAdjustmentRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await commissionAdjustmentRepository.findById(id);
    if (!item || item.deletedAt) throw new NotFoundError('CommissionAdjustment', id);
    return item;
  },

  async create(input: CreateCommissionAdjustmentInput, ctx: RequestContext) {
    const last = await commissionAdjustmentRepository.getLastAdjustmentNumber();
    const item = await commissionAdjustmentRepository.create({
      adjustmentNumber: generateAdjustmentNumber(last?.adjustmentNumber),
      partner: { connect: { id: input.partnerId } },
      ledger: input.ledgerId ? { connect: { id: input.ledgerId } } : undefined,
      entryType: 'ADJUSTMENT',
      amount: input.amount,
      status: 'PENDING',
      reason: input.reason,
      notes: input.notes,
      createdBy: { connect: { id: ctx.actorId } },
    });

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_ADJUSTMENT_CREATED', item.id, input);
    return item;
  },

  async approve(id: string, ctx: RequestContext) {
    const adjustment = await commissionAdjustmentService.getById(id);
    if (adjustment.status !== 'PENDING') {
      throw new AppError(400, 'ADJUSTMENT_NOT_PENDING', 'Adjustment is not pending');
    }

    const item = await commissionAdjustmentRepository.update(id, {
      status: 'APPLIED',
      appliedAt: new Date(),
      approvedBy: { connect: { id: ctx.actorId } },
    });

    const lastLedger = await commissionLedgerRepository.getLastLedgerNumber();
    await commissionLedgerRepository.create({
      ledgerNumber: generateLedgerNumber(lastLedger?.ledgerNumber),
      partner: { connect: { id: adjustment.partnerId } },
      commissionType: 'CROSS_SELL',
      entryType: 'ADJUSTMENT',
      status: 'ADJUSTED',
      baseAmount: 0,
      commissionAmount: roundMoney(Math.abs(Number(adjustment.amount))),
      currency: 'INR',
      notes: adjustment.reason,
      calculatedAt: new Date(),
      createdBy: { connect: { id: ctx.actorId } },
      updatedBy: { connect: { id: ctx.actorId } },
    });

    if (adjustment.ledgerId) {
      await commissionLedgerRepository.update(adjustment.ledgerId, {
        status: 'ADJUSTED',
        updatedBy: { connect: { id: ctx.actorId } },
      });
    }

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_ADJUSTMENT_APPLIED', id);
    return item;
  },

  async reject(id: string, ctx: RequestContext) {
    const adjustment = await commissionAdjustmentService.getById(id);
    if (adjustment.status !== 'PENDING') {
      throw new AppError(400, 'ADJUSTMENT_NOT_PENDING', 'Adjustment is not pending');
    }

    const item = await commissionAdjustmentRepository.update(id, {
      status: 'REJECTED',
      approvedBy: { connect: { id: ctx.actorId } },
    });

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_ADJUSTMENT_REJECTED', id);
    return item;
  },

  async remove(id: string, ctx: RequestContext) {
    await commissionAdjustmentService.getById(id);
    await commissionAdjustmentRepository.softDelete(id, ctx.actorId);
    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_ADJUSTMENT_DELETED', id);
    return { id, deleted: true };
  },
};
