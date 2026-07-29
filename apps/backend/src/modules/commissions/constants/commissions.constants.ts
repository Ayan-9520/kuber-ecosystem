export const COMMISSION_ENGINE_VERSION = '1.0.0';

export const LEDGER_NUMBER_PREFIX = 'KCL';
export const APPROVAL_NUMBER_PREFIX = 'KCA';
export const PAYMENT_NUMBER_PREFIX = 'KCP';
export const ADJUSTMENT_NUMBER_PREFIX = 'KCAD';
export const RECOVERY_NUMBER_PREFIX = 'KCR';

export const PARTNER_CODE_TO_COMMISSION_TYPE: Record<string, string> = {
  DSA: 'DSA',
  BUILDER: 'BUILDER',
  PROPERTY_DEALER: 'PROPERTY_DEALER',
  CA: 'CA',
  BROKER: 'BROKER',
  CORPORATE: 'CORPORATE',
  CHANNEL_PARTNER: 'CHANNEL_PARTNER',
  REFERRAL: 'CHANNEL_PARTNER',
};

export const DEFAULT_CURRENCY = 'INR';

/** TDS under Section 194H — 5% on commission exceeding ₹15,000 per FY */
export const TDS_RATE = 0.05;
export const TDS_THRESHOLD_ANNUAL = 15000;

/** Monthly payout cycle configuration */
export const PAYOUT_CYCLE_DAY = 15;
export const PAYOUT_CUTOFF_DAY = 5;
export const MIN_PAYOUT_AMOUNT = 500;
export const PAYOUT_CYCLE_PREFIX = 'KCYC';
