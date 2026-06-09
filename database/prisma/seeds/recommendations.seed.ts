import type { PrismaClient } from '@prisma/client';

const DEFAULT_RECOMMENDATION_WEIGHTS: Record<string, number> = {
  income: 0.15,
  cibil: 0.2,
  foir: 0.12,
  ltv: 0.1,
  leadScore: 0.15,
  location: 0.08,
  productFit: 0.1,
  lenderPolicy: 0.1,
  documentCompleteness: 0.1,
};

const DEFAULT_RULES = [
  {
    code: 'CIBIL_LENDER_BOOST',
    name: 'Premium CIBIL Lender Match',
    ruleType: 'STATIC' as const,
    category: 'lender_ranking',
    condition: { minCibil: 750 },
    scoreImpact: 12,
    priority: 90,
    description: 'Boost lender rank for CIBIL 750+ profiles',
  },
  {
    code: 'HIGH_FOIR_LENDER_PENALTY',
    name: 'High FOIR Lender Penalty',
    ruleType: 'DYNAMIC' as const,
    category: 'lender_ranking',
    condition: { minFoir: 60 },
    scoreImpact: -15,
    priority: 85,
    description: 'Reduce lender match score when FOIR exceeds 60%',
  },
  {
    code: 'LAP_CROSS_SELL',
    name: 'LAP Cross-Sell Trigger',
    ruleType: 'CONFIG' as const,
    category: 'cross_sell',
    condition: { minPropertyValue: 3000000 },
    scoreImpact: 10,
    priority: 75,
    description: 'Recommend LAP when property value is high',
  },
  {
    code: 'DOC_FOLLOW_UP',
    name: 'Document Collection Action',
    ruleType: 'CONFIG' as const,
    category: 'action',
    condition: { maxDocumentCompleteness: 70 },
    scoreImpact: 20,
    priority: 95,
    description: 'Prioritize document collection when completeness is low',
  },
  {
    code: 'RISK_CRITICAL_CIBIL',
    name: 'Critical CIBIL Risk',
    ruleType: 'STATIC' as const,
    category: 'risk',
    condition: { maxCibil: 550 },
    scoreImpact: -25,
    priority: 98,
    description: 'Flag critical risk for very low CIBIL',
  },
];

export async function seedRecommendations(prisma: PrismaClient): Promise<void> {
  const version = 'rec-v1.0';
  const effectiveFrom = new Date('2026-01-01');

  for (const [factor, weight] of Object.entries(DEFAULT_RECOMMENDATION_WEIGHTS)) {
    await prisma.recommendationWeight.upsert({
      where: { version_factor: { version, factor } },
      update: { weight, isActive: true },
      create: { version, factor, weight, isActive: true, effectiveFrom },
    });
  }

  for (const rule of DEFAULT_RULES) {
    await prisma.recommendationRule.upsert({
      where: { code: rule.code },
      update: {
        name: rule.name,
        ruleType: rule.ruleType,
        category: rule.category,
        condition: rule.condition,
        scoreImpact: rule.scoreImpact,
        priority: rule.priority,
        description: rule.description,
        isActive: true,
      },
      create: rule,
    });
  }

  console.log('  → recommendation rules & weights seeded');
}
