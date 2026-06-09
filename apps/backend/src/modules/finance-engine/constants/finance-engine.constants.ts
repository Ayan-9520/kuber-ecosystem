export const FINANCE_ENGINE_VERSION = '1.0.0';

export const CACHE_TTL_MS = 15 * 60 * 1000;

export const DEFAULT_FOIR_CAP_PCT = 60;

export const DEFAULT_LTV_CAPS: Record<string, number> = {
  HOME_LOAN: 80,
  HOME_LOAN_BT: 80,
  HOME_LOAN_TOP_UP: 75,
  HOME_LOAN_BT_TOP_UP: 75,
  LAP: 70,
  LAP_BT: 70,
  LAP_TOP_UP: 65,
  LAP_BT_TOP_UP: 65,
  BUSINESS_LOAN: 0,
  MSME_LOAN: 0,
  WORKING_CAPITAL: 0,
  OD: 0,
  CC: 0,
  NEW_CAR_LOAN: 90,
  USED_CAR_LOAN: 85,
  COMMERCIAL_VEHICLE: 85,
  EV_LOAN: 90,
  CAR_LOAN_BT: 90,
  CAR_LOAN_TOP_UP: 85,
  CAR_REFINANCE: 90,
};

export const BT_PRODUCT_SLUGS = new Set([
  'HOME_LOAN_BT',
  'HOME_LOAN_BT_TOP_UP',
  'LAP_BT',
  'LAP_BT_TOP_UP',
  'CAR_LOAN_BT',
  'CAR_REFINANCE',
]);

export const PRODUCT_SLUG_MAP: Record<
  string,
  { productCode: string; variantCode: string }
> = {
  HOME_LOAN: { productCode: 'HL-01', variantCode: 'FRESH' },
  HOME_LOAN_BT: { productCode: 'HL-01', variantCode: 'BT' },
  HOME_LOAN_TOP_UP: { productCode: 'HL-01', variantCode: 'TOP_UP' },
  HOME_LOAN_BT_TOP_UP: { productCode: 'HL-01', variantCode: 'BT_TOP_UP' },
  LAP: { productCode: 'LAP-01', variantCode: 'FRESH' },
  LAP_BT: { productCode: 'LAP-01', variantCode: 'BT' },
  LAP_TOP_UP: { productCode: 'LAP-01', variantCode: 'TOP_UP' },
  LAP_BT_TOP_UP: { productCode: 'LAP-01', variantCode: 'BT_TOP_UP' },
  BUSINESS_LOAN: { productCode: 'BL-01', variantCode: 'FRESH' },
  MSME_LOAN: { productCode: 'BL-02', variantCode: 'FRESH' },
  WORKING_CAPITAL: { productCode: 'BL-03', variantCode: 'WORKING_CAPITAL' },
  OD: { productCode: 'BL-04', variantCode: 'OD' },
  CC: { productCode: 'BL-05', variantCode: 'CC' },
  NEW_CAR_LOAN: { productCode: 'AL-01', variantCode: 'FRESH' },
  USED_CAR_LOAN: { productCode: 'AL-02', variantCode: 'FRESH' },
  COMMERCIAL_VEHICLE: { productCode: 'AL-03', variantCode: 'FRESH' },
  EV_LOAN: { productCode: 'AL-04', variantCode: 'FRESH' },
  CAR_LOAN_BT: { productCode: 'AL-05', variantCode: 'BT' },
  CAR_LOAN_TOP_UP: { productCode: 'AL-06', variantCode: 'TOP_UP' },
  CAR_REFINANCE: { productCode: 'AL-07', variantCode: 'BT_TOP_UP' },
};

export const APPROVAL_GRADE_THRESHOLDS = {
  A_PLUS: 90,
  A: 80,
  B: 65,
  C: 50,
} as const;
