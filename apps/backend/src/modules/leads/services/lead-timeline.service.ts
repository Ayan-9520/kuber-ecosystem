import type { LeadTimelineQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { leadActivityRepository } from '../repositories/lead-activity.repository.js';
import { leadAssignmentRepository } from '../repositories/lead-assignment.repository.js';
import { leadFollowUpRepository } from '../repositories/lead-followup.repository.js';
import { leadNoteRepository } from '../repositories/lead-note.repository.js';
import { leadStatusHistoryRepository } from '../repositories/lead-status-history.repository.js';
import { leadRepository } from '../repositories/lead.repository.js';
import type { TimelineEvent } from '../types/leads.types.js';
import { buildPaginationMeta } from '../utils/leads.utils.js';

export const leadTimelineService = {
  async getTimeline(query: LeadTimelineQuery) {
    const lead = await leadRepository.findById(query.leadId);
    if (!lead) throw new NotFoundError('Lead', query.leadId);

    const eventTypes = query.eventTypes;
    const events: TimelineEvent[] = [];

    if (!eventTypes || eventTypes.includes('status')) {
      const history = await leadStatusHistoryRepository.list({ leadId: query.leadId }, 0, 500, {
        createdAt: 'desc',
      });
      for (const h of history) {
        events.push({
          id: h.id,
          leadId: query.leadId,
          eventType: 'STATUS_CHANGE',
          title: `Status: ${h.fromStatus ?? '—'} → ${h.toStatus}`,
          description: h.reason ?? undefined,
          actorId: h.changedById,
          occurredAt: h.createdAt,
        });
      }
    }

    if (!eventTypes || eventTypes.includes('assignment')) {
      const assignments = await leadAssignmentRepository.list({ leadId: query.leadId }, 0, 200, {
        assignedAt: 'desc',
      });
      for (const a of assignments) {
        events.push({
          id: a.id,
          leadId: query.leadId,
          eventType: 'ASSIGNMENT',
          title: `Assigned to ${a.assignedTo.firstName} ${a.assignedTo.lastName}`,
          description: a.notes ?? undefined,
          metadata: { assignmentType: a.assignmentType, isCurrent: a.isCurrent },
          occurredAt: a.assignedAt,
        });
      }
    }

    if (!eventTypes || eventTypes.includes('activity')) {
      const activities = await leadActivityRepository.list({ leadId: query.leadId }, 0, 500, {
        createdAt: 'desc',
      });
      for (const act of activities) {
        events.push({
          id: act.id,
          leadId: query.leadId,
          eventType: act.activityType,
          title: act.activityType,
          description: act.description ?? undefined,
          actorId: act.performedById,
          metadata: {
            disposition: act.disposition,
            durationSeconds: act.durationSeconds,
          },
          occurredAt: act.completedAt ?? act.createdAt,
        });
      }
    }

    if (!eventTypes || eventTypes.includes('note')) {
      const notes = await leadNoteRepository.list({ leadId: query.leadId }, 0, 200, {
        createdAt: 'desc',
      });
      for (const note of notes) {
        events.push({
          id: note.id,
          leadId: query.leadId,
          eventType: 'NOTE',
          title: 'Note added',
          description: note.content,
          actorId: note.authorId,
          occurredAt: note.createdAt,
        });
      }
    }

    if (!eventTypes || eventTypes.includes('followup')) {
      const followUps = await leadFollowUpRepository.list({ leadId: query.leadId }, 0, 200, {
        scheduledAt: 'desc',
      });
      for (const f of followUps) {
        events.push({
          id: f.id,
          leadId: query.leadId,
          eventType: 'FOLLOW_UP',
          title: `${f.followUpType} follow-up (${f.status})`,
          description: f.notes ?? undefined,
          metadata: { scheduledAt: f.scheduledAt, status: f.status },
          occurredAt: f.completedAt ?? f.scheduledAt,
        });
      }
    }

    events.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    const skip = (query.page - 1) * query.limit;
    const paginated = events.slice(skip, skip + query.limit);

    return {
      items: paginated,
      meta: buildPaginationMeta(query.page, query.limit, events.length),
    };
  },
};
