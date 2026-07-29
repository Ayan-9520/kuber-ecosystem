import type { Prisma } from '@kuberone/database';

import { AppError } from '../../../shared/errors/app-error.js';
import { TDS_RATE, TDS_THRESHOLD_ANNUAL } from '../constants/commissions.constants.js';
import {
  commissionLedgerRepository,
  commissionPaymentRepository,
} from '../repositories/commission.repository.js';
import type { TdsBreakdown } from '../types/commissions.types.js';
import { roundMoney } from '../utils/commissions.utils.js';

export const commissionPayoutEngineService = {
  async calculateTds(partnerId: string, grossAmount: number): Promise<TdsBreakdown> {
    const fyStart = new Date();
    fyStart.setMonth(fyStart.getMonth() >= 3 ? 3 : -9, 1);
    fyStart.setHours(0, 0, 0, 0);
    if (fyStart.getMonth() === 3) fyStart.setFullYear(fyStart.getFullYear());

    const annualPayouts = await commissionPaymentRepository.list(
      { partnerId, deletedAt: null, status: 'RELEASED', createdAt: { gte: fyStart } },
      0,
      10000,
      { createdAt: 'asc' },
    );

    const totalReleasedThisFy = roundMoney(
      annualPayouts.reduce((sum, p) => sum + Number(p.totalAmount), 0),
    );

    const cumulativeAfterPayout = totalReleasedThisFy + grossAmount;

    if (cumulativeAfterPayout <= TDS_THRESHOLD_ANNUAL) {
      return {
        grossAmount,
        tdsAmount: 0,
        netAmount: grossAmount,
        tdsRate: 0,
        tdsApplicable: false,
        reason: `Cumulative FY payouts (₹${cumulativeAfterPayout}) below threshold of ₹${TDS_THRESHOLD_ANNUAL}`,
      };
    }

    const tdsAmount = roundMoney(grossAmount * TDS_RATE);
    return {
      grossAmount,
      tdsAmount,
      netAmount: roundMoney(grossAmount - tdsAmount),
      tdsRate: TDS_RATE,
      tdsApplicable: true,
      reason: `Section 194H — cumulative FY payouts (₹${cumulativeAfterPayout}) exceed ₹${TDS_THRESHOLD_ANNUAL}`,
    };
  },

  async validatePayoutLedgers(partnerId: string, ledgerIds: string[]) {
    const ledgers = await commissionLedgerRepository.list(
      {
        id: { in: ledgerIds },
        partnerId,
        deletedAt: null,
        status: 'APPROVED',
        entryType: 'CREDIT',
      },
      0,
      ledgerIds.length,
      { createdAt: 'asc' },
    );

    if (ledgers.length !== ledgerIds.length) {
      throw new AppError(400, 'INVALID_LEDGER_SELECTION', 'All ledger entries must be approved credit entries for the partner');
    }

    const totalAmount = roundMoney(ledgers.reduce((sum, l) => sum + Number(l.commissionAmount), 0));
    const tds = await commissionPayoutEngineService.calculateTds(partnerId, totalAmount);

    return { ledgers, totalAmount, tds };
  },

  buildPaymentItems(ledgers: Array<{ id: string; commissionAmount: unknown }>): Prisma.CommissionPaymentItemCreateWithoutPaymentInput[] {
    return ledgers.map((ledger) => ({
      ledger: { connect: { id: ledger.id } },
      amount: Number(ledger.commissionAmount),
    }));
  },

  async markLedgersPaid(ledgerIds: string[], actorId: string) {
    for (const ledgerId of ledgerIds) {
      await commissionLedgerRepository.update(ledgerId, {
        status: 'PAID',
        entryType: 'PAYMENT',
        updatedBy: { connect: { id: actorId } },
      });
    }
  },

  async getPayoutReport(partnerId: string, fromDate?: Date, toDate?: Date) {
    const where: Prisma.CommissionPaymentWhereInput = {
      partnerId,
      deletedAt: null,
      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    };

    const payments = await commissionPaymentRepository.list(where, 0, 500, { createdAt: 'desc' });
    const totalReleased = roundMoney(
      payments.filter((p) => p.status === 'RELEASED').reduce((sum, p) => sum + Number(p.totalAmount), 0),
    );
    const totalPending = roundMoney(
      payments.filter((p) => p.status === 'PENDING' || p.status === 'APPROVED').reduce((sum, p) => sum + Number(p.totalAmount), 0),
    );

    return {
      payments,
      summary: {
        totalPayments: payments.length,
        totalReleased,
        totalPending,
      },
    };
  },
};
