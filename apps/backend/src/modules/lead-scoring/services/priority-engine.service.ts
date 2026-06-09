import type { LeadGrade, LeadScorePriority } from '@kuberone/database';

import { PRIORITY_THRESHOLDS } from '../constants/lead-scoring.constants.js';

export const priorityEngineService = {
  resolve(score: number, grade: LeadGrade, approvalProbability: number): LeadScorePriority {
    const composite = Math.round(score * 0.6 + approvalProbability * 0.4);

    if (grade === 'REJECTED') return 'LOW';
    if (composite >= PRIORITY_THRESHOLDS.HOT || grade === 'A_PLUS') return 'HOT';
    if (composite >= PRIORITY_THRESHOLDS.WARM || grade === 'A') return 'WARM';
    if (composite >= PRIORITY_THRESHOLDS.NORMAL || grade === 'B') return 'NORMAL';
    return 'LOW';
  },
};
