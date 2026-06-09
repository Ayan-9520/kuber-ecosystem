import type { LeadGrade } from '@kuberone/database';

import {
  DEFAULT_FACTOR_WEIGHTS,
  DEFAULT_WEIGHT_VERSION,
  GRADE_CLASSIFICATIONS,
  GRADE_THRESHOLDS,
  SCORING_MODEL_VERSION,
  TIER1_CITIES,
} from '../constants/lead-scoring.constants.js';
import type { LeadScoringEngineResult, LeadScoringProfile, ScoringFactorBreakdown } from '../types/lead-scoring.types.js';

import { predictionEngineService } from './prediction-engine.service.js';
import { priorityEngineService } from './priority-engine.service.js';
import { riskEngineService } from './risk-engine.service.js';
import { rulesEngineService } from './rules-engine.service.js';

function normalizeScore(value: number, min: number, max: number): number {
  if (max <= min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

export function scoreToGrade(score: number): LeadGrade {
  if (score >= GRADE_THRESHOLDS.A_PLUS) return 'A_PLUS';
  if (score >= GRADE_THRESHOLDS.A) return 'A';
  if (score >= GRADE_THRESHOLDS.B) return 'B';
  if (score >= GRADE_THRESHOLDS.C) return 'C';
  return 'REJECTED';
}

export const scoringEngineService = {
  score(
    profile: LeadScoringProfile,
    weights: Record<string, number> = DEFAULT_FACTOR_WEIGHTS,
    aiScore = 50,
    ruleAdjustments = 0,
  ): LeadScoringEngineResult {
    const riskIndicators: string[] = [];
    const factorBreakdown: Record<string, ScoringFactorBreakdown> = {};

    const monthlyIncome = profile.monthlyIncome ?? (profile.annualIncome ? profile.annualIncome / 12 : undefined);

    const addFactor = (key: string, score: number, weightKey = key) => {
      const weight = weights[weightKey] ?? DEFAULT_FACTOR_WEIGHTS[weightKey] ?? 0.05;
      factorBreakdown[key] = { score, weight, weighted: score * weight };
    };

    if (monthlyIncome !== undefined) {
      const score = normalizeScore(monthlyIncome, 15000, 250000);
      addFactor('income', score);
      if (monthlyIncome < 25000) riskIndicators.push('Low income band');
    }

    if (profile.occupation) {
      const occ = profile.occupation.toUpperCase();
      const score = occ.includes('GOVT') || occ.includes('SALARIED') ? 85 : occ.includes('PROFESSIONAL') ? 80 : occ.includes('SELF') ? 65 : 50;
      addFactor('occupation', score);
    }

    if (profile.employmentType) {
      const emp = profile.employmentType.toUpperCase();
      const score = emp.includes('SALARIED') ? 85 : emp.includes('SELF_EMPLOYED') ? 70 : emp.includes('BUSINESS') ? 75 : 55;
      addFactor('employmentType', score);
    }

    if (profile.businessVintageYears !== undefined) {
      const score = normalizeScore(profile.businessVintageYears, 1, 15);
      addFactor('businessVintage', score);
      if (profile.businessVintageYears < 2) riskIndicators.push('Low business vintage');
    }

    if (profile.businessTurnover !== undefined) {
      const score = normalizeScore(profile.businessTurnover, 500000, 50000000);
      addFactor('turnover', score, 'turnover');
      if (profile.businessTurnover < 1000000) riskIndicators.push('Low business turnover');
    }

    if (profile.propertyValue !== undefined) {
      addFactor('propertyValue', normalizeScore(profile.propertyValue, 1000000, 50000000));
    }

    if (profile.vehicleValue !== undefined) {
      addFactor('vehicleValue', normalizeScore(profile.vehicleValue, 200000, 5000000));
    }

    if (profile.loanAmount !== undefined && monthlyIncome !== undefined && monthlyIncome > 0) {
      const ratio = profile.loanAmount / (monthlyIncome * 12);
      const score = ratio <= 5 ? 90 : ratio <= 10 ? 65 : ratio <= 20 ? 35 : 10;
      addFactor('loanRequirement', score, 'loanRequirement');
      if (ratio > 15) riskIndicators.push('High loan-to-income ratio');
    }

    if (profile.foir !== undefined) {
      const score = profile.foir <= 40 ? 90 : profile.foir <= 55 ? 70 : profile.foir <= 65 ? 45 : 15;
      addFactor('foir', score);
      if (profile.foir > 60) riskIndicators.push('High FOIR');
    }

    if (profile.ltv !== undefined) {
      const score = profile.ltv <= 70 ? 90 : profile.ltv <= 80 ? 70 : profile.ltv <= 90 ? 45 : 20;
      addFactor('ltv', score);
      if (profile.ltv > 85) riskIndicators.push('High LTV');
    }

    if (profile.dscr !== undefined) {
      const score = profile.dscr >= 1.5 ? 90 : profile.dscr >= 1.25 ? 75 : profile.dscr >= 1 ? 50 : 20;
      addFactor('dscr', score);
      if (profile.dscr < 1) riskIndicators.push('DSCR below 1.0');
    }

    if (profile.creditScore !== undefined) {
      const score = normalizeScore(profile.creditScore, 550, 850);
      addFactor('cibil', score, 'cibil');
      if (profile.creditScore < 650) riskIndicators.push('Below preferred CIBIL threshold');
      if (profile.creditScore < 550) riskIndicators.push('Critical CIBIL score');
    }

    if (profile.location) {
      const loc = profile.location.toUpperCase();
      const score = TIER1_CITIES.some((c) => loc.includes(c)) ? 85 : 55;
      addFactor('location', score);
    }

    if (profile.existingObligations !== undefined && monthlyIncome !== undefined && monthlyIncome > 0) {
      const obligationRatio = profile.existingObligations / monthlyIncome;
      const score = obligationRatio <= 0.3 ? 90 : obligationRatio <= 0.5 ? 70 : obligationRatio <= 0.7 ? 45 : 20;
      addFactor('existingLoans', score, 'existingLoans');
      if (obligationRatio > 0.6) riskIndicators.push('High existing loan obligations');
    }

    if (profile.bankingBehaviourScore !== undefined) {
      addFactor('bankingBehaviour', Math.max(0, Math.min(100, profile.bankingBehaviourScore)));
    }

    if (profile.documentCompletenessPct !== undefined) {
      const score = Math.max(0, Math.min(100, profile.documentCompletenessPct));
      addFactor('documentCompleteness', score);
      if (score < 50) riskIndicators.push('Incomplete documentation');
    }

    if (profile.productType) {
      const pt = profile.productType.toUpperCase();
      const score = pt.includes('HOME') ? 80 : pt.includes('BUSINESS') ? 70 : pt.includes('LAP') ? 75 : 65;
      addFactor('productType', score);
    }

    if (profile.referralSource) {
      const score = profile.referralSource.toUpperCase().includes('PARTNER') ? 75 : 60;
      addFactor('referralSource', score);
    }

    if (profile.partnerQualityScore !== undefined) {
      addFactor('partnerQuality', Math.max(0, Math.min(100, profile.partnerQualityScore)));
    }

    if (profile.leadSourceChannel) {
      const ch = profile.leadSourceChannel.toUpperCase();
      const score = ch === 'PARTNER' ? 80 : ch === 'REFERRAL' || ch === 'DIRECT' ? 75 : ch === 'DIGITAL' ? 70 : 60;
      addFactor('leadSource', score);
    }

    if (profile.applicationStage || profile.leadStatus) {
      const stage = (profile.applicationStage ?? profile.leadStatus ?? '').toUpperCase();
      const score =
        stage.includes('SANCTIONED') || stage.includes('DISBURSED') ? 95
        : stage.includes('APPLICATION') || stage.includes('QUALIFIED') ? 80
        : stage.includes('DOCUMENT') ? 65
        : stage.includes('LOST') || stage.includes('REJECTED') ? 10
        : 50;
      addFactor('applicationStage', score);
    }

    const totalWeight = Object.values(factorBreakdown).reduce((s, f) => s + f.weight, 0);
    const ruleScore =
      totalWeight > 0
        ? Math.round(Object.values(factorBreakdown).reduce((s, f) => s + f.weighted, 0) / totalWeight)
        : 50;

    const adjustedRuleScore = Math.max(0, Math.min(100, ruleScore + ruleAdjustments));
    const combined = Math.round(adjustedRuleScore * 0.7 + aiScore * 0.3);
    const grade = scoreToGrade(combined);

    const approvalMap: Record<string, number> = {
      A_PLUS: 92,
      A: 78,
      B: 58,
      C: 32,
      REJECTED: 8,
    };

    let approvalProbability = approvalMap[grade] ?? 30;
    if (profile.creditScore !== undefined && profile.creditScore >= 750) approvalProbability = Math.min(99, approvalProbability + 8);
    if (profile.foir !== undefined && profile.foir > 60) approvalProbability = Math.max(5, approvalProbability - 15);

    const disbursalProbability = Math.round(approvalProbability * (grade === 'REJECTED' ? 0.1 : grade === 'C' ? 0.55 : grade === 'B' ? 0.72 : 0.85));
    const conversionProbability = Math.round(
      combined * (profile.leadStatus === 'QUALIFIED' ? 0.75 : ['APPLICATION_CREATED', 'SANCTIONED', 'DISBURSED'].includes(profile.leadStatus ?? '') ? 1 : 0.55) * 0.01 * 100,
    );

    if (grade === 'REJECTED') riskIndicators.push('Lead grade rejected — limited outreach');

    const risk = riskEngineService.assess({ riskIndicators, score: combined, creditScore: profile.creditScore, foir: profile.foir, documentCompletenessPct: profile.documentCompletenessPct });
    const priorityLevel = priorityEngineService.resolve(combined, grade, approvalProbability);
    const predictions = predictionEngineService.predict({
      score: combined,
      grade,
      approvalProbability,
      disbursalProbability,
      riskRating: risk.riskRating,
      documentCompletenessPct: profile.documentCompletenessPct,
      leadStatus: profile.leadStatus,
      creditScore: profile.creditScore,
    });

    return {
      score: combined,
      grade,
      classification: GRADE_CLASSIFICATIONS[grade] ?? grade,
      ruleScore: adjustedRuleScore,
      aiScore,
      approvalProbability,
      disbursalProbability,
      conversionProbability,
      riskRating: risk.riskRating,
      priorityLevel,
      riskIndicators,
      riskFactors: risk.riskFactors,
      factorBreakdown,
      predictions,
      modelVersion: SCORING_MODEL_VERSION,
      weightVersion: DEFAULT_WEIGHT_VERSION,
    };
  },

  async scoreWithRules(profile: LeadScoringProfile, weights: Record<string, number>, aiScore = 50) {
    const rules = await rulesEngineService.getActiveRules();
    const adjustment = rulesEngineService.applyRules(profile, rules);
    return this.score(profile, weights, aiScore, adjustment);
  },
};
