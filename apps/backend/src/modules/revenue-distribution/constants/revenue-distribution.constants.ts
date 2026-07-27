import type { DistributionScope, StakeholderType } from '../types/revenue-distribution.types.js';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export const DEFAULT_GST_PERCENT = 18;
export const DEFAULT_TDS_PERCENT = 5;

/** Float tolerance when validating percentage share totals. */
export const SHARE_SUM_TOLERANCE = 0.01;

export const SCOPE_LABELS: Record<DistributionScope, string> = {
  PRODUCT: 'Product',
  LENDER: 'Lender',
  PARTNER_TIER: 'Partner tier',
  DEFAULT: 'Default',
  CUSTOM: 'Custom',
};

export const STAKEHOLDER_TYPE_LABELS: Record<StakeholderType, string> = {
  PARTNER: 'Financial Partner',
  CONNECTOR: 'Connector',
  BROKER: 'Broker',
  EMPLOYEE: 'Financial Professional',
  TEAM_LEADER: 'Business Mentor',
  SALES_MANAGER: 'Sales Manager',
  RELATIONSHIP_MANAGER: 'Relationship Manager',
  OPERATIONS: 'Operations',
  FINANCE: 'Finance',
  COMPANY: 'Company',
  REFERRAL: 'Referral',
  OTHER: 'Other',
};
