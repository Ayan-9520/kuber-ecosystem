import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { prisma } from '../../../config/database.js';
import {
  MIN_PAYOUT_AMOUNT,
  PAYOUT_CUTOFF_DAY,
  PAYOUT_CYCLE_DAY,
  PAYOUT_CYCLE_PREFIX,
  DEFAULT_CURRENCY,
} from '../constants/commissions.constants.js';
import {
  commissionLedgerRepository,
  commissionPaymentRepository,
} from '../repositories/commission.repository.js';
import { generatePaymentNumber, roundMoney } from '../utils/commissions.utils.js';

import { commissionPayoutEngineService } from './commission-payout-engine.service.js';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CyclePartnerSummary {
  partnerId: string;
  partnerName: string;
  ledgerIds: string[];
  ledgerCount: number;
  grossAmount: number;
  tdsAmount: number;
  netAmount: number;
}

interface PayoutCycleSummary {
  cycleId: string;
  month: number;
  year: number;
  cycleStart: string;
  cycleEnd: string;
  partners: CyclePartnerSummary[];
  totalGross: number;
  totalTds: number;
  totalNet: number;
  status: 'PREVIEW' | 'GENERATED' | 'EXECUTED';
  executedAt?: string;
  executedBy?: string;
  paymentIds?: string[];
  createdAt: string;
}

// ─── File Store ──────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE_PATH = resolve(__dirname, '../../../../data/payout-cycles.json');

function readStore(): PayoutCycleSummary[] {
  try {
    const raw = readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw) as PayoutCycleSummary[];
  } catch {
    return [];
  }
}

function writeStore(cycles: PayoutCycleSummary[]): void {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(cycles, null, 2), 'utf-8');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the cutoff window for a given month/year cycle.
 * E.g. for July 2026 cycle: commissions approved between 5 Jun 2026 and 5 Jul 2026.
 */
function getCycleDateRange(month: number, year: number): { start: Date; end: Date } {
  const end = new Date(year, month - 1, PAYOUT_CUTOFF_DAY, 23, 59, 59, 999);

  const prevMonth = month - 1 === 0 ? 12 : month - 1;
  const prevYear = month - 1 === 0 ? year - 1 : year;
  const start = new Date(prevYear, prevMonth - 1, PAYOUT_CUTOFF_DAY, 0, 0, 0, 0);

  return { start, end };
}

