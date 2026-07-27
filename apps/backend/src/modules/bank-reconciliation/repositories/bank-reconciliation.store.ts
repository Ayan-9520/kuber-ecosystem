import { randomUUID } from 'node:crypto';

import { classifyVariance, roundMoney } from '../services/matching.engine.js';
import type {
  BankCommissionStatement,
  ReconciliationAuditEvent,
  ReconciliationDispute,
  ReconciliationMatch,
  StatementLineItem,
} from '../types/bank-reconciliation.types.js';

const statements = new Map<string, BankCommissionStatement>();
const lines = new Map<string, StatementLineItem>();
const matches = new Map<string, ReconciliationMatch>();
const disputes = new Map<string, ReconciliationDispute>();
const auditEvents: ReconciliationAuditEvent[] = [];

let seeded = false;

/** Valid UUID hex only — never use letters outside a–f. */
const IDS = {
  stmtHdfc: 'b1000000-0000-4000-8000-000000000001',
  stmtIcici: 'b1000000-0000-4000-8000-000000000002',
  lineH1: 'b2000000-0000-4000-8000-000000000001',
  lineH2: 'b2000000-0000-4000-8000-000000000002',
  lineH3: 'b2000000-0000-4000-8000-000000000003',
  lineH4: 'b2000000-0000-4000-8000-000000000004',
  lineI1: 'b2000000-0000-4000-8000-000000000011',
  lineI2: 'b2000000-0000-4000-8000-000000000012',
  lineI3: 'b2000000-0000-4000-8000-000000000013',
  lineI4: 'b2000000-0000-4000-8000-000000000014',
  matchH1: 'b3000000-0000-4000-8000-000000000001',
  matchH2: 'b3000000-0000-4000-8000-000000000002',
  matchH3: 'b3000000-0000-4000-8000-000000000003',
  matchH4: 'b3000000-0000-4000-8000-000000000004',
  matchI1: 'b3000000-0000-4000-8000-000000000011',
  matchI2: 'b3000000-0000-4000-8000-000000000012',
  matchI3: 'b3000000-0000-4000-8000-000000000013',
  matchI4: 'b3000000-0000-4000-8000-000000000014',
  dispute1: 'b4000000-0000-4000-8000-000000000001',
  audit1: 'b5000000-0000-4000-8000-000000000001',
  case1: 'c1000000-0000-4000-8000-000000000001',
  case2: 'c1000000-0000-4000-8000-000000000002',
  case3: 'c1000000-0000-4000-8000-000000000003',
} as const;

function daysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function makeMatch(partial: ReconciliationMatch): ReconciliationMatch {
  return {
    ...partial,
    expectedCommission: roundMoney(partial.expectedCommission),
    receivedCommission: roundMoney(partial.receivedCommission),
    variance: roundMoney(partial.variance),
  };
}

