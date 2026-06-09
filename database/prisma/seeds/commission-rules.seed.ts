import type { PrismaClient } from '@prisma/client';
import {
  CommissionCalculationMethod,
  CommissionEventType,
  CommissionPartnerType,
} from '@prisma/client';

const RULES = [
  {
    ruleCode: 'DSA_LEAD_GEN',
    name: 'DSA Lead Generation',
    partnerType: CommissionPartnerType.DSA,
    commissionType: CommissionEventType.LEAD_GENERATION,
    calculationMethod: CommissionCalculationMethod.FIXED_AMOUNT,
    fixedAmount: 500,
    priority: 10,
  },
  {
    ruleCode: 'DSA_DISBURSEMENT',
    name: 'DSA Disbursement Commission',
    partnerType: CommissionPartnerType.DSA,
    commissionType: CommissionEventType.DISBURSEMENT,
    calculationMethod: CommissionCalculationMethod.PERCENTAGE,
    percentage: 1.25,
    priority: 20,
  },
  {
    ruleCode: 'BUILDER_SANCTION',
    name: 'Builder Sanction Commission',
    partnerType: CommissionPartnerType.BUILDER,
    commissionType: CommissionEventType.SANCTION,
    calculationMethod: CommissionCalculationMethod.PERCENTAGE,
    percentage: 0.5,
    priority: 10,
  },
  {
    ruleCode: 'PROPERTY_DEALER_LEAD',
    name: 'Property Dealer Lead Commission',
    partnerType: CommissionPartnerType.PROPERTY_DEALER,
    commissionType: CommissionEventType.LEAD_GENERATION,
    calculationMethod: CommissionCalculationMethod.FIXED_AMOUNT,
    fixedAmount: 750,
    priority: 10,
  },
  {
    ruleCode: 'CA_CROSS_SELL',
    name: 'CA Cross Sell Commission',
    partnerType: CommissionPartnerType.CA,
    commissionType: CommissionEventType.CROSS_SELL,
    calculationMethod: CommissionCalculationMethod.PERCENTAGE,
    percentage: 0.35,
    priority: 10,
  },
  {
    ruleCode: 'BROKER_DISBURSEMENT',
    name: 'Broker Disbursement Commission',
    partnerType: CommissionPartnerType.BROKER,
    commissionType: CommissionEventType.DISBURSEMENT,
    calculationMethod: CommissionCalculationMethod.SLAB_BASED,
    slabDefinition: [
      { minAmount: 0, maxAmount: 5000000, percentage: 0.75 },
      { minAmount: 5000001, maxAmount: 20000000, percentage: 1.0 },
      { minAmount: 20000001, percentage: 1.25 },
    ],
    priority: 10,
  },
  {
    ruleCode: 'CORPORATE_RENEWAL',
    name: 'Corporate Renewal Commission',
    partnerType: CommissionPartnerType.CORPORATE,
    commissionType: CommissionEventType.RENEWAL,
    calculationMethod: CommissionCalculationMethod.PERCENTAGE,
    percentage: 0.25,
    priority: 10,
  },
  {
    ruleCode: 'CHANNEL_LOGIN',
    name: 'Channel Partner Application Login',
    partnerType: CommissionPartnerType.CHANNEL_PARTNER,
    commissionType: CommissionEventType.APPLICATION_LOGIN,
    calculationMethod: CommissionCalculationMethod.FIXED_AMOUNT,
    fixedAmount: 300,
    priority: 5,
  },
  {
    ruleCode: 'CAMPAIGN_BONUS',
    name: 'Campaign Bonus',
    partnerType: null,
    commissionType: CommissionEventType.CAMPAIGN_BONUS,
    calculationMethod: CommissionCalculationMethod.CAMPAIGN_BASED,
    percentage: 0.15,
    priority: 30,
  },
];

export async function seedCommissionRules(prisma: PrismaClient): Promise<void> {
  const effectiveFrom = new Date('2024-01-01');

  for (const rule of RULES) {
    await prisma.commissionRule.upsert({
      where: { ruleCode: rule.ruleCode },
      update: {
        name: rule.name,
        partnerType: rule.partnerType,
        commissionType: rule.commissionType,
        calculationMethod: rule.calculationMethod,
        fixedAmount: rule.fixedAmount,
        percentage: rule.percentage,
        slabDefinition: rule.slabDefinition,
        priority: rule.priority,
        isActive: true,
      },
      create: {
        ...rule,
        effectiveFrom,
        isActive: true,
      },
    });
  }

  console.log('  → commission_rules seeded');
}
