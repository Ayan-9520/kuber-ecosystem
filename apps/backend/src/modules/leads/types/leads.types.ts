import type { LeadGrade, LeadStatus } from '@kuberone/database';

export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface LeadScoringResult {
  score: number;
  grade: LeadGrade;
  ruleScore: number;
  aiScore: number;
  approvalProbability: number;
  riskIndicators: string[];
  factorBreakdown: Record<string, { score: number; weight: number; weighted: number }>;
  modelVersion: string;
}

export interface TimelineEvent {
  id: string;
  leadId: string;
  eventType: string;
  title: string;
  description?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
}

export interface LeadAnalyticsSummary {
  todayLeads: number;
  qualifiedLeads: number;
  hotLeads: number;
  convertedLeads: number;
  lostLeads: number;
  byStatus: Record<LeadStatus | string, number>;
  byGrade: Record<LeadGrade | string, number>;
  bySource: { sourceId: string; sourceName: string; count: number }[];
  executivePerformance: {
    employeeId: string;
    employeeName: string;
    totalLeads: number;
    converted: number;
    lost: number;
  }[];
  branchPerformance: {
    branchId: string;
    branchName: string;
    totalLeads: number;
    converted: number;
    lost: number;
  }[];
}
