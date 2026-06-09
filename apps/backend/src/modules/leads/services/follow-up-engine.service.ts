import type { LeadFollowUpType, LeadGrade } from '@kuberone/database';

import { GRADE_SLA_HOURS } from '../constants/leads.constants.js';
import { leadFollowUpRepository } from '../repositories/lead-followup.repository.js';

const FOLLOW_UP_OFFSET_HOURS: Record<string, number> = {
  A_PLUS: 1,
  A: 4,
  B: 24,
  C: 48,
  REJECTED: 72,
};

export const followUpEngineService = {
  computeNextFollowUpDate(grade: LeadGrade | null | undefined, from = new Date()): Date {
    const hours = grade ? (FOLLOW_UP_OFFSET_HOURS[grade] ?? 24) : 24;
    return new Date(from.getTime() + hours * 60 * 60 * 1000);
  },

  defaultFollowUpType(grade: LeadGrade | null | undefined): LeadFollowUpType {
    if (grade === 'A_PLUS' || grade === 'A') return 'CALL';
    if (grade === 'B') return 'WHATSAPP';
    return 'SMS';
  },

  async processReminders(): Promise<{ reminded: number; escalated: number }> {
    const now = new Date();
    const reminderWindow = new Date(now.getTime() + 30 * 60 * 1000);
    const due = await leadFollowUpRepository.findDueForReminder(now, reminderWindow);

    let reminded = 0;
    for (const followUp of due) {
      await leadFollowUpRepository.update(followUp.id, { reminderSent: true });
      reminded += 1;
    }

    const overdue = await leadFollowUpRepository.findOverdue(now);
    let escalated = 0;
    for (const followUp of overdue) {
      await leadFollowUpRepository.update(followUp.id, {
        status: 'ESCALATED',
        escalatedAt: now,
        reminderSent: true,
      });
      escalated += 1;
    }

    return { reminded, escalated };
  },

  slaHoursForGrade(grade: LeadGrade | null | undefined): number {
    if (!grade) return GRADE_SLA_HOURS.B ?? 24;
    return GRADE_SLA_HOURS[grade] ?? 24;
  },
};
