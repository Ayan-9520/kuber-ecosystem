import type { Ionicons } from '@expo/vector-icons';

import { productsService } from '@/services/products.service';

export type ApiProduct = Record<string, unknown>;
export type ApiVariant = Record<string, unknown>;

export interface ProductDisplayItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  productName: string;
  variant: string;
  variantId?: string;
  description: string;
  interestMin: number;
  interestMax: number;
  maxAmount: number;
  icon: keyof typeof Ionicons.glyphMap;
  features: string[];
  documents: string[];
}

const ICON_BY_CODE: Record<string, keyof typeof Ionicons.glyphMap> = {
  HL: 'home',
  HOME: 'home',
  LAP: 'business',
  BL: 'briefcase',
  BUS: 'briefcase',
  AL: 'car',
  AUTO: 'car',
  EV: 'flash',
  UC: 'car-sport',
  CV: 'bus',
};

export function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function productSlug(code: unknown): string {
  return String(code ?? '').toUpperCase();
}

export function productIcon(code?: string): keyof typeof Ionicons.glyphMap {
  const c = (code ?? '').toUpperCase();
  for (const [key, icon] of Object.entries(ICON_BY_CODE)) {
    if (c.includes(key)) return icon;
  }
  return 'cash';
}

function variantConfig(variant?: ApiVariant): Record<string, unknown> | undefined {
  const config = variant?.config;
  return config && typeof config === 'object' ? (config as Record<string, unknown>) : undefined;
}

export function mapProductToDisplay(product: ApiProduct, variant?: ApiVariant): ProductDisplayItem {
  const slug = productSlug(product.code);
  const variantCode = variant ? String(variant.variantCode ?? 'FRESH') : 'FRESH';
  const productName = String(product.name ?? 'Loan Product');
  const variantName = variant ? String(variant.name ?? variantCode) : productName;
  const description = String(variant?.description ?? product.description ?? '');
  const config = variantConfig(variant);

  const features = Array.isArray(config?.features)
    ? (config.features as string[])
    : [
        `Up to ${Math.max(1, Math.round(num(product.maxTenureMonths, 240) / 12))} years tenure`,
        description || 'Flexible repayment options',
      ].filter(Boolean);

  const documents = Array.isArray(config?.documents)
    ? (config.documents as string[])
    : ['PAN', 'Aadhaar', 'Income proof', 'Bank statements'];

  return {
    id: variant ? String(variant.id) : String(product.id),
    productId: String(product.id),
    slug,
    name: variant ? variantName : productName,
    productName,
    variant: variantCode,
    variantId: variant ? String(variant.id) : undefined,
    description,
    interestMin: num(product.minInterestRate, 8),
    interestMax: num(product.maxInterestRate, 12),
    maxAmount: num(product.maxAmount, 0),
    icon: productIcon(slug),
    features,
    documents,
  };
}

export function flattenProductsWithVariants(
  products: ApiProduct[],
  variants: ApiVariant[],
): ProductDisplayItem[] {
  const items: ProductDisplayItem[] = [];
  for (const product of products) {
    const productVariants = variants.filter((v) => String(v.productId) === String(product.id));
    if (productVariants.length === 0) {
      items.push(mapProductToDisplay(product));
    } else {
      for (const variant of productVariants) {
        items.push(mapProductToDisplay(product, variant));
      }
    }
  }
  return items;
}

export function toFinanceProductSlug(slug: string, variant: string): string {
  if (slug === 'HOME_LOAN' || slug === 'HL') {
    if (variant === 'BT') return 'HOME_LOAN_BT';
    if (variant === 'TOP_UP') return 'HOME_LOAN_TOP_UP';
    return 'HOME_LOAN';
  }
  if ((slug === 'BUSINESS_LOAN' || slug === 'BL') && variant === 'WORKING_CAPITAL') {
    return 'WORKING_CAPITAL';
  }
  if (slug === 'AUTO_LOAN' || slug === 'AL') return 'NEW_CAR_LOAN';
  if (slug === 'COMMERCIAL_VEHICLE_LOAN' || slug === 'CV') return 'COMMERCIAL_VEHICLE';
  return slug;
}

export function findProductDisplayItem(
  items: ProductDisplayItem[],
  opts: { slug?: string; id?: string; name?: string; variant?: string },
): ProductDisplayItem | undefined {
  if (opts.id) {
    const byId =
      items.find((i) => i.productId === opts.id) ?? items.find((i) => i.id === opts.id);
    if (byId) return byId;
  }

  const normalizedSlug = opts.slug?.toUpperCase();
  const variant = opts.variant?.toUpperCase();

  return (
    items.find(
      (i) =>
        i.slug === normalizedSlug &&
        i.name === opts.name &&
        (!variant || i.variant === variant),
    ) ??
    items.find((i) => i.slug === normalizedSlug && (!variant || i.variant === variant)) ??
    items.find(
      (i) =>
        i.slug === normalizedSlug &&
        i.name.toLowerCase() === (opts.name?.toLowerCase() ?? ''),
    ) ??
    items.find((i) => i.slug === normalizedSlug)
  );
}

export async function resolveProductFromApi(opts: {
  slug?: string;
  id?: string;
  variant?: string;
}): Promise<ProductDisplayItem | null> {
  if (opts.id) {
    const product = await productsService.getById(opts.id);
    const variants = await productsService.variants(opts.id);
    const variant =
      variants.items.find((v) => String(v.variantCode).toUpperCase() === opts.variant?.toUpperCase()) ??
      variants.items[0];
    return mapProductToDisplay(product, variant);
  }

  if (!opts.slug) return null;

  const list = await productsService.list({ limit: 50 });
  const normalized = opts.slug.toUpperCase();
  const product =
    list.items.find((p) => String(p.code).toUpperCase() === normalized) ??
    list.items.find((p) => String(p.id) === opts.slug) ??
    list.items.find((p) => String(p.code).toUpperCase().includes(normalized.split('_')[0] ?? ''));

  if (!product) return null;

  const variants = await productsService.variants(String(product.id));
  const variant =
    variants.items.find((v) => String(v.variantCode).toUpperCase() === opts.variant?.toUpperCase()) ??
    variants.items.find((v) => String(v.name).toUpperCase().includes(opts.variant?.toUpperCase() ?? '')) ??
    variants.items[0];

  return mapProductToDisplay(product, variant);
}
