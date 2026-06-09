export const EMAIL_BRAND = {
  primary: '#22D3A6',
  dark: '#071A1F',
  surface: '#102B2E',
  text: '#E8F4F2',
  muted: '#8BA8A3',
  company: 'Kuber Finserve',
  product: 'KuberOne',
} as const;

export const EMAIL_MAX_RETRIES = 3;
export const EMAIL_RETRY_DELAY_MS = 30_000;

export const TRANSACTIONAL_EVENT_TYPES = new Set([
  'LOGIN_OTP',
  'PASSWORD_RESET',
  'APPLICATION_SUBMITTED',
  'APPLICATION_CREATED',
  'DOCUMENT_REQUESTED',
  'DOCUMENT_VERIFIED',
  'DOCUMENT_REJECTED',
  'SANCTION_ISSUED',
  'DISBURSEMENT_COMPLETED',
  'REFERRAL_CREATED',
  'REFERRAL_CONVERTED',
  'COMMISSION_APPROVED',
  'COMMISSION_PAID',
  'SUPPORT_TICKET_CREATED',
  'SUPPORT_TICKET_CLOSED',
]);

export const ALLOWED_ATTACHMENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);
