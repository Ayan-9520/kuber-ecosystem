import type { ruleDefinitionSchema } from '@kuberone/shared-validation';
import type { z } from 'zod';


import type { EligibilityEvaluationResult } from '../types/product.types.js';

type RuleDefinition = z.infer<typeof ruleDefinitionSchema>;

interface ApplicantProfile {
  age?: number;
  monthlyIncome?: number;
  annualIncome?: number;
  employmentType?: string;
  businessVintageMonths?: number;
  turnover?: number;
  propertyValue?: number;
  vehicleValue?: number;
  requestedLoanAmount?: number;
  existingEmi?: number;
  creditScore?: number;
  location?: string;
  occupation?: string;
  industry?: string;
}

export const eligibilityEngineService = {
  evaluateRule(ruleName: string, definition: RuleDefinition, applicant: ApplicantProfile): {
    passed: boolean;
    conditional: boolean;
    riskFlags: string[];
  } {
    const riskFlags: string[] = [];
    let hardFail = false;
    let softFail = false;

    if (definition.minAge !== undefined && applicant.age !== undefined && applicant.age < definition.minAge) {
      hardFail = true;
      riskFlags.push(`${ruleName}: age below minimum ${definition.minAge}`);
    }
    if (definition.maxAge !== undefined && applicant.age !== undefined && applicant.age > definition.maxAge) {
      hardFail = true;
      riskFlags.push(`${ruleName}: age above maximum ${definition.maxAge}`);
    }

    const income = applicant.monthlyIncome ?? (applicant.annualIncome ? applicant.annualIncome / 12 : undefined);
    if (definition.minIncome !== undefined && income !== undefined && income < definition.minIncome) {
      hardFail = true;
      riskFlags.push(`${ruleName}: income below minimum`);
    }
    if (definition.maxIncome !== undefined && income !== undefined && income > definition.maxIncome) {
      softFail = true;
      riskFlags.push(`${ruleName}: income above configured maximum`);
    }

    if (
      definition.employmentTypes?.length &&
      applicant.employmentType &&
      !definition.employmentTypes.includes(applicant.employmentType)
    ) {
      hardFail = true;
      riskFlags.push(`${ruleName}: employment type not allowed`);
    }

    if (
      definition.businessVintageMonths !== undefined &&
      applicant.businessVintageMonths !== undefined &&
      applicant.businessVintageMonths < definition.businessVintageMonths
    ) {
      softFail = true;
      riskFlags.push(`${ruleName}: business vintage insufficient`);
    }

    if (definition.minTurnover !== undefined && applicant.turnover !== undefined && applicant.turnover < definition.minTurnover) {
      softFail = true;
      riskFlags.push(`${ruleName}: turnover below minimum`);
    }

    if (
      definition.minCreditScore !== undefined &&
      applicant.creditScore !== undefined &&
      applicant.creditScore < definition.minCreditScore
    ) {
      hardFail = true;
      riskFlags.push(`${ruleName}: credit score below minimum ${definition.minCreditScore}`);
    } else if (
      definition.minCreditScore !== undefined &&
      applicant.creditScore !== undefined &&
      applicant.creditScore < definition.minCreditScore + 50
    ) {
      softFail = true;
      riskFlags.push(`${ruleName}: borderline credit score`);
    }

    if (definition.locations?.length && applicant.location && !definition.locations.includes(applicant.location)) {
      softFail = true;
      riskFlags.push(`${ruleName}: location not in preferred list`);
    }

    if (definition.occupations?.length && applicant.occupation && !definition.occupations.includes(applicant.occupation)) {
      softFail = true;
      riskFlags.push(`${ruleName}: occupation not in preferred list`);
    }

    if (definition.industries?.length && applicant.industry && !definition.industries.includes(applicant.industry)) {
      softFail = true;
      riskFlags.push(`${ruleName}: industry not in preferred list`);
    }

    if (definition.maxLtv !== undefined && applicant.propertyValue && applicant.requestedLoanAmount) {
      const ltv = (applicant.requestedLoanAmount / applicant.propertyValue) * 100;
      if (ltv > definition.maxLtv) {
        hardFail = true;
        riskFlags.push(`${ruleName}: LTV ${ltv.toFixed(1)}% exceeds max ${definition.maxLtv}%`);
      }
    }

    if (definition.maxLtv !== undefined && applicant.vehicleValue && applicant.requestedLoanAmount) {
      const ltv = (applicant.requestedLoanAmount / applicant.vehicleValue) * 100;
      if (ltv > definition.maxLtv) {
        hardFail = true;
        riskFlags.push(`${ruleName}: vehicle LTV exceeds max ${definition.maxLtv}%`);
      }
    }

    if (definition.maxFoir !== undefined && income && applicant.existingEmi !== undefined) {
      const foir = ((applicant.existingEmi + (applicant.requestedLoanAmount ?? 0) * 0.01) / income) * 100;
      if (foir > definition.maxFoir) {
        hardFail = true;
        riskFlags.push(`${ruleName}: FOIR ${foir.toFixed(1)}% exceeds max ${definition.maxFoir}%`);
      } else if (foir > definition.maxFoir - 5) {
        softFail = true;
        riskFlags.push(`${ruleName}: borderline FOIR`);
      }
    }

    return {
      passed: !hardFail && !softFail,
      conditional: !hardFail && softFail,
      riskFlags,
    };
  },

  aggregate(
    ruleResults: Array<{ ruleName: string; passed: boolean; conditional: boolean; riskFlags: string[] }>,
    maxLoanAmount?: number,
  ): EligibilityEvaluationResult {
    const failedRules = ruleResults.filter((r) => !r.passed && !r.conditional).map((r) => r.ruleName);
    const conditionalRules = ruleResults.filter((r) => r.conditional).map((r) => r.ruleName);
    const passedRules = ruleResults.filter((r) => r.passed).map((r) => r.ruleName);
    const riskFlags = ruleResults.flatMap((r) => r.riskFlags);

    let outcome: EligibilityEvaluationResult['outcome'] = 'ELIGIBLE';
    if (failedRules.length > 0) outcome = 'NOT_ELIGIBLE';
    else if (conditionalRules.length > 0) outcome = 'CONDITIONALLY_ELIGIBLE';

    const approvalProbability =
      outcome === 'ELIGIBLE' ? 0.85 : outcome === 'CONDITIONALLY_ELIGIBLE' ? 0.55 : 0.15;

    return {
      outcome,
      approvalProbability,
      maximumLoanAmount: maxLoanAmount ?? null,
      riskFlags,
      failedRules,
      passedRules: [...passedRules, ...conditionalRules],
    };
  },
};