function generateCycleId(month: number, year: number): string {
  const mm = String(month).padStart(2, '0');
  return `${PAYOUT_CYCLE_PREFIX}-${year}${mm}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const commissionPayoutCycleService = {
  /**
   * Generate a monthly payout cycle summary for the given month/year.
   * Groups approved ledger entries by partner, calculates TDS, and persists the cycle.
   */
  async generateMonthlyCycle(month: number, year: number): Promise<PayoutCycleSummary> {
    const { start, end } = getCycleDateRange(month, year);

    const ledgers = await commissionLedgerRepository.list(
      {
        deletedAt: null,
        status: 'APPROVED',
        entryType: 'CREDIT',
        approvedAt: { gte: start, lte: end },
      },
      0,
      50000,
      { createdAt: 'asc' },
    );

    const partnerMap = new Map<string, {
      partnerName: string;
      ledgerIds: string[];
      grossAmount: number;
    }>();

    for (const ledger of ledgers) {
      const pid = ledger.partnerId;
      const existing = partnerMap.get(pid);
      const amount = Number(ledger.commissionAmount);
      const name = (ledger as any).partner?.businessName ?? (ledger as any).partner?.contactName ?? pid;

      if (existing) {
        existing.ledgerIds.push(ledger.id);
        existing.grossAmount = roundMoney(existing.grossAmount + amount);
      } else {
        partnerMap.set(pid, { partnerName: name, ledgerIds: [ledger.id], grossAmount: amount });
      }
    }

    const partners: CyclePartnerSummary[] = [];
    for (const [partnerId, data] of partnerMap) {
      if (data.grossAmount < MIN_PAYOUT_AMOUNT) continue;

      const tds = await commissionPayoutEngineService.calculateTds(partnerId, data.grossAmount);
      partners.push({
        partnerId,
        partnerName: data.partnerName,
        ledgerIds: data.ledgerIds,
        ledgerCount: data.ledgerIds.length,
        grossAmount: data.grossAmount,
        tdsAmount: tds.tdsAmount,
        netAmount: tds.netAmount,
      });
    }

    const totalGross = roundMoney(partners.reduce((s, p) => s + p.grossAmount, 0));
    const totalTds = roundMoney(partners.reduce((s, p) => s + p.tdsAmount, 0));
    const totalNet = roundMoney(partners.reduce((s, p) => s + p.netAmount, 0));

    const cycle: PayoutCycleSummary = {
      cycleId: generateCycleId(month, year),
      month,
      year,
      cycleStart: start.toISOString(),
      cycleEnd: end.toISOString(),
      partners,
      totalGross,
      totalTds,
      totalNet,
      status: 'GENERATED',
      createdAt: new Date().toISOString(),
    };

    const store = readStore();
    store.push(cycle);
    writeStore(store);

    return cycle;
  },

  /**
   * Execute a generated cycle — create CommissionPayment records for each partner.
   */
  async executeCycle(cycleId: string, actorId: string): Promise<string[]> {
    const store = readStore();
    const cycle = store.find((c) => c.cycleId === cycleId);
    if (!cycle) throw new Error(`Payout cycle ${cycleId} not found`);
    if (cycle.status === 'EXECUTED') throw new Error(`Payout cycle ${cycleId} already executed`);

    const paymentIds: string[] = [];

    for (const partner of cycle.partners) {
      const { ledgers, tds } = await commissionPayoutEngineService.validatePayoutLedgers(
        partner.partnerId,
        partner.ledgerIds,
      );

      const last = await commissionPaymentRepository.getLastPaymentNumber();
      const payment = await commissionPaymentRepository.create({
        paymentNumber: generatePaymentNumber(last?.paymentNumber),
        partner: { connect: { id: partner.partnerId } },
        totalAmount: tds.netAmount,
        currency: DEFAULT_CURRENCY,
        status: 'PENDING',
        paymentMethod: 'BANK_TRANSFER',
        notes: `Monthly payout cycle ${cycleId} — ${cycle.month}/${cycle.year}`,
        items: { create: commissionPayoutEngineService.buildPaymentItems(ledgers) },
        createdBy: { connect: { id: actorId } },
      });

      paymentIds.push(payment.id);
    }

    cycle.status = 'EXECUTED';
    cycle.executedAt = new Date().toISOString();
    cycle.executedBy = actorId;
    cycle.paymentIds = paymentIds;
    writeStore(store);

    return paymentIds;
  },

  /**
   * Return past cycle summaries with pagination.
   */
  async getCycleHistory(page: number = 1, limit: number = 10) {
    const store = readStore();
    const sorted = store.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = sorted.length;
    const skip = (page - 1) * limit;
    const items = sorted.slice(skip, skip + limit);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  /**
   * Preview what the current month's cycle would look like if generated today.
   */
  async getCurrentCyclePreview(): Promise<PayoutCycleSummary> {
    const now = new Date();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    // If we're past the cutoff day, preview the next month's cycle
    if (now.getDate() > PAYOUT_CUTOFF_DAY) {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }

    const { start, end } = getCycleDateRange(month, year);

    const ledgers = await commissionLedgerRepository.list(
      {
        deletedAt: null,
        status: 'APPROVED',
        entryType: 'CREDIT',
        approvedAt: { gte: start, lte: end },
      },
      0,
      50000,
      { createdAt: 'asc' },
    );

    const partnerMap = new Map<string, {
      partnerName: string;
      ledgerIds: string[];
      grossAmount: number;
    }>();

    for (const ledger of ledgers) {
      const pid = ledger.partnerId;
      const existing = partnerMap.get(pid);
      const amount = Number(ledger.commissionAmount);
      const name = (ledger as any).partner?.businessName ?? (ledger as any).partner?.contactName ?? pid;

      if (existing) {
        existing.ledgerIds.push(ledger.id);
        existing.grossAmount = roundMoney(existing.grossAmount + amount);
      } else {
        partnerMap.set(pid, { partnerName: name, ledgerIds: [ledger.id], grossAmount: amount });
      }
    }

    const partners: CyclePartnerSummary[] = [];
    for (const [partnerId, data] of partnerMap) {
      if (data.grossAmount < MIN_PAYOUT_AMOUNT) continue;

      const tds = await commissionPayoutEngineService.calculateTds(partnerId, data.grossAmount);
      partners.push({
        partnerId,
        partnerName: data.partnerName,
        ledgerIds: data.ledgerIds,
        ledgerCount: data.ledgerIds.length,
        grossAmount: data.grossAmount,
        tdsAmount: tds.tdsAmount,
        netAmount: tds.netAmount,
      });
    }

    const totalGross = roundMoney(partners.reduce((s, p) => s + p.grossAmount, 0));
    const totalTds = roundMoney(partners.reduce((s, p) => s + p.tdsAmount, 0));
    const totalNet = roundMoney(partners.reduce((s, p) => s + p.netAmount, 0));

    return {
      cycleId: `PREVIEW-${year}${String(month).padStart(2, '0')}`,
      month,
      year,
      cycleStart: start.toISOString(),
      cycleEnd: end.toISOString(),
      partners,
      totalGross,
      totalTds,
      totalNet,
      status: 'PREVIEW',
      createdAt: new Date().toISOString(),
    };
  },
};
