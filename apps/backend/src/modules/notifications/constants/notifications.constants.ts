export const NOTIFICATION_ENGINE_VERSION = '1.0.0';

export const MAX_RETRY_COUNT = 3;

export const RETRY_DELAY_MS = 60_000;

export const DEFAULT_CHANNELS = ['IN_APP'] as const;

export const OTP_EVENTS = new Set(['LOGIN_OTP', 'PASSWORD_RESET']);

export const TRANSACTIONAL_EVENTS = new Set([
  'LOGIN_OTP',
  'PASSWORD_RESET',
  'DOCUMENT_REQUESTED',
  'SANCTION_ISSUED',
  'DISBURSEMENT_COMPLETED',
]);
