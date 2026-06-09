import type { PrismaClient } from '@prisma/client';

const DEFAULT_FACTOR_WEIGHTS: Record<string, number> = {
  income: 0.12,
  occupation: 0.05,
  employmentType: 0.06,
  businessVintage: 0.04,
  turnover: 0.08,
  propertyValue: 0.1,
  vehicleValue: 0.05,
  loanRequirement: 0.08,
  foir: 0.1,
  ltv: 0.08,
  dscr: 0.06,
  cibil: 0.15,
  location: 0.05,
  existingLoans: 0.04,
  bankingBehaviour: 0.03,
  documentCompleteness: 0.06,
  productType: 0.05,
  referralSource: 0.03,
  partnerQuality: 0.04,
  leadSource: 0.03,
  applicationStage: 0.04,
};

const DEFAULT_RULES = [
  {
    code: 'CIBIL_PREMIUM',
    name: 'Premium CIBIL Score',
    factor: 'cibil',
    ruleType: 'STATIC' as const,
    condition: { min: 750 },
    scoreImpact: 10,
    priority: 90,
    description: 'Boost score for CIBIL 750+',
  },
  {
    code: 'CIBIL_CRITICAL',
    name: 'Critical CIBIL Score',
    factor: 'cibil',
    ruleType: 'STATIC' as const,
    condition: { max: 550 },
    scoreImpact: -20,
    priority: 95,
    description: 'Penalize CIBIL below 550',
  },
  {
    code: 'HIGH_FOIR',
    name: 'High FOIR Penalty',
    factor: 'foir',
    ruleType: 'DYNAMIC' as const,
    condition: { min: 60 },
    scoreImpact: -15,
    priority: 85,
    description: 'Penalize FOIR above 60%',
  },
  {
    code: 'DOC_INCOMPLETE',
    name: 'Incomplete Documents',
    factor: 'documentCompleteness',
    ruleType: 'CONFIG' as const,
    condition: { max: 50 },
    scoreImpact: -10,
    priority: 80,
    description: 'Penalize low document completeness',
  },
  {
    code: 'TIER1_LOCATION',
    name: 'Tier-1 City Boost',
    factor: 'location',
    ruleType: 'STATIC' as const,
    condition: { contains: 'MUMBAI' },
    scoreImpact: 5,
    priority: 60,
    description: 'Location boost for metro cities',
  },
];

export async function seedLeadScoring(prisma: PrismaClient): Promise<void> {
  const version = 'v2.0';

  for (const [factor, weight] of Object.entries(DEFAULT_FACTOR_WEIGHTS)) {
    await prisma.leadWeightConfig.upsert({
      where: { version_factor: { version, factor } },
      update: { weight, isActive: true },
      create: {
        version,
        factor,
        weight,
        isActive: true,
        effectiveFrom: new Date(),
      },
    });
  }

  for (const rule of DEFAULT_RULES) {
    await prisma.leadScoringRule.upsert({
      where: { code: rule.code },
      update: {
        name: rule.name,
        factor: rule.factor,
        ruleType: rule.ruleType,
        condition: rule.condition,
        scoreImpact: rule.scoreImpact,
        priority: rule.priority,
        description: rule.description,
        isActive: true,
      },
      create: rule,
    });
  }

  console.log('  → lead scoring weights & rules seeded');
}