export function seedBankReconciliation(): void {
  if (seeded) return;
  seeded = true;

  const hdfc: BankCommissionStatement = {
    id: IDS.stmtHdfc,
    bankName: 'HDFC Bank',
    statementPeriod: { month: '2026-07', year: 2026, from: '2026-07-01', to: '2026-07-31' },
    uploadedBy: 'finance@kuberone.com',
    uploadedAt: daysAgo(3),
    fileName: 'hdfc-commission-jul-2026.csv',
    totalRows: 4,
    totalAmount: 0,
    status: 'RECONCILED',
  };

  const hdfcLines: StatementLineItem[] = [
    {
      id: IDS.lineH1,
      statementId: IDS.stmtHdfc,
      bankReference: 'HDFC-UTR-77001',
      loanAccountNumber: null,
      applicationNumber: 'HDFC-HL-982341',
      customerName: 'Suresh Mehta',
      pan: 'ABCDE1234F',
      disbursedAmount: 6500000,
      commissionAmount: 34000,
      gstAmount: 6120,
      tdsAmount: 1700,
      netAmount: 38420,
      payoutDate: '2026-07-10',
      rawPayload: { seed: 'exact' },
    },
    {
      id: IDS.lineH2,
      statementId: IDS.stmtHdfc,
      bankReference: 'HDFC-UTR-77002',
      loanAccountNumber: null,
      applicationNumber: null,
      customerName: 'Neha Kulkrni',
      pan: null,
      disbursedAmount: 4500000,
      commissionAmount: 24800,
      gstAmount: 4464,
      tdsAmount: 1240,
      netAmount: 28024,
      payoutDate: '2026-07-12',
      rawPayload: { seed: 'probable' },
    },
    {
      id: IDS.lineH3,
      statementId: IDS.stmtHdfc,
      bankReference: 'HDFC-UTR-77003',
      loanAccountNumber: null,
      applicationNumber: 'HDFC-HL-982341',
      customerName: 'Suresh Mehta',
      pan: 'ABCDE1234F',
      disbursedAmount: 6500000,
      commissionAmount: 28000,
      gstAmount: 5040,
      tdsAmount: 1400,
      netAmount: 31640,
      payoutDate: '2026-07-14',
      rawPayload: { seed: 'short' },
    },
    {
      id: IDS.lineH4,
      statementId: IDS.stmtHdfc,
      bankReference: 'HDFC-UTR-77999',
      loanAccountNumber: 'UNKNOWN-LAN-999',
      applicationNumber: 'APP-UNKNOWN-999',
      customerName: 'Unknown Payer',
      pan: 'ZZZZZ9999Z',
      disbursedAmount: 500000,
      commissionAmount: 12000,
      gstAmount: 2160,
      tdsAmount: 600,
      netAmount: 13560,
      payoutDate: '2026-07-18',
      rawPayload: { seed: 'unmatched' },
    },
  ];

  hdfc.totalAmount = roundMoney(hdfcLines.reduce((s, l) => s + l.commissionAmount, 0));

  const icici: BankCommissionStatement = {
    id: IDS.stmtIcici,
    bankName: 'ICICI Bank',
    statementPeriod: { month: '2026-07', year: 2026, from: '2026-07-01', to: '2026-07-31' },
    uploadedBy: 'finance@kuberone.com',
    uploadedAt: daysAgo(2),
    fileName: 'icici-commission-jul-2026.csv',
    totalRows: 4,
    totalAmount: 0,
    status: 'RECONCILED',
  };

  const iciciLines: StatementLineItem[] = [
    {
      id: IDS.lineI1,
      statementId: IDS.stmtIcici,
      bankReference: 'ICICI-UTR-88001',
      loanAccountNumber: 'ICIC0007788123',
      applicationNumber: 'ICICI-BL-77321',
      customerName: 'Arjun Reddy',
      pan: 'XYZAB9012C',
      disbursedAmount: 8000000,
      commissionAmount: 38000,
      gstAmount: 6840,
      tdsAmount: 1900,
      netAmount: 42940,
      payoutDate: '2026-07-08',
      rawPayload: { seed: 'exact' },
    },
    {
      id: IDS.lineI2,
      statementId: IDS.stmtIcici,
      bankReference: 'ICICI-UTR-88002',
      loanAccountNumber: null,
      applicationNumber: null,
      customerName: 'Arjun Reddy',
      pan: 'XYZAB9012C',
      disbursedAmount: 7950000,
      commissionAmount: 38000,
      gstAmount: 6840,
      tdsAmount: 1900,
      netAmount: 42940,
      payoutDate: '2026-07-09',
      rawPayload: { seed: 'probable-pan' },
    },
    {
      id: IDS.lineI3,
      statementId: IDS.stmtIcici,
      bankReference: 'ICICI-UTR-88003',
      loanAccountNumber: 'ICIC0007788123',
      applicationNumber: 'ICICI-BL-77321',
      customerName: 'Arjun Reddy',
      pan: 'XYZAB9012C',
      disbursedAmount: 8000000,
      commissionAmount: 42000,
      gstAmount: 7560,
      tdsAmount: 2100,
      netAmount: 47460,
      payoutDate: '2026-07-11',
      rawPayload: { seed: 'excess' },
    },
    {
      id: IDS.lineI4,
      statementId: IDS.stmtIcici,
      bankReference: 'ICICI-UTR-88999',
      loanAccountNumber: null,
      applicationNumber: null,
      customerName: 'Ghost Customer',
      pan: null,
      disbursedAmount: 250000,
      commissionAmount: 8000,
      gstAmount: 1440,
      tdsAmount: 400,
      netAmount: 9040,
      payoutDate: '2026-07-15',
      rawPayload: { seed: 'unmatched' },
    },
  ];

  icici.totalAmount = roundMoney(iciciLines.reduce((s, l) => s + l.commissionAmount, 0));

  statements.set(hdfc.id, hdfc);
  statements.set(icici.id, icici);
  for (const l of [...hdfcLines, ...iciciLines]) lines.set(l.id, l);

  const expectedCase1 = 34000;
  const expectedCase2 = 24800;
  const expectedCase3 = 38000;

  const seedMatches: ReconciliationMatch[] = [
    makeMatch({
      id: IDS.matchH1,
      statementLineId: IDS.lineH1,
      statementId: IDS.stmtHdfc,
      bankName: 'HDFC Bank',
      matchedCaseId: IDS.case1,
      caseNumber: 'KF-2026-000001',
      matchType: 'EXACT',
      matchScore: 95,
      expectedCommission: expectedCase1,
      receivedCommission: 34000,
      variance: 0,
      varianceType: 'MATCHED',
      status: 'ACCEPTED',
      reviewedBy: 'finance@kuberone.com',
      reviewedAt: daysAgo(2),
      notes: 'Exact application number match',
    }),
    makeMatch({
      id: IDS.matchH2,
      statementLineId: IDS.lineH2,
      statementId: IDS.stmtHdfc,
      bankName: 'HDFC Bank',
      matchedCaseId: IDS.case2,
      caseNumber: 'KF-2026-000002',
      matchType: 'PROBABLE',
      matchScore: 72,
      expectedCommission: expectedCase2,
      receivedCommission: 24800,
      variance: 0,
      varianceType: 'MATCHED',
      status: 'PENDING_REVIEW',
      reviewedBy: null,
      reviewedAt: null,
      notes: 'Fuzzy customer name + amount',
    }),
    makeMatch({
      id: IDS.matchH3,
      statementLineId: IDS.lineH3,
      statementId: IDS.stmtHdfc,
      bankName: 'HDFC Bank',
      matchedCaseId: IDS.case1,
      caseNumber: 'KF-2026-000001',
      matchType: 'EXACT',
      matchScore: 95,
      expectedCommission: expectedCase1,
      receivedCommission: 28000,
      variance: roundMoney(28000 - expectedCase1),
      varianceType: classifyVariance(28000, expectedCase1),
      status: 'DISPUTED',
      reviewedBy: 'finance@kuberone.com',
      reviewedAt: daysAgo(1),
      notes: 'Short payment vs expected commission',
    }),
    makeMatch({
      id: IDS.matchH4,
      statementLineId: IDS.lineH4,
      statementId: IDS.stmtHdfc,
      bankName: 'HDFC Bank',
      matchedCaseId: null,
      caseNumber: null,
      matchType: 'UNMATCHED',
      matchScore: 0,
      expectedCommission: 0,
      receivedCommission: 12000,
      variance: 12000,
      varianceType: 'MISSING',
      status: 'PENDING_REVIEW',
      reviewedBy: null,
      reviewedAt: null,
      notes: null,
    }),
    makeMatch({
      id: IDS.matchI1,
      statementLineId: IDS.lineI1,
      statementId: IDS.stmtIcici,
      bankName: 'ICICI Bank',
      matchedCaseId: IDS.case3,
      caseNumber: 'KF-2026-000003',
      matchType: 'EXACT',
      matchScore: 100,
      expectedCommission: expectedCase3,
      receivedCommission: 38000,
      variance: 0,
      varianceType: 'MATCHED',
      status: 'ACCEPTED',
      reviewedBy: 'finance@kuberone.com',
      reviewedAt: daysAgo(1),
      notes: 'Exact loan account match',
    }),
    makeMatch({
      id: IDS.matchI2,
      statementLineId: IDS.lineI2,
      statementId: IDS.stmtIcici,
      bankName: 'ICICI Bank',
      matchedCaseId: IDS.case3,
      caseNumber: 'KF-2026-000003',
      matchType: 'PROBABLE',
      matchScore: 80,
      expectedCommission: expectedCase3,
      receivedCommission: 38000,
      variance: 0,
      varianceType: 'MATCHED',
      status: 'PENDING_REVIEW',
      reviewedBy: null,
      reviewedAt: null,
      notes: 'PAN + amount tolerance',
    }),
    makeMatch({
      id: IDS.matchI3,
      statementLineId: IDS.lineI3,
      statementId: IDS.stmtIcici,
      bankName: 'ICICI Bank',
      matchedCaseId: IDS.case3,
      caseNumber: 'KF-2026-000003',
      matchType: 'EXACT',
      matchScore: 100,
      expectedCommission: expectedCase3,
      receivedCommission: 42000,
      variance: roundMoney(42000 - expectedCase3),
      varianceType: classifyVariance(42000, expectedCase3),
      status: 'PENDING_REVIEW',
      reviewedBy: null,
      reviewedAt: null,
      notes: 'Excess payout',
    }),
    makeMatch({
      id: IDS.matchI4,
      statementLineId: IDS.lineI4,
      statementId: IDS.stmtIcici,
      bankName: 'ICICI Bank',
      matchedCaseId: null,
      caseNumber: null,
      matchType: 'UNMATCHED',
      matchScore: 0,
      expectedCommission: 0,
      receivedCommission: 8000,
      variance: 8000,
      varianceType: 'MISSING',
      status: 'PENDING_REVIEW',
      reviewedBy: null,
      reviewedAt: null,
      notes: null,
    }),
  ];

  for (const m of seedMatches) matches.set(m.id, m);

  disputes.set(IDS.dispute1, {
    id: IDS.dispute1,
    matchId: IDS.matchH3,
    bankName: 'HDFC Bank',
    raisedBy: 'finance@kuberone.com',
    raisedAt: daysAgo(1),
    amount: roundMoney(expectedCase1 - 28000),
    reason: 'Bank short-paid commission vs expected partner share',
    status: 'OPEN',
    resolutionNotes: null,
    resolvedAt: null,
  });

  auditEvents.push({
    id: IDS.audit1,
    entityType: 'statement',
    entityId: IDS.stmtHdfc,
    action: 'SEED_LOADED',
    actorUserId: 'system',
    actorName: 'System',
    before: null,
    after: { statements: 2, matches: seedMatches.length },
    ipAddress: null,
    createdAt: daysAgo(3),
  });
}

