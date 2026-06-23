import type { PrismaClient } from '@prisma/client';
import { Prisma, ProductPriority, ProductVariantCode } from '@prisma/client';

const FAMILIES = [
  { code: 'HL', name: 'Home Loan', isSecured: true, displayOrder: 1 },
  { code: 'LAP', name: 'Loan Against Property', isSecured: true, displayOrder: 2 },
  { code: 'PL', name: 'Personal Loan', isSecured: false, displayOrder: 3 },
  { code: 'BL', name: 'Business Loan', isSecured: false, displayOrder: 4 },
  { code: 'AL', name: 'Auto Loan', isSecured: true, displayOrder: 5 },
  { code: 'ML', name: 'Machinery Loan', isSecured: true, displayOrder: 6 },
  { code: 'INS', name: 'Insurance', isSecured: false, displayOrder: 7 },
  { code: 'CC', name: 'Credit Cards', isSecured: false, displayOrder: 8 },
];

type ProductSeed = {
  familyCode: string;
  code: string;
  name: string;
  minAmount: Prisma.Decimal;
  maxAmount: Prisma.Decimal;
  minTenureMonths: number;
  maxTenureMonths: number;
  priority: ProductPriority;
  variants: { variantCode: ProductVariantCode; name: string }[];
};

const PRODUCTS: ProductSeed[] = [
  {
    familyCode: 'HL',
    code: 'HL-01',
    name: 'Home Loan',
    minAmount: new Prisma.Decimal(500000),
    maxAmount: new Prisma.Decimal(50000000),
    minTenureMonths: 60,
    maxTenureMonths: 360,
    priority: ProductPriority.P0,
    variants: [
      { variantCode: ProductVariantCode.FRESH, name: 'Fresh Home Loan' },
      { variantCode: ProductVariantCode.BT, name: 'Home Loan Balance Transfer' },
      { variantCode: ProductVariantCode.TOP_UP, name: 'Home Loan Top-Up' },
      { variantCode: ProductVariantCode.BT_TOP_UP, name: 'Home Loan BT + Top-Up' },
    ],
  },
  {
    familyCode: 'LAP',
    code: 'LAP-01',
    name: 'Loan Against Property',
    minAmount: new Prisma.Decimal(500000),
    maxAmount: new Prisma.Decimal(100000000),
    minTenureMonths: 12,
    maxTenureMonths: 180,
    priority: ProductPriority.P1,
    variants: [
      { variantCode: ProductVariantCode.FRESH, name: 'Fresh LAP' },
      { variantCode: ProductVariantCode.BT, name: 'LAP Balance Transfer' },
      { variantCode: ProductVariantCode.TOP_UP, name: 'LAP Top-Up' },
      { variantCode: ProductVariantCode.BT_TOP_UP, name: 'LAP BT + Top-Up' },
    ],
  },
  {
    familyCode: 'BL',
    code: 'BL-01',
    name: 'Business Loan',
    minAmount: new Prisma.Decimal(100000),
    maxAmount: new Prisma.Decimal(50000000),
    minTenureMonths: 12,
    maxTenureMonths: 84,
    priority: ProductPriority.P1,
    variants: [{ variantCode: ProductVariantCode.FRESH, name: 'Business Loan' }],
  },
  {
    familyCode: 'BL',
    code: 'BL-02',
    name: 'MSME Loan',
    minAmount: new Prisma.Decimal(100000),
    maxAmount: new Prisma.Decimal(25000000),
    minTenureMonths: 12,
    maxTenureMonths: 60,
    priority: ProductPriority.P1,
    variants: [{ variantCode: ProductVariantCode.FRESH, name: 'MSME Loan' }],
  },
  {
    familyCode: 'BL',
    code: 'BL-03',
    name: 'Working Capital Loan',
    minAmount: new Prisma.Decimal(50000),
    maxAmount: new Prisma.Decimal(10000000),
    minTenureMonths: 12,
    maxTenureMonths: 36,
    priority: ProductPriority.P2,
    variants: [{ variantCode: ProductVariantCode.WORKING_CAPITAL, name: 'Working Capital Loan' }],
  },
  {
    familyCode: 'BL',
    code: 'BL-04',
    name: 'OD Assistance',
    minAmount: new Prisma.Decimal(50000),
    maxAmount: new Prisma.Decimal(5000000),
    minTenureMonths: 12,
    maxTenureMonths: 24,
    priority: ProductPriority.P2,
    variants: [{ variantCode: ProductVariantCode.OD, name: 'OD Assistance' }],
  },
  {
    familyCode: 'BL',
    code: 'BL-05',
    name: 'CC Assistance',
    minAmount: new Prisma.Decimal(50000),
    maxAmount: new Prisma.Decimal(5000000),
    minTenureMonths: 12,
    maxTenureMonths: 24,
    priority: ProductPriority.P2,
    variants: [{ variantCode: ProductVariantCode.CC, name: 'CC Assistance' }],
  },
  {
    familyCode: 'AL',
    code: 'AL-01',
    name: 'New Car Loan',
    minAmount: new Prisma.Decimal(100000),
    maxAmount: new Prisma.Decimal(10000000),
    minTenureMonths: 12,
    maxTenureMonths: 84,
    priority: ProductPriority.P1,
    variants: [{ variantCode: ProductVariantCode.FRESH, name: 'New Car Loan' }],
  },
  {
    familyCode: 'AL',
    code: 'AL-02',
    name: 'Used Car Loan',
    minAmount: new Prisma.Decimal(50000),
    maxAmount: new Prisma.Decimal(5000000),
    minTenureMonths: 12,
    maxTenureMonths: 72,
    priority: ProductPriority.P1,
    variants: [{ variantCode: ProductVariantCode.FRESH, name: 'Used Car Loan' }],
  },
  {
    familyCode: 'AL',
    code: 'AL-03',
    name: 'Commercial Vehicle Loan',
    minAmount: new Prisma.Decimal(200000),
    maxAmount: new Prisma.Decimal(20000000),
    minTenureMonths: 12,
    maxTenureMonths: 84,
    priority: ProductPriority.P1,
    variants: [{ variantCode: ProductVariantCode.FRESH, name: 'Commercial Vehicle Loan' }],
  },
  {
    familyCode: 'AL',
    code: 'AL-04',
    name: 'EV Loan',
    minAmount: new Prisma.Decimal(100000),
    maxAmount: new Prisma.Decimal(8000000),
    minTenureMonths: 12,
    maxTenureMonths: 84,
    priority: ProductPriority.P1,
    variants: [{ variantCode: ProductVariantCode.FRESH, name: 'EV Loan' }],
  },
  {
    familyCode: 'AL',
    code: 'AL-05',
    name: 'Car Loan Balance Transfer',
    minAmount: new Prisma.Decimal(100000),
    maxAmount: new Prisma.Decimal(10000000),
    minTenureMonths: 12,
    maxTenureMonths: 84,
    priority: ProductPriority.P2,
    variants: [{ variantCode: ProductVariantCode.BT, name: 'Car Loan Balance Transfer' }],
  },
  {
    familyCode: 'AL',
    code: 'AL-06',
    name: 'Car Loan Top-Up',
    minAmount: new Prisma.Decimal(50000),
    maxAmount: new Prisma.Decimal(3000000),
    minTenureMonths: 12,
    maxTenureMonths: 60,
    priority: ProductPriority.P2,
    variants: [{ variantCode: ProductVariantCode.TOP_UP, name: 'Car Loan Top-Up' }],
  },
  {
    familyCode: 'AL',
    code: 'AL-07',
    name: 'Car Refinance',
    minAmount: new Prisma.Decimal(100000),
    maxAmount: new Prisma.Decimal(10000000),
    minTenureMonths: 12,
    maxTenureMonths: 84,
    priority: ProductPriority.P2,
    variants: [{ variantCode: ProductVariantCode.BT_TOP_UP, name: 'Car Refinance' }],
  },
  {
    familyCode: 'PL',
    code: 'PL-01',
    name: 'Personal Loan',
    minAmount: new Prisma.Decimal(50000),
    maxAmount: new Prisma.Decimal(4000000),
    minTenureMonths: 12,
    maxTenureMonths: 60,
    priority: ProductPriority.P0,
    variants: [{ variantCode: ProductVariantCode.FRESH, name: 'Personal Loan' }],
  },
  {
    familyCode: 'ML',
    code: 'ML-01',
    name: 'Machinery Loan',
    minAmount: new Prisma.Decimal(500000),
    maxAmount: new Prisma.Decimal(50000000),
    minTenureMonths: 12,
    maxTenureMonths: 84,
    priority: ProductPriority.P1,
    variants: [{ variantCode: ProductVariantCode.FRESH, name: 'Machinery Loan' }],
  },
  {
    familyCode: 'INS',
    code: 'INS-01',
    name: 'Insurance',
    minAmount: new Prisma.Decimal(10000),
    maxAmount: new Prisma.Decimal(50000000),
    minTenureMonths: 12,
    maxTenureMonths: 360,
    priority: ProductPriority.P1,
    variants: [{ variantCode: ProductVariantCode.FRESH, name: 'Life & General Insurance' }],
  },
  {
    familyCode: 'CC',
    code: 'CC-01',
    name: 'Credit Card',
    minAmount: new Prisma.Decimal(10000),
    maxAmount: new Prisma.Decimal(1000000),
    minTenureMonths: 12,
    maxTenureMonths: 60,
    priority: ProductPriority.P1,
    variants: [{ variantCode: ProductVariantCode.FRESH, name: 'Credit Card' }],
  },
];

