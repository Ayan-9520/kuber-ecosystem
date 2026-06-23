import type { ProductDisplayItem } from './product-mapper';
import { CATALOG_ENTRIES } from './product-family';
import { formatCurrency } from './utils';

export type ProductFamilyMeta = {
  applyLabel: string;
  statPrimaryLabel: string;
  statPrimaryValue: (product: ProductDisplayItem) => string;
  statSecondaryLabel: string;
  statSecondaryValue: (product: ProductDisplayItem) => string;
  fundingLabel: string;
  rateLabel: string;
  processTitle: string;
  processSteps: string[];
};

const DEFAULT_META: ProductFamilyMeta = {
  applyLabel: 'Start Application',
  statPrimaryLabel: 'Interest rate',
  statPrimaryValue: (p) => `${p.interestMin}% – ${p.interestMax}% p.a.`,
  statSecondaryLabel: 'Max amount',
  statSecondaryValue: (p) => formatCurrency(p.maxAmount),
  fundingLabel: 'Max funding',
  rateLabel: 'Rate band',
  processTitle: 'How it works',
  processSteps: [
    'Fill your personal & income details',
    'Acknowledge required documents',
    'Submit — routed to credit & operations',
  ],
};

const FAMILY_META: Record<string, ProductFamilyMeta> = {
  HL: {
    ...DEFAULT_META,
    applyLabel: 'Apply for Home Loan',
    processSteps: [
      'Share applicant & property details',
      'Upload income & property documents',
      'Get sanction from partner banks',
    ],
  },
  LAP: {
    ...DEFAULT_META,
    applyLabel: 'Apply for LAP',
    processSteps: [
      'Property valuation & income assessment',
      'Document verification',
      'Loan sanction & disbursement',
    ],
  },
  AL: {
    ...DEFAULT_META,
    applyLabel: 'Apply for Car Loan',
    statSecondaryLabel: 'On-road budget up to',
    processSteps: [
      'Enter car details & loan amount',
      'Share employment & income proof',
      'Dealer disbursement after approval',
    ],
  },
  PL: {
    ...DEFAULT_META,
    applyLabel: 'Apply for Personal Loan',
    processSteps: [
      'Quick eligibility on income',
      'E-sign loan agreement digitally',
      'Amount credited within 24–48 hours',
    ],
  },
  BL: {
    ...DEFAULT_META,
    applyLabel: 'Apply for Business Loan',
    processSteps: [
      'Business turnover & GST details',
      'Financials & bank statement review',
      'MSME / working capital sanction',
    ],
  },
  ML: {
    ...DEFAULT_META,
    applyLabel: 'Apply for Machinery Loan',
    processSteps: [
      'Machine quotation & business profile',
      'Collateral & cash-flow assessment',
      'Asset-backed disbursement',
    ],
  },
  INS: {
    applyLabel: 'Get Insurance Quote',
    statPrimaryLabel: 'Coverage types',
    statPrimaryValue: () => 'Life, health & motor',
    statSecondaryLabel: 'Sum assured up to',
    statSecondaryValue: (p) => formatCurrency(p.maxAmount),
    fundingLabel: 'Max sum assured',
    rateLabel: 'Premium from',
    processTitle: 'How it works',
    processSteps: [
      'Choose policy type & sum assured',
      'Add nominee & health details',
      'Receive quotes from insurers',
    ],
  },
  CC: {
    applyLabel: 'Apply for Credit Card',
    statPrimaryLabel: 'Card benefits',
    statPrimaryValue: () => 'Rewards, cashback & lounge',
    statSecondaryLabel: 'Credit limit up to',
    statSecondaryValue: (p) => formatCurrency(p.maxAmount),
    fundingLabel: 'Credit limit',
    rateLabel: 'Annual fee',
    processTitle: 'How it works',
    processSteps: [
      'Verify PAN, income & employer',
      'Pick Rewards / Cashback / Premium',
      'Submit — matched to top banks',
    ],
  },
};

export function getProductFamilyMeta(familyCode: string): ProductFamilyMeta {
  return FAMILY_META[familyCode.toUpperCase()] ?? DEFAULT_META;
}

export function catalogEntryForSlug(slug?: string) {
  if (!slug) return undefined;
  return CATALOG_ENTRIES.find((e) => e.productCode === slug.toUpperCase());
}

function isGenericFeatureList(features: string[]): boolean {
  return (
    features.length <= 3 &&
    features.some((f) => /flexible repayment|digital application|tracking/i.test(f))
  );
}

export function enrichProductDisplay(item: ProductDisplayItem): ProductDisplayItem {
  const entry = catalogEntryForSlug(item.slug);
  if (!entry) return item;

  return {
    ...item,
    name: entry.label,
    productName: entry.label,
    description: entry.description,
    familyCode: item.familyCode || (entry.productCode.split('-')[0] ?? ''),
    interestMin: item.interestMin > 0 ? item.interestMin : entry.rateMin,
    interestMax: item.interestMax > 0 ? item.interestMax : entry.rateMax,
    maxAmount: item.maxAmount > 0 ? item.maxAmount : entry.maxAmount,
    icon: entry.icon,
    features: isGenericFeatureList(item.features) ? [...entry.highlights] : item.features,
    documents: entry.documents.length ? [...entry.documents] : item.documents,
  };
}

export function wizardParamsFromProduct(product: ProductDisplayItem) {
  const productId = /^[0-9a-f-]{36}$/i.test(product.productId) ? product.productId : undefined;
  return {
    productSlug: product.slug,
    productCode: product.slug,
    productName: product.name,
    variant: product.variant,
    familyCode: product.familyCode,
    productId,
    variantId: product.variantId,
  };
}
