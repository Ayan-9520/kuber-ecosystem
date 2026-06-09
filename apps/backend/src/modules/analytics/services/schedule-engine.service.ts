import type { AuthenticatedUser } from '@kuberone/shared-types';
import type { CreateAnalyticsScheduleInput } from '@kuberone/shared-validation';

import { analyticsRepository } from '../repositories/analytics.repository.js';

import { reportEngineService } from './report-engine.service.js';

function nextRunFromFrequency(frequency: string, from = new Date()): Date {
  const next = new Date(from);
  if (frequency === 'DAILY') next.setDate(next.getDate() + 1);
  else if (frequency === 'WEEKLY') next.setDate(next.getDate() + 7);
  else next.setMonth(next.getMonth() + 1);
  next.setHours(6, 0, 0, 0);
  return next;
}

export const scheduleEngineService = {
  async create(actor: AuthenticatedUser, input: CreateAnalyticsScheduleInput) {
    return analyticsRepository.createSchedule({
      reportId: input.reportId,
      name: input.name,
      frequency: input.frequency,
      recipients: input.recipients,
      format: input.format,
      timezone: input.timezone,
      createdById: actor.id,
      nextRunAt: nextRunFromFrequency(input.frequency),
    });
  },

  async processDueSchedules(): Promise<number> {
    const due = await analyticsRepository.listDueSchedules(new Date());
    let processed = 0;

    for (const schedule of due) {
      try {
        const recipients = Array.isArray(schedule.recipients) ? (schedule.recipients as string[]) : [];
        await reportEngineService.run(
          { id: 'system', roles: ['SUPER_ADMIN'] } as never,
          {
            reportId: schedule.reportId,
            format: schedule.format,
            parameters: (schedule.report.config as Record<string, unknown>) ?? {},
          },
          { actorId: 'system' },
        );
        // Email delivery hook — log recipients for ops; integrates with notification engine later
        console.log(`[analytics-schedule] Report "${schedule.report.name}" queued for ${recipients.join(', ')}`);
        await analyticsRepository.updateSchedule(schedule.id, {
          lastRunAt: new Date(),
          nextRunAt: nextRunFromFrequency(schedule.frequency),
        });
        processed += 1;
      } catch (error) {
        console.error(`[analytics-schedule] Failed schedule ${schedule.id}:`, error);
      }
    }
    return processed;
  },
};
