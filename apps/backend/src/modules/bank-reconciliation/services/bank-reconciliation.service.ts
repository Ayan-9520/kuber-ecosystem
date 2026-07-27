import { randomUUID } from 'node:crypto';

import type { AuthenticatedUser } from '@kuberone/shared-types';

import { AppError, NotFoundError } from '../../../shared/errors/app-error.js';
import { listAllCases } from '../../loan-fulfillment/repositories/loan-fulfillment.store.js';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MATCH_REVIEW_TRANSITIONS,
} from '../constants/bank-reconciliation.constants.js';
import {
  deleteMatchesForStatement,
  getDisputeById,
  getLineById,
  getMatchById,
  getStatementById,
  listAllDisputes,
  listAllMatches,
  listAllStatements,
  listAuditEvents,
  listLinesByStatement,
  pushAudit,
  saveDispute,
  saveLine,
  saveMatch,
  saveStatement,
} from '../repositories/bank-reconciliation.store.js';
import { classifyVariance, matchStatementLine, roundMoney } from './matching.engine.js';
import type {
  BcreSummary,
  CreateDisputeInput,
  CreateStatementInput,
  ListAuditQuery,
  ListDisputesQuery,
  ListMatchesQuery,
  ListStatementsQuery,
  ReconciliationMatch,
  RequestContext,
  ReviewMatchInput,
  StatementDetail,
  UpdateDisputeInput,
} from '../types/bank-reconciliation.types.js';

function buildPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function actorLabel(user: AuthenticatedUser): string {
  return user.email ?? user.phone ?? user.id;
}

function enrichMatch(match: ReconciliationMatch): ReconciliationMatch {
  const line = getLineById(match.statementLineId);
  return line ? { ...match, line } : { ...match };
}

function snapshotMatch(m: ReconciliationMatch): Record<string, unknown> {
  return {
    id: m.id,
    status: m.status,
    matchType: m.matchType,
    varianceType: m.varianceType,
    variance: m.variance,
    notes: m.notes,
    matchedCaseId: m.matchedCaseId,
  };
}

