export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface LosAnalyticsSummary {
  totalApplications: number;
  submitted: number;
  sanctioned: number;
  disbursed: number;
  rejected: number;
  approvalRate: number;
  disbursementRate: number;
  avgTatDays: number;
  byStatus: Record<string, number>;
  executivePerformance: {
    employeeId: string;
    employeeName: string;
    total: number;
    sanctioned: number;
    disbursed: number;
    rejected: number;
  }[];
  branchPerformance: {
    branchId: string;
    branchName: string;
    total: number;
    sanctioned: number;
    disbursed: number;
    rejected: number;
  }[];
}
