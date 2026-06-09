import { prisma } from '../../../config/database.js';
import { PARTNER_CODE_TO_COMMISSION_TYPE } from '../constants/commissions.constants.js';
import { commissionRuleRepository } from '../repositories/commission.repository.js';
import type { CalculationResult, SlabDefinition } from '../types/commissions.types.js';
import { roundMoney } from '../utils/commissions.utils.js';

interface CalculateInput {
  partnerId: string;
  commissionType: string;
  baseAmount: number;
  productId?: string | null;
  lenderId?: string | null;
  campaignId?: string | null;
}

export const commissionCalculationEngineService = {
  async calculate(input: CalculateInput): Promise<CalculationResult> {
    const partner = await prisma.partner.findUnique({
      where: { id: input.partnerId },
      include: { partnerType: true },
    });
    if (!partner) {
      return zeroResult('Partner not found');
    }

    const partnerType = PARTNER_CODE_TO_COMMISSION_TYPE[partner.partnerType.code] ?? null;

    const rules = await commissionRuleRepository.listActive({
      commissionType: input.commissionType,
      partnerType,
      productId: input.productId,
      lenderId: input.lenderId,
      campaignId: input.campaignId,
    });

    if (rules.length === 0) {
      return zeroResult('No matching commission rule');
    }

    const rule = rules[0]!;
    const amount = applyRule(rule, input.baseAmount);

    return {
      commissionAmount: amount,
      ruleId: rule.id,
      calculationMethod: rule.calculationMethod,
      calculationDetails: {
        ruleCode: rule.ruleCode,
        ruleName: rule.name,
        baseAmount: input.baseAmount,
        method: rule.calculationMethod,
        partnerType: rule.partnerType,
      },
    };
  },
};

function applyRule(
  rule: {
    id: string;
    calculationMethod: string;
    fixedAmount: unknown;
    percentage: unknown;
    slabDefinition: unknown;
    minBaseAmount: unknown;
    maxBaseAmount: unknown;
    minCommission: unknown;
    maxCommission: unknown;
  },
  baseAmount: number,
): number {
  if (rule.minBaseAmount && baseAmount < Number(rule.minBaseAmount)) return 0;
  if (rule.maxBaseAmount && baseAmount > Number(rule.maxBaseAmount)) return 0;

  let commission = 0;

  switch (rule.calculationMethod) {
    case 'FIXED_AMOUNT':
      commission = Number(rule.fixedAmount ?? 0);
      break;
    case 'PERCENTAGE':
    case 'PRODUCT_BASED':
    case 'LENDER_BASED':
    case 'CAMPAIGN_BASED':
      commission = baseAmount * (Number(rule.percentage ?? 0) / 100);
      break;
    case 'SLAB_BASED':
      commission = applySlabs(baseAmount, (rule.slabDefinition as SlabDefinition[]) ?? []);
      break;
    default:
      commission = 0;
  }

  if (rule.minCommission) commission = Math.max(commission, Number(rule.minCommission));
  if (rule.maxCommission) commission = Math.min(commission, Number(rule.maxCommission));

  return roundMoney(Math.max(commission, 0));
}

function applySlabs(baseAmount: number, slabs: SlabDefinition[]): number {
  for (const slab of slabs) {
    const inRange =
      baseAmount >= slab.minAmount && (slab.maxAmount === undefined || baseAmount <= slab.maxAmount);
    if (!inRange) continue;
    if (slab.fixedAmount !== undefined) return slab.fixedAmount;
    if (slab.percentage !== undefined) return roundMoney(baseAmount * (slab.percentage / 100));
  }
  return 0;
}

function zeroResult(reason: string): CalculationResult {
  return {
    commissionAmount: 0,
    ruleId: null,
    calculationMethod: 'FIXED_AMOUNT',
    calculationDetails: { reason },
  };
}