export const bankReconciliationService = {
  summary(_user: AuthenticatedUser): BcreSummary {
    const stmts = listAllStatements();
    const allMatches = listAllMatches();
    const allDisputes = listAllDisputes();

    const totalReceived = roundMoney(
      allMatches.reduce((s, m) => s + m.receivedCommission, 0),
    );
    const totalExpected = roundMoney(
      allMatches.reduce((s, m) => s + m.expectedCommission, 0),
    );
    const totalVariance = roundMoney(totalReceived - totalExpected);

    const shortPayments = allMatches.filter((m) => m.varianceType === 'SHORT_PAYMENT');
    const excess = allMatches.filter((m) => m.varianceType === 'EXCESS');
    const matchedCount = allMatches.filter((m) => m.matchType === 'EXACT').length;
    const probableCount = allMatches.filter((m) => m.matchType === 'PROBABLE').length;
    const unmatchedCount = allMatches.filter((m) => m.matchType === 'UNMATCHED').length;
    const scored = matchedCount + probableCount + unmatchedCount;
    const matchedPercent =
      scored === 0 ? 0 : roundMoney(((matchedCount + probableCount) / scored) * 100);

    return {
      totalStatements: stmts.length,
      reconciledStatements: stmts.filter((s) => s.status === 'RECONCILED' || s.status === 'CLOSED')
        .length,
      totalReceived,
      totalExpected,
      totalVariance,
      shortPaymentCount: shortPayments.length,
      shortPaymentAmount: roundMoney(
        shortPayments.reduce((s, m) => s + Math.abs(m.variance), 0),
      ),
      excessCount: excess.length,
      excessAmount: roundMoney(excess.reduce((s, m) => s + Math.abs(m.variance), 0)),
      matchedCount,
      probableCount,
      unmatchedCount,
      matchedPercent,
      pendingReviewCount: allMatches.filter((m) => m.status === 'PENDING_REVIEW').length,
      openDisputes: allDisputes.filter((d) => d.status === 'OPEN' || d.status === 'IN_PROGRESS')
        .length,
      acceptedCount: allMatches.filter((m) => m.status === 'ACCEPTED').length,
      writtenOffCount: allMatches.filter((m) => m.status === 'WRITTEN_OFF').length,
    };
  },

  listStatements(_user: AuthenticatedUser, query: ListStatementsQuery) {
    const page = query.page || DEFAULT_PAGE;
    const limit = query.limit || DEFAULT_LIMIT;
    let items = listAllStatements();

    if (query.bankName) {
      const q = query.bankName.toLowerCase();
      items = items.filter((s) => s.bankName.toLowerCase().includes(q));
    }
    if (query.status) items = items.filter((s) => s.status === query.status);
    if (query.period) {
      const q = query.period.toLowerCase();
      items = items.filter(
        (s) =>
          (s.statementPeriod.month?.toLowerCase().includes(q) ?? false) ||
          String(s.statementPeriod.year ?? '').includes(q) ||
          (s.statementPeriod.from?.includes(q) ?? false),
      );
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (s) =>
          s.bankName.toLowerCase().includes(q) ||
          s.fileName.toLowerCase().includes(q) ||
          s.uploadedBy.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q),
      );
    }

    items.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
    const total = items.length;
    const slice = items.slice((page - 1) * limit, page * limit);
    return { items: slice, meta: buildPaginationMeta(page, limit, total) };
  },

  getStatement(_user: AuthenticatedUser, id: string): StatementDetail {
    const stmt = getStatementById(id);
    if (!stmt) throw new NotFoundError('BankCommissionStatement', id);
    const stmtLines = listLinesByStatement(id);
    const stmtMatches = listAllMatches()
      .filter((m) => m.statementId === id)
      .map(enrichMatch);
    return { ...stmt, lines: stmtLines, matches: stmtMatches };
  },

  createStatement(user: AuthenticatedUser, input: CreateStatementInput, ctx: RequestContext) {
    if (!input.lines?.length) {
      throw new AppError(400, 'EMPTY_STATEMENT', 'Statement must include at least one line item');
    }

    const id = randomUUID();
    const createdLines = input.lines.map((row) => {
      const commissionAmount = roundMoney(row.commissionAmount);
      const gstAmount = roundMoney(row.gstAmount ?? 0);
      const tdsAmount = roundMoney(row.tdsAmount ?? 0);
      const netAmount = roundMoney(
        row.netAmount ?? commissionAmount + gstAmount - tdsAmount,
      );
      return saveLine({
        id: randomUUID(),
        statementId: id,
        bankReference: row.bankReference ?? null,
        loanAccountNumber: row.loanAccountNumber ?? null,
        applicationNumber: row.applicationNumber ?? null,
        customerName: row.customerName.trim(),
        pan: row.pan ?? null,
        disbursedAmount: roundMoney(row.disbursedAmount ?? 0),
        commissionAmount,
        gstAmount,
        tdsAmount,
        netAmount,
        payoutDate: row.payoutDate ?? null,
        rawPayload: row.rawPayload ?? null,
      });
    });

    const totalAmount = roundMoney(
      createdLines.reduce((s, l) => s + l.commissionAmount, 0),
    );

    const stmt = saveStatement({
      id,
      bankName: input.bankName.trim(),
      statementPeriod: input.statementPeriod ?? {},
      uploadedBy: actorLabel(user),
      uploadedAt: new Date().toISOString(),
      fileName: input.fileName.trim(),
      totalRows: createdLines.length,
      totalAmount,
      status: 'PARSED',
    });

    pushAudit({
      entityType: 'statement',
      entityId: id,
      action: 'STATEMENT_CREATED',
      actorUserId: ctx.actorId,
      actorName: ctx.actorName ?? actorLabel(user),
      before: null,
      after: { bankName: stmt.bankName, totalRows: stmt.totalRows, totalAmount },
      ipAddress: ctx.ipAddress ?? null,
    });

    return { ...stmt, lines: createdLines, matches: [] as ReconciliationMatch[] };
  },

  reconcileStatement(user: AuthenticatedUser, id: string, ctx: RequestContext) {
    const stmt = getStatementById(id);
    if (!stmt) throw new NotFoundError('BankCommissionStatement', id);
    if (stmt.status === 'CLOSED') {
      throw new AppError(400, 'STATEMENT_CLOSED', 'Closed statements cannot be reconciled');
    }

    const stmtLines = listLinesByStatement(id);
    if (!stmtLines.length) {
      throw new AppError(400, 'EMPTY_STATEMENT', 'Statement has no line items to reconcile');
    }

    const cases = listAllCases();
    deleteMatchesForStatement(id);

    const created: ReconciliationMatch[] = [];
    for (const line of stmtLines) {
      const candidate = matchStatementLine(line, cases);
      const received = roundMoney(line.commissionAmount);
      const expected = roundMoney(candidate?.expectedCommission ?? 0);
      const variance = roundMoney(received - expected);
      const matchType = candidate?.matchType ?? 'UNMATCHED';
      const matchScore = candidate?.matchScore ?? 0;
      const varianceType =
        matchType === 'UNMATCHED' && !candidate?.caseId
          ? ('MISSING' as const)
          : classifyVariance(received, expected);

      const match = saveMatch({
        id: randomUUID(),
        statementLineId: line.id,
        statementId: id,
        bankName: stmt.bankName,
        matchedCaseId: candidate?.caseId ?? null,
        caseNumber: candidate?.caseNumber ?? null,
        matchType: matchScore < 50 && matchType !== 'EXACT' ? 'UNMATCHED' : matchType,
        matchScore,
        expectedCommission: expected,
        receivedCommission: received,
        variance,
        varianceType: matchScore < 50 && !candidate?.caseId ? 'MISSING' : varianceType,
        status: 'PENDING_REVIEW',
        reviewedBy: null,
        reviewedAt: null,
        notes: null,
      });
      created.push(enrichMatch(match));
    }

    const updated = saveStatement({
      ...stmt,
      status: 'RECONCILED',
    });

    pushAudit({
      entityType: 'statement',
      entityId: id,
      action: 'STATEMENT_RECONCILED',
      actorUserId: ctx.actorId,
      actorName: ctx.actorName ?? actorLabel(user),
      before: { status: stmt.status },
      after: {
        status: updated.status,
        matchCount: created.length,
        unmatched: created.filter((m) => m.matchType === 'UNMATCHED').length,
      },
      ipAddress: ctx.ipAddress ?? null,
    });

    return { ...updated, lines: stmtLines, matches: created };
  },

  listMatches(_user: AuthenticatedUser, query: ListMatchesQuery) {
    const page = query.page || DEFAULT_PAGE;
    const limit = query.limit || DEFAULT_LIMIT;
    let items = listAllMatches().map(enrichMatch);

    if (query.statementId) items = items.filter((m) => m.statementId === query.statementId);
    if (query.matchType) items = items.filter((m) => m.matchType === query.matchType);
    if (query.varianceType) items = items.filter((m) => m.varianceType === query.varianceType);
    if (query.status) items = items.filter((m) => m.status === query.status);
    if (query.bankName) {
      const q = query.bankName.toLowerCase();
      items = items.filter((m) => m.bankName.toLowerCase().includes(q));
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (m) =>
          (m.caseNumber?.toLowerCase().includes(q) ?? false) ||
          (m.line?.customerName.toLowerCase().includes(q) ?? false) ||
          (m.line?.applicationNumber?.toLowerCase().includes(q) ?? false) ||
          (m.line?.loanAccountNumber?.toLowerCase().includes(q) ?? false) ||
          (m.line?.pan?.toLowerCase().includes(q) ?? false) ||
          m.bankName.toLowerCase().includes(q),
      );
    }

    items.sort((a, b) => b.matchScore - a.matchScore);
    const total = items.length;
    const slice = items.slice((page - 1) * limit, page * limit);
    return { items: slice, meta: buildPaginationMeta(page, limit, total) };
  },

  reviewMatch(
    user: AuthenticatedUser,
    id: string,
    input: ReviewMatchInput,
    ctx: RequestContext,
  ) {
    const match = getMatchById(id);
    if (!match) throw new NotFoundError('ReconciliationMatch', id);

    const allowed = MATCH_REVIEW_TRANSITIONS[match.status] ?? [];
    if (!allowed.includes(input.action)) {
      throw new AppError(
        400,
        'INVALID_TRANSITION',
        `Cannot ${input.action} a match in status ${match.status}`,
      );
    }

    const before = snapshotMatch(match);
    let nextStatus = match.status;
    if (input.action === 'accept') nextStatus = 'ACCEPTED';
    else if (input.action === 'dispute') nextStatus = 'DISPUTED';
    else if (input.action === 'write-off') nextStatus = 'WRITTEN_OFF';
    else if (input.action === 'resolve') nextStatus = 'RESOLVED';

    const updated = saveMatch({
      ...match,
      status: nextStatus,
      notes: input.note ?? input.reason ?? match.notes,
      reviewedBy: actorLabel(user),
      reviewedAt: new Date().toISOString(),
    });

    let dispute = null;
    if (input.action === 'dispute') {
      dispute = saveDispute({
        id: randomUUID(),
        matchId: id,
        bankName: match.bankName,
        raisedBy: actorLabel(user),
        raisedAt: new Date().toISOString(),
        amount: roundMoney(Math.abs(match.variance) || match.receivedCommission),
        reason: input.reason ?? input.note ?? 'Disputed during review',
        status: 'OPEN',
        resolutionNotes: null,
        resolvedAt: null,
      });
    }

    pushAudit({
      entityType: 'match',
      entityId: id,
      action: `MATCH_${input.action.toUpperCase().replace('-', '_')}`,
      actorUserId: ctx.actorId,
      actorName: ctx.actorName ?? actorLabel(user),
      before,
      after: snapshotMatch(updated),
      ipAddress: ctx.ipAddress ?? null,
    });

    return { match: enrichMatch(updated), dispute };
  },

  createDispute(
    user: AuthenticatedUser,
    matchId: string,
    input: CreateDisputeInput,
    ctx: RequestContext,
  ) {
    const match = getMatchById(matchId);
    if (!match) throw new NotFoundError('ReconciliationMatch', matchId);

    const before = snapshotMatch(match);
    const updatedMatch = saveMatch({
      ...match,
      status: 'DISPUTED',
      notes: input.reason,
      reviewedBy: actorLabel(user),
      reviewedAt: new Date().toISOString(),
    });

    const dispute = saveDispute({
      id: randomUUID(),
      matchId,
      bankName: match.bankName,
      raisedBy: actorLabel(user),
      raisedAt: new Date().toISOString(),
      amount: roundMoney(input.amount ?? (Math.abs(match.variance) || match.receivedCommission)),
      reason: input.reason,
      status: 'OPEN',
      resolutionNotes: null,
      resolvedAt: null,
    });

    pushAudit({
      entityType: 'dispute',
      entityId: dispute.id,
      action: 'DISPUTE_CREATED',
      actorUserId: ctx.actorId,
      actorName: ctx.actorName ?? actorLabel(user),
      before,
      after: { disputeId: dispute.id, matchStatus: updatedMatch.status },
      ipAddress: ctx.ipAddress ?? null,
    });

    return dispute;
  },

  listDisputes(_user: AuthenticatedUser, query: ListDisputesQuery) {
    const page = query.page || DEFAULT_PAGE;
    const limit = query.limit || DEFAULT_LIMIT;
    let items = listAllDisputes();

    if (query.status) items = items.filter((d) => d.status === query.status);
    if (query.bankName) {
      const q = query.bankName.toLowerCase();
      items = items.filter((d) => d.bankName.toLowerCase().includes(q));
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (d) =>
          d.reason.toLowerCase().includes(q) ||
          d.bankName.toLowerCase().includes(q) ||
          d.raisedBy.toLowerCase().includes(q) ||
          d.matchId.toLowerCase().includes(q),
      );
    }

    items.sort((a, b) => new Date(b.raisedAt).getTime() - new Date(a.raisedAt).getTime());
    const total = items.length;
    const slice = items.slice((page - 1) * limit, page * limit);
    return { items: slice, meta: buildPaginationMeta(page, limit, total) };
  },

  updateDispute(
    user: AuthenticatedUser,
    id: string,
    input: UpdateDisputeInput,
    ctx: RequestContext,
  ) {
    const dispute = getDisputeById(id);
    if (!dispute) throw new NotFoundError('ReconciliationDispute', id);

    const terminal = dispute.status === 'RESOLVED' || dispute.status === 'REJECTED';
    if (terminal && input.status !== dispute.status) {
      throw new AppError(
        400,
        'INVALID_TRANSITION',
        `Cannot change a ${dispute.status} dispute`,
      );
    }

    const before = { ...dispute };
    const resolved =
      input.status === 'RESOLVED' || input.status === 'REJECTED'
        ? new Date().toISOString()
        : dispute.resolvedAt;

    const updated = saveDispute({
      ...dispute,
      status: input.status,
      resolutionNotes: input.resolutionNotes ?? dispute.resolutionNotes,
      resolvedAt: resolved ?? null,
    });

    if (input.status === 'RESOLVED') {
      const match = getMatchById(dispute.matchId);
      if (match && match.status === 'DISPUTED') {
        saveMatch({
          ...match,
          status: 'RESOLVED',
          reviewedBy: actorLabel(user),
          reviewedAt: new Date().toISOString(),
          notes: input.resolutionNotes ?? match.notes,
        });
      }
    }

    pushAudit({
      entityType: 'dispute',
      entityId: id,
      action: 'DISPUTE_UPDATED',
      actorUserId: ctx.actorId,
      actorName: ctx.actorName ?? actorLabel(user),
      before: before as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
      ipAddress: ctx.ipAddress ?? null,
    });

    return updated;
  },

  listAudit(_user: AuthenticatedUser, query: ListAuditQuery) {
    const page = query.page || DEFAULT_PAGE;
    const limit = query.limit || DEFAULT_LIMIT;
    let items = listAuditEvents();

    if (query.entityId) items = items.filter((e) => e.entityId === query.entityId);
    if (query.action) {
      const q = query.action.toLowerCase();
      items = items.filter((e) => e.action.toLowerCase().includes(q));
    }
    if (query.entityType) {
      const q = query.entityType.toLowerCase();
      items = items.filter((e) => e.entityType.toLowerCase() === q);
    }

    const total = items.length;
    const slice = items.slice((page - 1) * limit, page * limit);
    return { items: slice, meta: buildPaginationMeta(page, limit, total) };
  },
};
