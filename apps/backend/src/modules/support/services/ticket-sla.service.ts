import type { TicketPriority } from '@kuberone/database';

import {
  SLA_ESCALATION_HOURS,
  SLA_RESOLUTION_HOURS,
  SLA_RESPONSE_HOURS,
} from '../constants/support.constants.js';
import { addHours } from '../utils/support.utils.js';

export const ticketSlaService = {
  calculateSlaDates(priority: TicketPriority, fromDate = new Date()) {
    const key = priority as string;
    return {
      responseSlaDueAt: addHours(fromDate, SLA_RESPONSE_HOURS[key] ?? 8),
      resolutionSlaDueAt: addHours(fromDate, SLA_RESOLUTION_HOURS[key] ?? 48),
      escalationSlaDueAt: addHours(fromDate, SLA_ESCALATION_HOURS[key] ?? 24),
    };
  },

  isSlaBreached(dueAt: Date | null | undefined): boolean {
    if (!dueAt) return false;
    return dueAt.getTime() < Date.now();
  },

  checkAndMarkBreaches(ticket: {
    responseSlaDueAt: Date | null;
    resolutionSlaDueAt: Date | null;
    firstResponseAt: Date | null;
    resolvedAt: Date | null;
  }): boolean {
    const responseBreached = !ticket.firstResponseAt && this.isSlaBreached(ticket.responseSlaDueAt);
    const resolutionBreached = !ticket.resolvedAt && this.isSlaBreached(ticket.resolutionSlaDueAt);
    return responseBreached || resolutionBreached;
  },
};
