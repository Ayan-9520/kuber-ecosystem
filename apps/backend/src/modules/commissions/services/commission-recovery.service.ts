import type { Prisma } from '@kuberone/database';
import type {
  CreateCommissionRecoveryInput,
  ListCommissionRecoveriesQuery,
} from '@kuberone/shared-validation';

import { AppError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import {
  commissionLedgerRepository,
  commissionRecoveryRepository,
} from '../repositories/commission.repository.js';
import type { RequestContext } from '../types/commissions.types.js';
import { auditCommissionMutation, buildPaginationMeta, generateLedgerNumber, generateRecoveryNumber } from '../utils/commissions.utils.js';

import { commissionLedgerService } from './commission-ledger.service.js';

export const commissionRecoveryService = {
  async list(query: ListCommissionRecoveriesQuery) {
    const where: Prisma.CommissionRecoveryWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.partnerId ? { partnerId: query.partnerId } : {}),
      ...(query.ledgerId ? { ledgerId: query.ledgerId } : {}),
      ...(query.status ? { status: query.status as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      commissionRecoveryRepository.list(where, skip, query.limit, orderBy),
      commissionRecoveryRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await commissionRecoveryRepository.findById(id);
    if (!item || item.deletedAt) throw new NotFoundError('CommissionRecovery', id);
    return item;
  },

  async create(input: CreateCommissionRecoveryInput, ctx: RequestContext) {
    const ledger = await commissionLedgerService.getById(input.ledgerId);
    if (ledger.partnerId !== input.partnerId) {
      throw new AppError(400, 'PARTNER_MISMATCH', 'Ledger does not belong to the partner');
    }
    if (Number(input.amount) > Number(ledger.commissionAmount)) {
      throw new AppError(400, 'RECOVERY_EXCEEDS_COMMISSION', 'Recovery amount exceeds commission amount');
    }

    const last = await commissionRecoveryRepository.getLastRecoveryNumber();
    const item = await commissionRecoveryRepository.create({
      recoveryNumber: generateRecoveryNumber(last?.recoveryNumber),
      partner: { connect: { id: input.partnerId } },
      ledger: { connect: { id: input.ledgerId } },
      amount: input.amount,
      status: 'PENDING',
      reason: input.reason,
      notes: input.notes,
      createdBy: { connect: { id: ctx.actorId } },
    });

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_RECOVERY_CREATED', item.id, input);
    return item;
  },

  async approve(id: string, ctx: RequestContext) {
    const recovery = await commissionRecoveryService.getById(id);
    if (recovery.status !== 'PENDING') {
      throw new AppError(400, 'RECOVERY_NOT_PENDING', 'Recovery is not pending');
    }

    const item = await commissionRecoveryRepository.update(id, {
      status: 'RECOVERED',
      recoveredAt: new Date(),
      approvedBy: { connect: { id: ctx.actorId } },
    });

    await commissionLedgerRepository.update(recovery.ledgerId, {
      status: 'RECOVERED',
      entryType: 'RECOVERY',
      updatedBy: { connect: { id: ctx.actorId } },
    });

    const lastLedger = await commissionLedgerRepository.getLastLedgerNumber();
    await commissionLedgerRepository.create({
      ledgerNumber: generateLedgerNumber(lastLedger?.ledgerNumber),
      partner: { connect: { id: recovery.partnerId } },
      commissionType: 'DISBURSEMENT',
      entryType: 'RECOVERY',
      status: 'RECOVERED',
      baseAmount: 0,
      commissionAmount: recovery.amount,
      currency: 'INR',
      notes: recovery.reason,
      calculatedAt: new Date(),
      createdBy: { connect: { id: ctx.actorId } },
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_RECOVERY_APPROVED', id);
    return item;
  },

  async reject(id: string, ctx: RequestContext) {
    const recovery = await commissionRecoveryService.getById(id);
    if (recovery.status !== 'PENDING') {
      throw new AppError(400, 'RECOVERY_NOT_PENDING', 'Recovery is not pending');
    }

    const item = await commissionRecoveryRepository.update(id, {
      status: 'REJECTED',
      approvedBy: { connect: { id: ctx.actorId } },
    });

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_RECOVERY_REJECTED', id);
    return item;
  },

  async remove(id: string, ctx: RequestContext) {
    await commissionRecoveryService.getById(id);
    await commissionRecoveryRepository.softDelete(id, ctx.actorId);
    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_RECOVERY_DELETED', id);
    return { id, deleted: true };
  },
};
