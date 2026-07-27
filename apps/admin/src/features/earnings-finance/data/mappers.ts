import type { ApprovalRow, LedgerRow, PaymentRow, StatusTimelineEvent, TimelineActor } from './types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function str(value: unknown, fallback = ''): string {
  if (value == null || value === '') return fallback;
  return String(value);
}

function num(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function nestedName(rel: unknown, ...keys: string[]): string {
  const obj = asRecord(rel);
  if (!obj) return '';
  for (const key of keys) {
    const v = obj[key];
    if (v != null && String(v).trim() !== '') return String(v);
  }
  return '';
}

function event(
  id: string,
  status: string,
  label: string,
  at: string,
  by: string,
  actor: TimelineActor,
  comment?: string,
): StatusTimelineEvent {
  return { id, status, label, at, by, actor, comment };
}

export function mapLedgerRow(raw: Record<string, unknown>): LedgerRow {
  const partner = asRecord(raw.partner);
  const product = asRecord(raw.product);
  const application = asRecord(raw.application);
  const lead = asRecord(raw.lead);
  const createdBy = asRecord(raw.createdBy);

  const partnerName =
    nestedName(partner, 'businessName', 'contactName') ||
    str(raw.partnerId, '—');
  const partnerCode = partner?.partnerCode != null ? String(partner.partnerCode) : undefined;
  const productName = nestedName(product, 'name', 'code') || str(raw.commissionType, '—');
  const caseRef =
    nestedName(application, 'applicationNumber') ||
    nestedName(lead, 'leadNumber') ||
    '—';

  const createdAt = str(raw.createdAt);
  const calculatedAt = raw.calculatedAt != null ? str(raw.calculatedAt) : undefined;
  const updatedAt = str(raw.updatedAt || raw.createdAt);
  const status = str(raw.status, 'PENDING');
  const notes = raw.notes != null ? str(raw.notes) : undefined;
  const byEmail = nestedName(createdBy, 'email') || 'System';

  const timeline: StatusTimelineEvent[] = [];
  if (createdAt) {
    timeline.push(event(`${str(raw.id)}-created`, 'PENDING', 'Ledger entry created', createdAt, byEmail, 'SYSTEM'));
  }
  if (calculatedAt) {
    timeline.push(
      event(`${str(raw.id)}-calc`, 'CALCULATED', 'Commission calculated', calculatedAt, 'System', 'SYSTEM', notes),
    );
  }
  if (status === 'APPROVED' || status === 'PAID' || status === 'REJECTED' || status === 'RECOVERED' || status === 'ADJUSTED') {
    timeline.push(
      event(
        `${str(raw.id)}-status`,
        status,
        `Status: ${status}`,
        updatedAt || createdAt,
        'Finance',
        'FINANCE',
        notes,
      ),
    );
  }

  return {
    id: str(raw.id),
    ledgerNumber: str(raw.ledgerNumber, '—'),
    partnerId: str(raw.partnerId),
    partnerName,
    partnerCode,
    product: productName,
    commissionType: str(raw.commissionType),
    commissionAmount: num(raw.commissionAmount),
    baseAmount: num(raw.baseAmount),
    status,
    caseRef,
    notes,
    createdAt,
    updatedAt,
    calculatedAt,
    timeline,
  };
}

export function mapApprovalRow(raw: Record<string, unknown>): ApprovalRow {
  const ledger = asRecord(raw.ledger);
  const partner = ledger ? asRecord(ledger.partner) : null;
  const requestedBy = asRecord(raw.requestedBy);
  const approvedBy = asRecord(raw.approvedBy);

  const partnerName =
    nestedName(partner, 'businessName', 'contactName') ||
    (ledger ? str(ledger.partnerId, '—') : '—');

  const createdAt = str(raw.createdAt);
  const approvedAt = raw.approvedAt != null ? str(raw.approvedAt) : undefined;
  const status = str(raw.status, 'PENDING');
  const notes = raw.notes != null ? str(raw.notes) : undefined;
  const rejectionReason = raw.rejectionReason != null ? str(raw.rejectionReason) : undefined;

  const timeline: StatusTimelineEvent[] = [
    event(
      `${str(raw.id)}-req`,
      'PENDING',
      'Approval requested',
      createdAt,
      nestedName(requestedBy, 'email') || 'Partner',
      'PARTNER',
      notes,
    ),
  ];

  if (status === 'APPROVED' && approvedAt) {
    timeline.push(
      event(
        `${str(raw.id)}-ok`,
        'APPROVED',
        'Approval granted',
        approvedAt,
        nestedName(approvedBy, 'email') || 'Finance',
        'FINANCE',
        notes,
      ),
    );
  }
  if (status === 'REJECTED') {
    timeline.push(
      event(
        `${str(raw.id)}-rej`,
        'REJECTED',
        'Approval rejected',
        approvedAt || createdAt,
        nestedName(approvedBy, 'email') || 'Finance',
        'FINANCE',
        rejectionReason || notes,
      ),
    );
  }

  return {
    id: str(raw.id),
    approvalNumber: str(raw.approvalNumber, '—'),
    ledgerId: str(raw.ledgerId),
    ledgerNumber: ledger ? str(ledger.ledgerNumber) : undefined,
    partnerName,
    requestedAmount: num(raw.requestedAmount),
    approvedAmount: raw.approvedAmount != null ? num(raw.approvedAmount) : undefined,
    status,
    notes,
    rejectionReason,
    createdAt,
    approvedAt,
    timeline,
  };
}

export function mapPaymentRow(raw: Record<string, unknown>): PaymentRow {
  const partner = asRecord(raw.partner);
  return {
    id: str(raw.id),
    paymentNumber: str(raw.paymentNumber, '—'),
    partnerId: str(raw.partnerId),
    partnerName: nestedName(partner, 'businessName', 'contactName') || str(raw.partnerId, '—'),
    totalAmount: num(raw.totalAmount),
    status: str(raw.status, 'PENDING'),
    paymentReference: raw.paymentReference != null ? str(raw.paymentReference) : undefined,
    releasedAt: raw.releasedAt != null ? str(raw.releasedAt) : undefined,
    createdAt: str(raw.createdAt),
  };
}

export function mergeLedgerTimeline(
  ledger: LedgerRow,
  approvals: ApprovalRow[],
): StatusTimelineEvent[] {
  const related = approvals.filter((a) => a.ledgerId === ledger.id);
  const events = [...ledger.timeline, ...related.flatMap((a) => a.timeline)];
  const seen = new Set<string>();
  return events
    .filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    })
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}