const RATES_BY_FAMILY: Record<string, { min: number; max: number }> = {
  HL: { min: 8.4, max: 10.5 },
  LAP: { min: 9.0, max: 11.5 },
  AL: { min: 8.75, max: 12.5 },
  PL: { min: 10.5, max: 18.0 },
  BL: { min: 11.0, max: 16.0 },
  ML: { min: 10.0, max: 14.0 },
  INS: { min: 0, max: 0 },
  CC: { min: 0, max: 0 },
};

function buildVariantConfig(familyCode: string, productCode: string, variantName: string): Prisma.InputJsonValue {
  const docsByFamily: Record<string, string[]> = {
    HL: ['PAN', 'Aadhaar', 'Salary slips', 'Bank statements', 'Property papers'],
    LAP: ['PAN', 'Aadhaar', 'Property documents', 'Bank statements', 'ITR'],
    PL: ['PAN', 'Aadhaar', 'Salary slips', 'Bank statements'],
    BL: ['PAN', 'Aadhaar', 'GST certificate', 'Business proof', 'Bank statements', 'ITR'],
    AL: ['PAN', 'Aadhaar', 'Invoice / RC', 'Bank statements', 'Income proof'],
    ML: ['PAN', 'Aadhaar', 'Quotation', 'Business proof', 'Bank statements'],
    INS: ['PAN', 'Aadhaar', 'Age proof', 'Medical reports (if applicable)'],
    CC: ['PAN', 'Aadhaar', 'Salary slips', 'Bank statements'],
  };

  return {
    documents: docsByFamily[familyCode] ?? ['PAN', 'Aadhaar', 'Income proof', 'Bank statements'],
    features: [
      variantName,
      productCode.startsWith('AL-02') ? 'Up to 72 months tenure' : 'Flexible repayment',
      'Digital application & tracking',
    ],
  };
}

