export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface TicketTimelineEvent {
  id: string;
  ticketId: string;
  eventType: string;
  title: string;
  description?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
}

export interface TicketAnalyticsSummary {
  openTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  slaBreaches: number;
  avgResolutionHours: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: { categoryId: string; categoryName: string; count: number }[];
  executivePerformance: {
    assignedUserId: string;
    assignedUserName: string;
    total: number;
    resolved: number;
    avgResolutionHours: number;
  }[];
  branchPerformance: {
    branchId: string;
    branchName: string;
    total: number;
    open: number;
    resolved: number;
  }[];
}
