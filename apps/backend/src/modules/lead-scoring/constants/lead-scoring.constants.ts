export const SCORING_MODEL_VERSION = 'lms-v2.0';
export const DEFAULT_WEIGHT_VERSION = 'v2.0';

export const GRADE_THRESHOLDS = {
  A_PLUS: 90,
  A: 75,
  B: 50,
  C: 20,
  REJECTED: 0,
} as const;

export const GRADE_CLASSIFICATIONS: Record<string, string> = {
  A_PLUS: 'Premium Lead',
  A: 'High Quality Lead',
  B: 'Moderate Lead',
  C: 'Low Quality Lead',
  REJECTED: 'Not Eligible',
};

export const DEFAULT_FACTOR_WEIGHTS: Record<string, number> = {
  income: 0.12,
  occupation: 0.05,
  employmentType: 0.06,
  businessVintage: 0.04,
  turnover: 0.08,
  propertyValue: 0.1,
  vehicleValue: 0.05,
  loanRequirement: 0.08,
  foir: 0.1,
  ltv: 0.08,
  dscr: 0.06,
  cibil: 0.15,
  location: 0.05,
  existingLoans: 0.04,
  bankingBehaviour: 0.03,
  documentCompleteness: 0.06,
  productType: 0.05,
  referralSource: 0.03,
  partnerQuality: 0.04,
  leadSource: 0.03,
  applicationStage: 0.04,
};

export const RISK_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 90,
} as const;

export const PRIORITY_THRESHOLDS = {
  HOT: 85,
  WARM: 65,
  NORMAL: 40,
  LOW: 0,
} as const;

export const SCORING_AUDIT_ACTIONS = {
  SCORE_CALCULATED: 'SCORE_CALCULATED',
  BULK_SCORE_CALCULATED: 'BULK_SCORE_CALCULATED',
  RULE_CREATED: 'RULE_CREATED',
  RULE_UPDATED: 'RULE_UPDATED',
  WEIGHT_CREATED: 'WEIGHT_CREATED',
  WEIGHT_UPDATED: 'WEIGHT_UPDATED',
} as const;

export const TIER1_CITIES = ['MUMBAI', 'DELHI', 'BANGALORE', 'BENGALURU', 'HYDERABAD', 'CHENNAI', 'PUNE', 'KOLKATA'];