export async function seedProducts(prisma: PrismaClient): Promise<void> {
  for (const family of FAMILIES) {
    await prisma.productFamily.upsert({
      where: { code: family.code },
      update: {
        name: family.name,
        isSecured: family.isSecured,
        displayOrder: family.displayOrder,
      },
      create: family,
    });
  }

  for (const product of PRODUCTS) {
    const family = await prisma.productFamily.findUnique({
      where: { code: product.familyCode },
    });
    if (!family) continue;

    const rates = RATES_BY_FAMILY[product.familyCode] ?? { min: 8.5, max: 12 };

    const savedProduct = await prisma.product.upsert({
      where: { code: product.code },
      update: {
        name: product.name,
        minAmount: product.minAmount,
        maxAmount: product.maxAmount,
        minTenureMonths: product.minTenureMonths,
        maxTenureMonths: product.maxTenureMonths,
        minInterestRate: new Prisma.Decimal(rates.min),
        maxInterestRate: new Prisma.Decimal(rates.max),
        priority: product.priority,
        familyId: family.id,
      },
      create: {
        familyId: family.id,
        code: product.code,
        name: product.name,
        minAmount: product.minAmount,
        maxAmount: product.maxAmount,
        minTenureMonths: product.minTenureMonths,
        maxTenureMonths: product.maxTenureMonths,
        minInterestRate: new Prisma.Decimal(rates.min),
        maxInterestRate: new Prisma.Decimal(rates.max),
        priority: product.priority,
      },
    });

    for (const variant of product.variants) {
      const config = buildVariantConfig(product.familyCode, product.code, variant.name);
      await prisma.productVariant.upsert({
        where: {
          productId_variantCode: {
            productId: savedProduct.id,
            variantCode: variant.variantCode,
          },
        },
        update: { name: variant.name, config },
        create: {
          productId: savedProduct.id,
          variantCode: variant.variantCode,
          name: variant.name,
          config,
        },
      });
    }
  }

  console.log('  → product_families, products, product_variants seeded');
}
