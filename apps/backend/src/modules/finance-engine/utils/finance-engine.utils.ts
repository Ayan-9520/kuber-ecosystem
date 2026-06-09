import { createHash } from 'crypto';

import type { Prisma } from '@kuberone/database';
import type { PaginatedMeta } from '@kuberone/shared-types';

import { prisma } from '../../../config/database.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { PRODUCT_SLUG_MAP } from '../constants/finance-engine.constants.js';
import type { RequestContext } from '../types/finance-engine.types.js';

export function buildPaginationMeta(page: number, limit: number, total: number): PaginatedMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roundPct(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildCacheKey(kind: string, payload: unknown): string {
  const hash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  return `${kind}:${hash.slice(0, 32)}`;
}

export async function auditFinanceMutation(
  log: (data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: Prisma.InputJsonValue;
    newValues?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }) => Promise<unknown>,
  ctx: RequestContext,
  action: string,
  entityId: string,
  newValues?: unknown,
): Promise<void> {
  await log({
    userId: ctx.actorId,
    action,
    entityType: 'finance_calculation',
    entityId,
    newValues: newValues as Prisma.InputJsonValue,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    requestId: ctx.requestId,
  });
}

export async function resolveProductFromSlug(productSlug: string): Promise<{
  productId: string;
  variantId: string | null;
  productCode: string;
  variantCode: string;
  minAmount: number;
  maxAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  minInterestRate: number | null;
  maxInterestRate: number | null;
}> {
  const mapping = PRODUCT_SLUG_MAP[productSlug];
  if (!mapping) {
    throw new AppError(400, 'INVALID_PRODUCT_SLUG', `Unsupported product slug: ${productSlug}`);
  }

  const product = await prisma.product.findFirst({
    where: { code: mapping.productCode, deletedAt: null, isActive: true },
    include: {
      variants: {
        where: { variantCode: mapping.variantCode as never, isActive: true },
        take: 1,
      },
    },
  });

  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', `Product ${mapping.productCode} not found`);
  }

  const variant = product.variants[0] ?? null;

  return {
    productId: product.id,
    variantId: variant?.id ?? null,
    productCode: product.code,
    variantCode: mapping.variantCode,
    minAmount: Number(product.minAmount),
    maxAmount: Number(product.maxAmount),
    minTenureMonths: product.minTenureMonths,
    maxTenureMonths: product.maxTenureMonths,
    minInterestRate: product.minInterestRate ? Number(product.minInterestRate) : null,
    maxInterestRate: product.maxInterestRate ? Number(product.maxInterestRate) : null,
  };
}

export function computeMonthlyIncome(monthlyIncome?: number, annualIncome?: number): number | null {
  if (monthlyIncome !== undefined) return monthlyIncome;
  if (annualIncome !== undefined) return annualIncome / 12;
  return null;
}

export function computeFoir(
  monthlyIncome: number | null,
  existingEmi: number,
  proposedEmi: number,
): number | null {
  if (!monthlyIncome || monthlyIncome <= 0) return null;
  return roundPct(((existingEmi + proposedEmi) / monthlyIncome) * 100);
}

export function computeLtv(loanAmount: number, assetValue?: number | null): number | null {
  if (!assetValue || assetValue <= 0) return null;
  return roundPct((loanAmount / assetValue) * 100);
}

export function computeDscr(
  annualBusinessProfit?: number | null,
  annualDebtService?: number | null,
): number | null {
  if (!annualBusinessProfit || !annualDebtService || annualDebtService <= 0) return null;
  return roundPct(annualBusinessProfit / annualDebtService);
}

export function clampAmount(amount: number, min: number, max: number): number {
  return Math.min(Math.max(amount, min), max);
}

export function gradeFromScore(score: number): 'A_PLUS' | 'A' | 'B' | 'C' | 'REJECTED' {
  if (score >= 90) return 'A_PLUS';
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  return 'REJECTED';
}