export function listAllStatements(): BankCommissionStatement[] {
  return Array.from(statements.values());
}

export function getStatementById(id: string): BankCommissionStatement | undefined {
  return statements.get(id);
}

export function saveStatement(stmt: BankCommissionStatement): BankCommissionStatement {
  statements.set(stmt.id, stmt);
  return stmt;
}

export function listLinesByStatement(statementId: string): StatementLineItem[] {
  return Array.from(lines.values()).filter((l) => l.statementId === statementId);
}

export function getLineById(id: string): StatementLineItem | undefined {
  return lines.get(id);
}

export function saveLine(line: StatementLineItem): StatementLineItem {
  lines.set(line.id, line);
  return line;
}

export function deleteMatchesForStatement(statementId: string): void {
  for (const [id, m] of Array.from(matches.entries())) {
    if (m.statementId === statementId) matches.delete(id);
  }
}

export function listAllMatches(): ReconciliationMatch[] {
  return Array.from(matches.values());
}

export function getMatchById(id: string): ReconciliationMatch | undefined {
  return matches.get(id);
}

export function saveMatch(match: ReconciliationMatch): ReconciliationMatch {
  matches.set(match.id, match);
  return match;
}

export function listAllDisputes(): ReconciliationDispute[] {
  return Array.from(disputes.values());
}

