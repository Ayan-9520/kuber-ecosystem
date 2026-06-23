import type { Ionicons } from '@expo/vector-icons';

import { productsService } from '@/services/products.service';

import { CATALOG_ENTRIES } from './product-family';
import { enrichProductDisplay } from './product-display';

export type ApiProduct = Record<string, unknown>;
export type ApiVariant = Record<string, unknown>;

export interface ProductDisplayItem {
  id: string;
  productId: string;
  slug: string;
  familyCode: string;
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
  PL: 'cash',
  BL: 'briefcase',
  BUS: 'briefcase',
  ML: 'construct',
  INS: 'shield-checkmark',
  CC: 'card',
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

/** Use API rate when present and > 0, otherwise catalog/default. */
export function rateOrDefault(v: unknown, fallback: number): number {
  if (v === null || v === undefined || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function productSlug(code: unknown): string {
  return String(code ?? '').toUpperCase();
}

export function productIcon(familyOrCode?: string): keyof typeof Ionicons.glyphMap {
  const c = (familyOrCode ?? '').toUpperCase();
  if (ICON_BY_CODE[c]) return ICON_BY_CODE[c];
  for (const [key, icon] of Object.entries(ICON_BY_CODE)) {
    if (c.includes(key)) return icon;
  }
  return 'cash';
}

function variantConfig(variant?: ApiVariant): Record<string, unknown> | undefined {
  const config = variant?.config;
  return config && typeof config === 'object' ? (config as Record<string, unknown>) : undefined;
}

export function mapProductToDisplay(
  product: ApiProduct,
  variant?: ApiVariant,
  catalog?: (typeof CATALOG_ENTRIES)[number],
): ProductDisplayItem {
  const slug = productSlug(product.code);
  const family = product.family as Record<string, unknown> | undefined;
  const familyCode = String(family?.code ?? slug.split('-')[0] ?? '').toUpperCase();
  const variantCode = variant ? String(variant.variantCode ?? 'FRESH') : 'FRESH';
  const productName = String(product.name ?? catalog?.label ?? 'Loan Product');
  const displayName = catalog?.label ?? productName;
  const description =
    catalog?.description ??
    String(variant?.description ?? product.description ?? 'Flexible repayment with digital tracking');
  const config = variantConfig(variant);

  const documents: string[] = Array.isArray(config?.documents)
    ? (config.documents as string[])
    : [...(catalog?.documents ?? ['PAN', 'Aadhaar', 'Income proof', 'Bank statements'])];

  const defaultFeatures: string[] = [...(catalog?.highlights ?? [
    displayName,
    `Up to ${Math.max(1, Math.round(num(product.maxTenureMonths, 240) / 12))} years tenure`,
    'Quick digital application',
  ])];

  const configFeatures = Array.isArray(config?.features) ? (config.features as string[]) : null;
  const features =
    configFeatures && !configFeatures.some((f) => /flexible repayment|digital application/i.test(f))
      ? configFeatures
      : defaultFeatures;

  const rateMin = rateOrDefault(product.minInterestRate, catalog?.rateMin ?? 8.5);
  const rateMax = rateOrDefault(product.maxInterestRate, catalog?.rateMax ?? 12);

  return enrichProductDisplay({
    id: variant ? String(variant.id) : String(product.id),
    productId: String(product.id),
    slug,
    familyCode,
    name: displayName,
    productName,
    variant: variantCode,
    variantId: variant ? String(variant.id) : undefined,
    description,
    interestMin: rateMin,
    interestMax: rateMax,
    maxAmount: num(product.maxAmount, catalog?.maxAmount ?? 0),
    icon: catalog?.icon ?? productIcon(familyCode),
    features,
    documents,
  });
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

/** Pick the 9 flagship catalog products for the customer Products tab. */
export function pickCatalogProducts(
  products: ApiProduct[],
  variants: ApiVariant[],
): ProductDisplayItem[] {
  const items: ProductDisplayItem[] = [];
  for (const entry of CATALOG_ENTRIES) {
    const product = products.find((p) => String(p.code).toUpperCase() === entry.productCode);
    if (!product) continue;
    const variant =
      variants.find(
        (v) =>
          String(v.productId) === String(product.id) &&
          String(v.variantCode).toUpperCase() === entry.variantCode,
      ) ?? variants.find((v) => String(v.productId) === String(product.id));
    items.push(mapProductToDisplay(product, variant, entry));
  }
  return items;
}

function variantsFromProducts(products: ApiProduct[]): ApiVariant[] {
  return products.flatMap((product) => {
    const embedded = product.variants;
    return Array.isArray(embedded) ? (embedded as ApiVariant[]) : [];
  });
}

/** Static display fallback — keeps catalog visible if a network call fails. */
export function buildStaticCatalogFallback(apiProducts: ApiProduct[] = []): ProductDisplayItem[] {
  return CATALOG_ENTRIES.map((entry) => {
    const product = apiProducts.find((p) => String(p.code).toUpperCase() === entry.productCode);
    if (product) {
      const variant =
        variantsFromProducts([product]).find(
          (v) => String(v.variantCode).toUpperCase() === entry.variantCode,
        ) ?? variantsFromProducts([product])[0];
      return mapProductToDisplay(product, variant, entry);
    }

    const familyCode = entry.productCode.split('-')[0] ?? '';
    return {
      id: entry.productCode,
      productId: entry.productCode,
      slug: entry.productCode,
      familyCode,
      name: entry.label,
      productName: entry.label,
      variant: entry.variantCode,
      description: entry.description,
      interestMin: entry.rateMin,
      interestMax: entry.rateMax,
      maxAmount: entry.maxAmount,
      icon: entry.icon,
      features: [...entry.highlights],
      documents: [...entry.documents],
    };
  });
}

/** Load flagship catalog — single products API call, embedded variants, safe fallback. */
export async function fetchCustomerCatalog(): Promise<ProductDisplayItem[]> {
  let apiProducts: ApiProduct[] = [];

  try {
    const productsRes = await productsService.list({
      limit: 50,
      isActive: true,
      sortBy: 'createdAt',
      sortOrder: 'asc',
    });
    apiProducts = productsRes.items ?? [];
    const embeddedVariants = variantsFromProducts(apiProducts);
    let catalog = pickCatalogProducts(apiProducts, embeddedVariants);

    if (catalog.length === 0 && apiProducts.length > 0) {
      const variantsRes = await productsService.variants(undefined, { limit: 100 });
      catalog = pickCatalogProducts(apiProducts, variantsRes.items ?? []);
    }

    if (catalog.length > 0) return catalog;
  } catch {
    /* fall through to static catalog */
  }

  return buildStaticCatalogFallback(apiProducts);
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
  if (opts.id && /^[0-9a-f-]{36}$/i.test(opts.id)) {
    const product = await productsService.getById(opts.id);
    const variants = await productsService.variants(opts.id);
    const variant =
      variants.items.find((v) => String(v.variantCode).toUpperCase() === opts.variant?.toUpperCase()) ??
      variants.items[0];
    const entry = CATALOG_ENTRIES.find((e) => e.productCode === String(product.code).toUpperCase());
    return enrichProductDisplay(mapProductToDisplay(product, variant, entry));
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

  const entry = CATALOG_ENTRIES.find((e) => e.productCode === normalized);
  return enrichProductDisplay(mapProductToDisplay(product, variant, entry));
}
