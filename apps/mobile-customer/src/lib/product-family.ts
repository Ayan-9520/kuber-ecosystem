/** Product family codes from API (`product.family.code`). */
export type ProductFamilyCode = 'HL' | 'LAP' | 'PL' | 'BL' | 'AL' | 'ML' | 'INS' | 'CC';

export type WizardProfile =
  | 'property'
  | 'vehicle'
  | 'personal'
  | 'business'
  | 'insurance'
  | 'credit_card';

export const CATALOG_ENTRIES = [
  {
    productCode: 'HL-01',
    label: 'Home Loan',
    variantCode: 'FRESH',
    description: 'Buy or build your dream home with long tenure and tax benefits under Section 80C & 24(b)',
    rateMin: 8.4,
    rateMax: 10.5,
    icon: 'home' as const,
    maxAmount: 50_000_000,
    highlights: ['Up to 30 years tenure', 'Balance transfer & top-up available', 'Digital sanction tracking'],
    documents: ['PAN', 'Aadhaar', 'Salary slips', 'Bank statements', 'Property papers'],
  },
  {
    productCode: 'LAP-01',
    label: 'Loan Against Property',
    variantCode: 'FRESH',
    description: 'Unlock residential or commercial property value for business or personal needs',
    rateMin: 9.0,
    rateMax: 11.5,
    icon: 'business' as const,
    maxAmount: 100_000_000,
    highlights: ['Up to 70% LTV on property', 'Flexible end-use funds', 'Competitive LAP rates'],
    documents: ['PAN', 'Aadhaar', 'Property documents', 'Bank statements', 'ITR'],
  },
  {
    productCode: 'AL-01',
    label: 'New Car Loan',
    variantCode: 'FRESH',
    description: 'Finance a brand-new car with up to 90% on-road funding',
    rateMin: 8.75,
    rateMax: 11.0,
    icon: 'car' as const,
    maxAmount: 10_000_000,
    highlights: ['Up to 7 years tenure', 'New car dealer tie-ups', 'Quick in-principle approval'],
    documents: ['PAN', 'Aadhaar', 'Invoice / proforma', 'Bank statements', 'Income proof'],
  },
  {
    productCode: 'AL-02',
    label: 'Used Car Loan',
    variantCode: 'FRESH',
    description: 'Affordable financing for certified pre-owned cars',
    rateMin: 9.5,
    rateMax: 12.5,
    icon: 'car-sport' as const,
    maxAmount: 5_000_000,
    highlights: ['Cars up to 10 years old', 'Valuation-assisted limits', 'Fast RC transfer support'],
    documents: ['PAN', 'Aadhaar', 'RC & insurance', 'Bank statements', 'Income proof'],
  },
  {
    productCode: 'PL-01',
    label: 'Personal Loan',
    variantCode: 'FRESH',
    description: 'Instant unsecured funds for medical, travel, wedding or consolidation',
    rateMin: 10.5,
    rateMax: 18.0,
    icon: 'cash' as const,
    maxAmount: 4_000_000,
    highlights: ['No collateral required', 'Disbursal in 24–48 hours', 'Flexible EMI options'],
    documents: ['PAN', 'Aadhaar', 'Salary slips', 'Bank statements'],
  },
  {
    productCode: 'BL-01',
    label: 'Business Loan',
    variantCode: 'FRESH',
    description: 'Working capital and term loans for MSMEs and growing businesses',
    rateMin: 11.0,
    rateMax: 16.0,
    icon: 'briefcase' as const,
    maxAmount: 50_000_000,
    highlights: ['GST-based assessment', 'OD / term loan options', 'Dedicated RM support'],
    documents: ['PAN', 'Aadhaar', 'GST certificate', 'Business proof', 'Bank statements', 'ITR'],
  },
  {
    productCode: 'ML-01',
    label: 'Machinery Loan',
    variantCode: 'FRESH',
    description: 'Finance plant, equipment and machinery for manufacturing units',
    rateMin: 10.0,
    rateMax: 14.0,
    icon: 'construct' as const,
    maxAmount: 50_000_000,
    highlights: ['Asset-backed funding', 'Vendor quotation based', 'Up to 7 year tenure'],
    documents: ['PAN', 'Aadhaar', 'Machine quotation', 'Business proof', 'Bank statements'],
  },
  {
    productCode: 'INS-01',
    label: 'Insurance',
    variantCode: 'FRESH',
    description: 'Life, health and motor insurance from leading insurers in India',
    rateMin: 0,
    rateMax: 0,
    icon: 'shield-checkmark' as const,
    maxAmount: 50_000_000,
    highlights: ['Term, health & motor plans', 'Nominee & rider options', 'Policy issued digitally'],
    documents: ['PAN', 'Aadhaar', 'Age proof', 'Medical reports (if applicable)'],
  },
  {
    productCode: 'CC-01',
    label: 'Credit Cards',
    variantCode: 'FRESH',
    description: 'Lifetime-free, rewards and premium cards from HDFC, ICICI, SBI & more',
    rateMin: 0,
    rateMax: 0,
    icon: 'card' as const,
    maxAmount: 1_000_000,
    highlights: [
      'Rewards, cashback & travel benefits',
      'Lifetime-free cards available',
      'Instant eligibility check',
    ],
    documents: ['PAN', 'Aadhaar', 'Salary slips', 'Bank statements'],
  },
] as const;

export function resolveFamilyCode(product: Record<string, unknown> | undefined): string {
  if (!product) return '';
  const family = product.family as Record<string, unknown> | undefined;
  if (family?.code) return String(family.code).toUpperCase();
  const code = String(product.code ?? '').toUpperCase();
  if (code.startsWith('HL')) return 'HL';
  if (code.startsWith('LAP')) return 'LAP';
  if (code.startsWith('PL')) return 'PL';
  if (code.startsWith('BL')) return 'BL';
  if (code.startsWith('AL')) return 'AL';
  if (code.startsWith('ML')) return 'ML';
  if (code.startsWith('INS')) return 'INS';
  if (code.startsWith('CC')) return 'CC';
  return code.split('-')[0] ?? '';
}

export function wizardProfileForFamily(familyCode: string, productCode?: string): WizardProfile {
  const family = familyCode.toUpperCase();
  const code = (productCode ?? '').toUpperCase();
  if (family === 'HL' || family === 'LAP') return 'property';
  if (family === 'AL') return 'vehicle';
  if (family === 'PL') return 'personal';
  if (family === 'BL' || family === 'ML') return 'business';
  if (family === 'INS') return 'insurance';
  if (family === 'CC') return 'credit_card';
  if (code.startsWith('HL') || code.startsWith('LAP')) return 'property';
  if (code.startsWith('AL')) return 'vehicle';
  return 'personal';
}

export function collateralModeForProfile(profile: WizardProfile): 'property' | 'vehicle' | 'none' {
  if (profile === 'property') return 'property';
  if (profile === 'vehicle') return 'vehicle';
  return 'none';
}

export type WizardStepKey =
  | 'personal'
  | 'employment'
  | 'income'
  | 'collateral'
  | 'business'
  | 'insurance'
  | 'credit_card'
  | 'documents'
  | 'review';

export function wizardStepsForProfile(profile: WizardProfile): WizardStepKey[] {
  const steps: WizardStepKey[] = ['personal', 'employment', 'income'];
  if (profile === 'property' || profile === 'vehicle') steps.push('collateral');
  else if (profile === 'business') steps.push('business');
  else if (profile === 'insurance') steps.push('insurance');
  else if (profile === 'credit_card') steps.push('credit_card');
  steps.push('documents', 'review');
  return steps;
}
