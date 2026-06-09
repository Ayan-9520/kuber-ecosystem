import type { PrismaClient } from '@prisma/client';
import { Prisma, ProductPriority, ProductVariantCode } from '@prisma/client';

const FAMILIES = [
  { code: 'HL', name: 'Home Loan', isSecured: true, displayOrder: 1 },
  { code: 'LAP', name: 'Loan Against Property', isSecured: true, displayOrder: 2 },
  { code: 'BL', name: 'Business Loan', isSecured: false, displayOrder: 3 },
  { code: 'AL', name: 'Auto Loan', isSecured: true, displayOrder: 4 },
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
];

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

    const savedProduct = await prisma.product.upsert({
      where: { code: product.code },
      update: {
        name: product.name,
        minAmount: product.minAmount,
        maxAmount: product.maxAmount,
        minTenureMonths: product.minTenureMonths,
        maxTenureMonths: product.maxTenureMonths,
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
        priority: product.priority,
      },
    });

    for (const variant of product.variants) {
      await prisma.productVariant.upsert({
        where: {
          productId_variantCode: {
            productId: savedProduct.id,
            variantCode: variant.variantCode,
          },
        },
        update: { name: variant.name },
        create: {
          productId: savedProduct.id,
          variantCode: variant.variantCode,
          name: variant.name,
        },
      });
    }
  }

  console.log('  → product_families, products, product_variants seeded');
}
