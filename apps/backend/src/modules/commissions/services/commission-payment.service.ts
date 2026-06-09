import type {
  CreateCommissionPaymentInput,
  ListCommissionPaymentsQuery,
} from '@kuberone/shared-validation';

import { AppError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { DEFAULT_CURRENCY } from '../constants/commissions.constants.js';
import { commissionPaymentRepository } from '../repositories/commission.repository.js';
import type { RequestContext } from '../types/commissions.types.js';
import { auditCommissionMutation, buildPaginationMeta, generatePaymentNumber } from '../utils/commissions.utils.js';

import { commissionPayoutEngineService } from './commission-payout-engine.service.js';

export const commissionPaymentService = {
  async list(query: ListCommissionPaymentsQuery) {
    const where = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.partnerId ? { partnerId: query.partnerId } : {}),
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.fromDate || query.toDate
        ? {
            createdAt: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      commissionPaymentRepository.list(where, skip, query.limit, orderBy),
      commissionPaymentRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await commissionPaymentRepository.findById(id);
    if (!item || item.deletedAt) throw new NotFoundError('CommissionPayment', id);
    return item;
  },

  async createPayout(input: CreateCommissionPaymentInput, ctx: RequestContext) {
    const { ledgers, totalAmount } = await commissionPayoutEngineService.validatePayoutLedgers(
      input.partnerId,
      input.ledgerIds,
    );

    const last = await commissionPaymentRepository.getLastPaymentNumber();
    const item = await commissionPaymentRepository.create({
      paymentNumber: generatePaymentNumber(last?.paymentNumber),
      partner: { connect: { id: input.partnerId } },
      totalAmount,
      currency: DEFAULT_CURRENCY,
      status: 'PENDING',
      paymentMethod: input.paymentMethod,
      bankAccountRef: input.bankAccountRef,
      notes: input.notes,
      items: { create: commissionPayoutEngineService.buildPaymentItems(ledgers) },
      createdBy: { connect: { id: ctx.actorId } },
    });

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_PAYOUT_CREATED', item.id, {
      totalAmount,
      ledgerCount: ledgers.length,
    });

    return item;
  },

  async approve(id: string, ctx: RequestContext) {
    const payment = await commissionPaymentService.getById(id);
    if (payment.status !== 'PENDING') {
      throw new AppError(400, 'PAYMENT_NOT_PENDING', 'Payment is not pending approval');
    }

    const item = await commissionPaymentRepository.update(id, {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: { connect: { id: ctx.actorId } },
    });

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_PAYOUT_APPROVED', id);
    return item;
  },

  async release(id: string, paymentReference: string, notes: string | undefined, ctx: RequestContext) {
    const payment = await commissionPaymentService.getById(id);
    if (payment.status !== 'APPROVED') {
      throw new AppError(400, 'PAYMENT_NOT_APPROVED', 'Payment must be approved before release');
    }

    const item = await commissionPaymentRepository.update(id, {
      status: 'RELEASED',
      paymentReference,
      notes: notes ?? payment.notes,
      releasedAt: new Date(),
      releasedBy: { connect: { id: ctx.actorId } },
    });

    const ledgerIds = payment.items.map((i) => i.ledgerId);
    await commissionPayoutEngineService.markLedgersPaid(ledgerIds, ctx.actorId);

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_PAYOUT_RELEASED', id, {
      paymentReference,
    });

    return item;
  },

  async getReport(partnerId: string, fromDate?: Date, toDate?: Date) {
    return commissionPayoutEngineService.getPayoutReport(partnerId, fromDate, toDate);
  },

  async remove(id: string, ctx: RequestContext) {
    const payment = await commissionPaymentService.getById(id);
    if (payment.status === 'RELEASED') {
      throw new AppError(400, 'PAYMENT_RELEASED', 'Released payments cannot be deleted');
    }
    await commissionPaymentRepository.softDelete(id, ctx.actorId);
    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_PAYOUT_DELETED', id);
    return { id, deleted: true };
  },
};
