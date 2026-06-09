export const LEAD_SOURCES = {
  WEBSITE: { code: 'WEBSITE', name: 'Website', channel: 'DIGITAL' as const },
  MOBILE_APP: { code: 'MOBILE_APP', name: 'Mobile App', channel: 'DIGITAL' as const },
  DSA: { code: 'DSA', name: 'DSA', channel: 'PARTNER' as const },
  REFERRAL_PARTNER: { code: 'REFERRAL_PARTNER', name: 'Referral Partner', channel: 'PARTNER' as const },
  BUILDER: { code: 'BUILDER', name: 'Builder', channel: 'PARTNER' as const },
  CA: { code: 'CA', name: 'Chartered Accountant', channel: 'PARTNER' as const },
  PROPERTY_DEALER: { code: 'PROPERTY_DEALER', name: 'Property Dealer', channel: 'PARTNER' as const },
  CAMPAIGN: { code: 'CAMPAIGN', name: 'Campaign', channel: 'DIGITAL' as const },
  MANUAL_ENTRY: { code: 'MANUAL_ENTRY', name: 'Manual Entry', channel: 'DIRECT' as const },
  IMPORT: { code: 'IMPORT', name: 'Import', channel: 'INBOUND' as const },
} as const;

export const GRADE_ALIASES: Record<string, string> = {
  A_PLUS: 'Hot',
  A: 'Warm',
  B: 'Moderate',
  C: 'Cold',
  REJECTED: 'Rejected',
};

export const GRADE_SLA_HOURS: Record<string, number> = {
  A_PLUS: 1,
  A: 4,
  B: 24,
  C: 48,
  REJECTED: 0,
};

export const GRADE_THRESHOLDS = {
  A_PLUS: 90,
  A: 75,
  B: 50,
  C: 20,
  REJECTED: 0,
} as const;

export const TERMINAL_STATUSES = ['REJECTED', 'LOST', 'DISBURSED'] as const;

export const CONVERTED_STATUSES = ['APPLICATION_CREATED', 'SANCTIONED', 'DISBURSED'] as const;

export const SCORING_FACTOR_WEIGHTS = {
  income: 0.15,
  propertyValue: 0.12,
  vehicleValue: 0.08,
  businessTurnover: 0.12,
  loanAmount: 0.1,
  location: 0.08,
  occupation: 0.07,
  productType: 0.08,
  creditScore: 0.2,
} as const;

export const DEFAULT_MODEL_VERSION = 'lms-v1.0';
