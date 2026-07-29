import type { LenderApplicationStatus } from './lender-connector.interface.js';

export interface WebhookPayload {
  lenderCode: string;
  externalRefId: string;
  lenderStatus: string;
  sanctionAmount?: number;
  sanctionDate?: string;
  disbursementAmount?: number;
  disbursementDate?: string;
  remarks?: string;
  rawPayload?: Record<string, unknown>;
}

export type WebhookEventType =
  | 'APPLICATION_STATUS_CHANGED'
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_REJECTED'
  | 'APPLICATION_DISBURSED';

export interface WebhookEvent {
  eventType: WebhookEventType;
  lenderCode: string;
  externalRefId: string;
  status: LenderApplicationStatus;
  sanctionAmount?: number;
  sanctionDate?: string;
  disbursementAmount?: number;
  disbursementDate?: string;
  remarks?: string;
  receivedAt: string;
}

type WebhookListener = (event: WebhookEvent) => void | Promise<void>;

const listeners: WebhookListener[] = [];

const STATUS_MAP: Record<string, Record<string, LenderApplicationStatus>> = {
  HDFC: {
    SUBMITTED: 'SUBMITTED',
    IN_PROGRESS: 'PROCESSING',
    UNDER_REVIEW: 'PROCESSING',
    SANCTIONED: 'APPROVED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    DECLINED: 'REJECTED',
    DISBURSED: 'DISBURSED',
  },
  ICICI: {
    NEW: 'SUBMITTED',
    PROCESSING: 'PROCESSING',
    CREDIT_APPROVED: 'APPROVED',
    SANCTION_ISSUED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'REJECTED',
    DISBURSED: 'DISBURSED',
    PARTIALLY_DISBURSED: 'DISBURSED',
  },
  BAJAJ: {
    RECEIVED: 'SUBMITTED',
    UNDER_PROCESS: 'PROCESSING',
    APPROVED: 'APPROVED',
    SANCTION_GENERATED: 'APPROVED',
    DECLINED: 'REJECTED',
    WITHDRAWN: 'REJECTED',
    DISBURSED: 'DISBURSED',
  },
};

function mapStatus(lenderCode: string, rawStatus: string): LenderApplicationStatus {
  const lenderMap = STATUS_MAP[lenderCode];
  if (lenderMap) {
    const mapped = lenderMap[rawStatus.toUpperCase()];
    if (mapped) return mapped;
  }
  const normalized = rawStatus.toUpperCase();
  if (normalized.includes('REJECT') || normalized.includes('DECLINE')) return 'REJECTED';
  if (normalized.includes('DISBURSE')) return 'DISBURSED';
  if (normalized.includes('APPROV') || normalized.includes('SANCTION')) return 'APPROVED';
  if (normalized.includes('PROCESS') || normalized.includes('REVIEW')) return 'PROCESSING';
  return 'SUBMITTED';
}

function deriveEventType(status: LenderApplicationStatus): WebhookEventType {
  switch (status) {
    case 'APPROVED':
      return 'APPLICATION_APPROVED';
    case 'REJECTED':
      return 'APPLICATION_REJECTED';
    case 'DISBURSED':
      return 'APPLICATION_DISBURSED';
    default:
      return 'APPLICATION_STATUS_CHANGED';
  }
}

export function onWebhookEvent(listener: WebhookListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export async function handleWebhook(payload: WebhookPayload): Promise<WebhookEvent> {
  const status = mapStatus(payload.lenderCode, payload.lenderStatus);
  const event: WebhookEvent = {
    eventType: deriveEventType(status),
    lenderCode: payload.lenderCode,
    externalRefId: payload.externalRefId,
    status,
    sanctionAmount: payload.sanctionAmount,
    sanctionDate: payload.sanctionDate,
    disbursementAmount: payload.disbursementAmount,
    disbursementDate: payload.disbursementDate,
    remarks: payload.remarks,
    receivedAt: new Date().toISOString(),
  };

  console.log(`[WebhookHandler] ${event.eventType} lender=${payload.lenderCode} ref=${payload.externalRefId} status=${status}`);

  for (const listener of listeners) {
    try {
      await listener(event);
    } catch (err) {
      console.error(`[WebhookHandler] Listener error:`, err);
    }
  }

  return event;
}
