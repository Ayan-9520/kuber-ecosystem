import { leadScoringRepository } from '../repositories/lead-scoring.repository.js';
import type { LeadScoringProfile } from '../types/lead-scoring.types.js';

type ScoringRule = {
  factor: string;
  ruleType: string;
  condition: unknown;
  scoreImpact: number;
  priority: number;
};

export const rulesEngineService = {
  async getActiveRules() {
    return leadScoringRepository.findActiveRules();
  },

  applyRules(profile: LeadScoringProfile, rules: ScoringRule[]): number {
    let adjustment = 0;

    for (const rule of rules) {
      const condition = rule.condition as Record<string, unknown>;
      if (!this.matchesRule(profile, rule.factor, condition)) continue;
      adjustment += rule.scoreImpact;
    }

    return Math.max(-30, Math.min(30, adjustment));
  },

  matchesRule(profile: LeadScoringProfile, factor: string, condition: Record<string, unknown>): boolean {
    const value = this.getFactorValue(profile, factor);
    if (value === undefined) return false;

    if (condition.min !== undefined && Number(value) < Number(condition.min)) return false;
    if (condition.max !== undefined && Number(value) > Number(condition.max)) return false;
    if (condition.equals !== undefined && String(value).toUpperCase() !== String(condition.equals).toUpperCase()) return false;
    if (condition.contains !== undefined && !String(value).toUpperCase().includes(String(condition.contains).toUpperCase())) return false;
    if (condition.in !== undefined && Array.isArray(condition.in) && !condition.in.map(String).includes(String(value))) return false;

    return true;
  },

  getFactorValue(profile: LeadScoringProfile, factor: string): unknown {
    const map: Record<string, unknown> = {
      income: profile.monthlyIncome ?? profile.annualIncome,
      cibil: profile.creditScore,
      creditScore: profile.creditScore,
      foir: profile.foir,
      ltv: profile.ltv,
      dscr: profile.dscr,
      loanRequirement: profile.loanAmount,
      loanAmount: profile.loanAmount,
      location: profile.location,
      occupation: profile.occupation,
      employmentType: profile.employmentType,
      productType: profile.productType,
      documentCompleteness: profile.documentCompletenessPct,
      leadSource: profile.leadSourceChannel,
      applicationStage: profile.applicationStage ?? profile.leadStatus,
    };
    return map[factor];
  },
};