export function getDisputeById(id: string): ReconciliationDispute | undefined {
  return disputes.get(id);
}

export function saveDispute(dispute: ReconciliationDispute): ReconciliationDispute {
  disputes.set(dispute.id, dispute);
  return dispute;
}

export function listAuditEvents(): ReconciliationAuditEvent[] {
  return [...auditEvents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function pushAudit(
  partial: Omit<ReconciliationAuditEvent, 'id' | 'createdAt'> & {
    id?: string;
    createdAt?: string;
  },
): ReconciliationAuditEvent {
  const event: ReconciliationAuditEvent = {
    id: partial.id ?? randomUUID(),
    entityType: partial.entityType,
    entityId: partial.entityId,
    action: partial.action,
    actorUserId: partial.actorUserId,
    actorName: partial.actorName,
    before: partial.before ?? null,
    after: partial.after ?? null,
    ipAddress: partial.ipAddress ?? null,
    createdAt: partial.createdAt ?? new Date().toISOString(),
  };
  auditEvents.unshift(event);
  return event;
}

export function resetBankReconciliationStore(): void {
  statements.clear();
  lines.clear();
  matches.clear();
  disputes.clear();
  auditEvents.length = 0;
  seeded = false;
  seedBankReconciliation();
}

seedBankReconciliation();
