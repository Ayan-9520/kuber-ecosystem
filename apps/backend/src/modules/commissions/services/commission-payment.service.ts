import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  CreateCommissionPaymentInput,
  ListCommissionPaymentsQuery,
} from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { AppError, NotFoundError } from '../../../shared/errors/app-error.js';
import { razorpayPayoutProvider } from '../../../shared/providers/razorpay-payout.provider.js';
import { applyCommissionScope } from '../../../shared/utils/data-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { emailOrchestratorService } from '../../email/services/email-orchestrator.service.js';
import { smsOrchestratorService } from '../../sms/services/sms-orchestrator.service.js';
import { DEFAULT_CURRENCY } from '../constants/commissions.constants.js';
import { commissionPaymentRepository } from '../repositories/commission.repository.js';
import type { RequestContext } from '../types/commissions.types.js';
import { auditCommissionMutation, buildPaginationMeta, generatePaymentNumber } from '../utils/commissions.utils.js';

import { commissionPayoutEngineService } from './commission-payout-engine.service.js';

function paymentWhere(
  actor: AuthenticatedUser,
  query: ListCommissionPaymentsQuery,
): Prisma.CommissionPaymentWhereInput {
  const ledgerScope = applyCommissionScope(actor);

  return {
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
    // Scope through payment items so Partner/branch users cannot enumerate another
    // partner's payouts by changing partnerId in the query string.
    items: { some: { ledger: ledgerScope } },
  };
}

export const commissionPaymentService = {
  async list(actor: AuthenticatedUser, query: ListCommissionPaymentsQuery) {
    const where = paymentWhere(actor, query);
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

  async getByIdForActor(actor: AuthenticatedUser, id: string) {
    const item = await commissionPaymentRepository.findFirst({
      id,
      deletedAt: null,
      items: { some: { ledger: applyCommissionScope(actor) } },
    });
    if (!item) throw new NotFoundError('CommissionPayment', id);
    return item;
  },

  async createPayout(input: CreateCommissionPaymentInput, ctx: RequestContext) {
    const { ledgers, totalAmount, tds } = await commissionPayoutEngineService.validatePayoutLedgers(
      input.partnerId,
      input.ledgerIds,
    );

    const tdsNotes = tds.tdsApplicable
      ? `TDS @${tds.tdsRate * 100}%: ₹${tds.tdsAmount} deducted. Gross: ₹${tds.grossAmount}, Net: ₹${tds.netAmount}. ${tds.reason}`
      : `No TDS. ${tds.reason}`;
    const combinedNotes = input.notes ? `${input.notes}\n${tdsNotes}` : tdsNotes;

    const last = await commissionPaymentRepository.getLastPaymentNumber();
    const item = await commissionPaymentRepository.create({
      paymentNumber: generatePaymentNumber(last?.paymentNumber),
      partner: { connect: { id: input.partnerId } },
      totalAmount: tds.netAmount,
      currency: DEFAULT_CURRENCY,
      status: 'PENDING',
      paymentMethod: input.paymentMethod,
      bankAccountRef: input.bankAccountRef,
      notes: combinedNotes,
      items: { create: commissionPayoutEngineService.buildPaymentItems(ledgers) },
      createdBy: { connect: { id: ctx.actorId } },
    });

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_PAYOUT_CREATED', item.id, {
      totalAmount,
      tds,
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

    // Attempt Razorpay payout; fall back to manual transfer on failure
    let razorpayPayoutId: string | undefined;
    let releaseNotes = notes ?? payment.notes;
    try {
      const partnerDetail = await prisma.partner.findUnique({
        where: { id: payment.partnerId },
        select: { contactName: true, email: true, phone: true },
      });
      const contact = await razorpayPayoutProvider.createContact(
        partnerDetail?.contactName ?? 'Partner',
        partnerDetail?.email ?? '',
        partnerDetail?.phone ?? '',
        'vendor',
      );

      const bankRef = payment.bankAccountRef as string | undefined;
      const [accNum = '', ifsc = '', bankName = ''] = bankRef?.split('|') ?? [];

      const fundAccount = await razorpayPayoutProvider.createFundAccount(
        contact.id,
        bankName || 'Bank',
        accNum,
        ifsc,
      );

      const payout = await razorpayPayoutProvider.createPayout(
        fundAccount.id,
        Number(payment.totalAmount),
        payment.currency,
        `Commission payout ${payment.paymentNumber}`,
        payment.id,
      );

      razorpayPayoutId = payout.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[CommissionPayment] Razorpay payout failed, marking for manual transfer:', message);
      releaseNotes = [releaseNotes, `[AUTO] Razorpay payout failed — manual transfer needed: ${message}`]
        .filter(Boolean)
        .join('\n');
    }

    const item = await commissionPaymentRepository.update(id, {
      status: 'RELEASED',
      paymentReference: razorpayPayoutId ?? paymentReference,
      notes: releaseNotes,
      releasedAt: new Date(),
      releasedBy: { connect: { id: ctx.actorId } },
    });

    const ledgerIds = payment.items.map((i) => i.ledgerId);
    await commissionPayoutEngineService.markLedgersPaid(ledgerIds, ctx.actorId);

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_PAYOUT_RELEASED', id, {
      paymentReference: razorpayPayoutId ?? paymentReference,
    });

    // Fire-and-forget payout release notifications
    try {
      const partner = await prisma.partner.findUnique({
        where: { id: payment.partnerId },
        select: { phone: true, email: true, contactName: true, userId: true },
      });

      if (partner) {
        const amount = Number(item.totalAmount);
        const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
        const utr = razorpayPayoutId ?? paymentReference;
        const smsBody = `Your commission payout of ${formattedAmount} has been released. Ref: ${utr}. Payment: ${item.paymentNumber}`;
        const emailSubject = `Commission Payout Released — ${item.paymentNumber}`;
        const emailBody = [
          `Dear ${partner.contactName},`,
          '',
          `Your commission payout of ${formattedAmount} has been released.`,
          '',
          `Payment Number: ${item.paymentNumber}`,
          `Amount: ${formattedAmount}`,
          `Reference (UTR): ${utr}`,
          '',
          'Thank you,',
          'KuberOne Finance',
        ].join('\n');

        const notificationPromises: Promise<unknown>[] = [];

        if (partner.phone) {
          notificationPromises.push(
            smsOrchestratorService.send({
              toPhone: partner.phone,
              userId: partner.userId,
              body: smsBody,
              eventType: 'COMMISSION_PAYOUT_RELEASED',
              category: 'TRANSACTIONAL',
            }).catch((err) => {
              console.error('[CommissionPayment] SMS notification failed:', err instanceof Error ? err.message : err);
            }),
          );
        }

        if (partner.email) {
          notificationPromises.push(
            emailOrchestratorService.send({
              toEmail: partner.email,
              userId: partner.userId,
              subject: emailSubject,
              body: emailBody,
              eventType: 'COMMISSION_PAYOUT_RELEASED',
              category: 'TRANSACTIONAL',
            }).catch((err) => {
              console.error('[CommissionPayment] Email notification failed:', err instanceof Error ? err.message : err);
            }),
          );
        }

        await Promise.allSettled(notificationPromises);
      }
    } catch (err) {
      console.error('[CommissionPayment] Payout notification error:', err instanceof Error ? err.message : err);
    }

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
