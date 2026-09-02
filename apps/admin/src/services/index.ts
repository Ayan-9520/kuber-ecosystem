import { recommendationsService } from './recommendations.service';
import { supportService } from './support.service';

import { normalizeCommissionAnalytics, normalizeLeadAnalytics } from '@/lib/analytics-helpers';
import { apiDownload, apiGet, apiGetPaginated, apiPatch, apiPost, apiPut, apiDelete } from '@/lib/api';

import type {
  CreateLoanCaseInput,
  LoanCase,
  LoanFulfillmentDashboard,
  LoanRevenueRule,
} from '@/features/loan-fulfillment/data/types';

export { copilotService } from './copilot.service';
export type { CopilotLeadAnalysis, CopilotApplicationAnalysis, CopilotAnalytics } from './copilot.service';
export { leadScoringService } from './leadScoring.service';
export type { LeadScoreResult, LeadScoringAnalytics } from './leadScoring.service';
export { recommendationsService } from './recommendations.service';
export type { RecommendationBundle } from './recommendations.service';
export { knowledgeService } from './knowledge.service';
export type { KnowledgeArticle, KnowledgeAnalytics } from './knowledge.service';
export { ragService } from './rag.service';
export type { RagAnalytics, RagDocument } from './rag.service';
export { analyticsService } from './analytics.service';
export type { AnalyticsQuery, AnalyticsTimePreset } from './analytics.service';
export { executiveAnalyticsService } from './executive-analytics.service';
export type { ExecutiveQuery, ExecutiveRoleType, ExecutivePeriodType, ExecutiveTimePreset } from './executive-analytics.service';
export { branchAnalyticsService } from './branch-analytics.service';
export type { BranchQuery, BranchPeriodType, BranchRankingType, BranchTimePreset } from './branch-analytics.service';
export { regionalAnalyticsService } from './regional-analytics.service';
export type { RegionalQuery, RegionalPeriodType, RegionalRankingType, RegionalTimePreset } from './regional-analytics.service';
export { aiPlatformService } from './ai-platform.service';
export type { AiPlatformHealth, AiUsageAnalytics, AiCostAnalytics } from './ai-platform.service';

export const leadsService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/leads', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/leads/${id}`),
  create: (data: unknown) => apiPost('/leads', data),
  update: (id: string, data: unknown) => apiPatch(`/leads/${id}`, data),
  analytics: async (params?: Record<string, unknown>) =>
    normalizeLeadAnalytics(await apiGet<Record<string, unknown>>('/lead-analytics/summary', params)),
  notes: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/lead-notes', params),
  activities: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/lead-activities', params),
  followUps: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/lead-followups', params),
  timeline: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/lead-timeline', params),
  scores: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/lead-scores', params),
  assign: (id: string, data: unknown) => apiPost(`/leads/${id}/assign`, data),
  remove: (id: string) => apiDelete(`/leads/${id}`),
};

export const websiteVisitorsService = {
  list: (params: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/leads/website-visitors', params),
};

export const customersService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/customers', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/customers/${id}`),
  create: (data: unknown) => apiPost('/customers', data),
  update: (id: string, data: unknown) => apiPatch(`/customers/${id}`, data),
  profile: (customerId: string) => apiGet<Record<string, unknown>>('/customer-profiles', { customerId }),
  addresses: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/customer-addresses', params),
  consents: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/customer-consents', params),
};

export const applicationsService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/applications', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/applications/${id}`),
  create: (data: unknown) => apiPost('/applications', data),
  update: (id: string, data: unknown) => apiPatch(`/applications/${id}`, data),
  submit: (id: string, data?: unknown) => apiPost(`/applications/${id}/submit`, data ?? {}),
  evaluateEligibility: (data: unknown) => apiPost('/eligibility-results/evaluate', data),
  createBankLogin: (data: unknown) => apiPost('/bank-logins', data),
  createCreditReview: (data: unknown) => apiPost('/credit-reviews', data),
  createSanction: (data: unknown) => apiPost('/sanctions', data),
  createDisbursement: (data: unknown) => apiPost('/disbursements', data),
  timeline: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/application-timeline', params),
  eligibility: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/eligibility-results', params),
  bankLogins: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/bank-logins', params),
  creditReviews: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/credit-reviews', params),
  sanctions: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/sanctions', params),
  disbursements: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/disbursements', params),
};

export const documentsService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/documents', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/documents/${id}`),
  types: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/document-types', params ?? {}),
  requests: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/document-requests', params),
  deficiencies: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/document-deficiencies', params),
  ocrResults: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/ocr-results', params),
  verificationResults: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/verification-results', params),
  verify: (id: string, data: unknown) => apiPost(`/documents/${id}/verify`, data),
  approve: (id: string) => apiPost(`/documents/${id}/approve`),
  downloadUrl: (id: string) => apiGet<{ downloadUrl: string; expiresIn?: number }>(`/documents/${id}/download-url`),
};

export const productsService = {
  families: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/product-families', params ?? {}),
  list: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/products', params ?? {}),
  variants: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/product-variants', params ?? {}),
  eligibilityRules: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/eligibility-rules', params ?? {}),
  documentRules: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/document-rules', params ?? {}),
  lenders: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/lenders', params ?? {}),
  lenderPolicies: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/lender-policies', params ?? {}),
};

export const partnersService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/partners', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/partners/${id}`),
  create: (data: unknown) => apiPost<Record<string, unknown>>('/partners', data),
  update: (id: string, data: unknown) => apiPatch<Record<string, unknown>>(`/partners/${id}`, data),
  remove: (id: string) => apiDelete<Record<string, unknown>>(`/partners/${id}`),
};

export const referralsService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/referrals', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/referrals/${id}`),
  create: (data: unknown) => apiPost<Record<string, unknown>>('/referrals', data),
  types: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/referral-types', params ?? {}),
};

export const commissionsService = {
  ledger: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/commission-ledger', params),
  approvals: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/commission-approvals', params),
  payments: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/commission-payments', params),
  recoveries: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/commission-recoveries', params),
  adjustments: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/commission-adjustments', params),
  rules: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/commission-rules', params ?? {}),
  payoutCycles: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/commission-payout-cycles', params ?? {}),
  previewCycle: () => apiGet<Record<string, unknown>>('/commission-payout-cycles/preview'),
  generateCycle: (data: { month: number; year: number }) => apiPost<Record<string, unknown>>('/commission-payout-cycles/generate', data),
  executeCycle: (cycleId: string) => apiPost<Record<string, unknown>>(`/commission-payout-cycles/${cycleId}/execute`),
  analytics: async (params?: Record<string, unknown>) =>
    normalizeCommissionAnalytics(await apiGet<Record<string, unknown>>('/commission-analytics', params)),
  requestApproval: (data: { ledgerId: string; notes?: string }) =>
    apiPost<Record<string, unknown>>('/commission-approvals', data),
  approveApproval: (id: string, data?: unknown) =>
    apiPost<Record<string, unknown>>(`/commission-approvals/${id}/approve`, data ?? {}),
  rejectApproval: (id: string, data?: unknown) =>
    apiPost<Record<string, unknown>>(`/commission-approvals/${id}/reject`, data ?? {}),
  approvePayment: (id: string) => apiPost<Record<string, unknown>>(`/commission-payments/${id}/approve`),
  releasePayment: (id: string, data: unknown) =>
    apiPost<Record<string, unknown>>(`/commission-payments/${id}/release`, data),
};

export const notificationsService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/notifications', params),
  templates: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/notification-templates', params ?? {}),
  createTemplate: (data: unknown) => apiPost('/notification-templates', data),
  updateTemplate: (id: string, data: unknown) => apiPatch(`/notification-templates/${id}`, data),
  preferences: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/notification-preferences', params),
  emails: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/emails', params),
  sms: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/sms/logs', params),
  whatsapp: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/whatsapp', params),
  push: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/push/logs', params),
  communicationLogs: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/communication-logs', params),
  analytics: (params?: Record<string, unknown>) => apiGet<Record<string, unknown>>('/communication-logs/analytics', params),
  providers: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/communication-providers', params ?? {}),
  updateProvider: (id: string, data: unknown) => apiPatch(`/communication-providers/${id}`, data),
  queue: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/notification-queue', params ?? {}),
  deadLetters: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/notification-dead-letters', params ?? {}),
  resolveDeadLetter: (id: string) => apiPost(`/notification-dead-letters/${id}/resolve`),
  processQueue: () => apiPost('/notifications/process-queue'),
  markRead: (id: string) => apiPost(`/notifications/${id}/read`),
  markAllRead: (userId: string) => apiPost(`/notifications/users/${userId}/read-all`),
};

export { supportService } from './support.service';

export const usersService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/users', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/users/${id}`),
  create: (data: unknown) => apiPost<Record<string, unknown>>('/users', data),
  update: (id: string, data: unknown) => apiPatch<Record<string, unknown>>(`/users/${id}`, data),
  remove: (id: string) => apiDelete<Record<string, unknown>>(`/users/${id}`),
  roles: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/roles', params ?? {}),
  permissions: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/permissions', params ?? {}),
  rolePermissions: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/role-permissions', params ?? {}),
  userRoles: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/user-roles', params ?? {}),
};

export const employeesService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/employees', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/employees/${id}`),
  create: (data: unknown) => apiPost<Record<string, unknown>>('/employees', data),
  update: (id: string, data: unknown) => apiPatch<Record<string, unknown>>(`/employees/${id}`, data),
  remove: (id: string) => apiDelete<Record<string, unknown>>(`/employees/${id}`),
};

export const branchesService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/branches', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/branches/${id}`),
  create: (data: unknown) => apiPost<Record<string, unknown>>('/branches', data),
  update: (id: string, data: unknown) => apiPatch<Record<string, unknown>>(`/branches/${id}`, data),
  remove: (id: string) => apiDelete<Record<string, unknown>>(`/branches/${id}`),
  regions: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/branches/regions', params ?? {}),
  createRegion: (data: unknown) => apiPost<Record<string, unknown>>('/branches/regions', data),
  updateRegion: (id: string, data: unknown) => apiPatch<Record<string, unknown>>(`/branches/regions/${id}`, data),
};

export const eligibilityService = {
  calculate: (data: unknown) => apiPost<Record<string, unknown>>('/eligibility/calculate', data),
  rules: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/eligibility-rules', params ?? {}),
};

export const emiService = {
  calculate: (data: unknown) => apiPost<Record<string, unknown>>('/emi/calculate', data),
};

export const voiceAiService = {
  listSessions: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/ai/voice/sessions', params ?? {}),
  getSession: (sessionId: string) => apiGet<Record<string, unknown>>(`/ai/voice/sessions/${sessionId}`),
  createSession: (data: unknown) => apiPost<Record<string, unknown>>('/ai/voice/sessions', data),
  endSession: (sessionId: string) => apiPost<Record<string, unknown>>(`/ai/voice/sessions/${sessionId}/end`),
};

export const auditService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/audit-logs', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/audit-logs/${id}`),
  export: (params: Record<string, unknown>) => apiDownload('/audit-logs/export', params),
};

export const settingsService = {
  list: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/settings', params ?? {}),
  getByKey: (key: string) => apiGet<Record<string, unknown>>(`/settings/${key}`),
  update: (key: string, data: unknown) => apiPatch<Record<string, unknown>>(`/settings/${key}`, data),
};

export const campaignsService = {
  list: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/campaigns', params ?? {}),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/campaigns/${id}`),
  create: (data: unknown) => apiPost('/campaigns', data),
  update: (id: string, data: unknown) => apiPatch(`/campaigns/${id}`, data),
  remove: (id: string) => apiDelete(`/campaigns/${id}`),
};

export const kycService = {
  list: async (params: Record<string, unknown>) => {
    const customerId = String(params.customerId ?? '');
    if (!customerId) return { items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } };
    const q = { customerId };
    const [profile, pan, aadhaar] = await Promise.all([
      apiGet<Record<string, unknown> | null>('/kyc/profile', q).catch(() => null),
      apiGet<Record<string, unknown>[] | Record<string, unknown>>('/kyc/pan', q).catch(() => []),
      apiGet<Record<string, unknown>[] | Record<string, unknown>>('/kyc/aadhaar', q).catch(() => []),
    ]);
    const items: Record<string, unknown>[] = [];
    if (profile) items.push({ ...profile, kycType: 'PROFILE', id: profile.id ?? `profile-${customerId}` });
    const panRows = Array.isArray(pan) ? pan : pan ? [pan] : [];
    const aadhaarRows = Array.isArray(aadhaar) ? aadhaar : aadhaar ? [aadhaar] : [];
    for (const row of panRows) items.push({ ...row, kycType: 'PAN' });
    for (const row of aadhaarRows) items.push({ ...row, kycType: 'AADHAAR' });
    return { items, meta: { page: 1, limit: items.length || 20, total: items.length, totalPages: 1 } };
  },
  profile: (customerId: string) => apiGet<Record<string, unknown>>('/kyc/profile', { customerId }),
};

export const dashboardService = {
  leadAnalytics: () => leadsService.analytics(),
  commissionAnalytics: () => commissionsService.analytics(),
  ticketAnalytics: () => supportService.analytics(),
  recommendationAnalytics: () => recommendationsService.analytics(),
  recentLeads: () => leadsService.list({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  recentApplications: () => applicationsService.list({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  pendingDocuments: () => documentsService.list({ page: 1, limit: 5, status: 'PENDING_VERIFICATION' }),
};

export const loanFulfillmentService = {
  dashboard: async () => {
    const raw = await apiGet<Record<string, unknown>>('/loan-fulfillment/dashboard');
    const kpis = (raw.kpis ?? raw) as Record<string, unknown>;
    const charts = (raw.charts ?? {}) as Record<string, unknown>;
    const casesByStage = (charts.casesByStage as Array<Record<string, unknown>> | undefined) ?? [];
    const casesByProduct = (charts.casesByProduct as Array<Record<string, unknown>> | undefined) ?? [];
    const monthly = (charts.monthlyVolume as Array<Record<string, unknown>> | undefined) ?? [];
    const slices = (key: string) =>
      ((charts[key] as Array<Record<string, unknown>> | undefined) ?? []).map((r) => ({
        name: String(r.name ?? ''),
        amount: Number(r.amount ?? 0),
      }));

    return {
      totalCases: Number(kpis.totalCases ?? 0),
      activeCases: Number(kpis.activeCases ?? 0),
      sanctionedCount: Number(kpis.sanctionedCases ?? kpis.sanctionedCount ?? 0),
      disbursedCount: Number(kpis.disbursedCases ?? kpis.disbursedCount ?? 0),
      completedCount: Number(kpis.completedCases ?? kpis.completedCount ?? 0),
      rejectedCount: Number(kpis.rejectedCases ?? kpis.rejectedCount ?? 0),
      totalPipelineValue: Number(kpis.totalLoanAmount ?? kpis.totalPipelineValue ?? 0),
      totalSanctionedValue: Number(kpis.totalSanctionAmount ?? kpis.totalSanctionedValue ?? 0),
      totalDisbursedValue: Number(kpis.totalDisbursementAmount ?? kpis.totalDisbursedValue ?? 0),
      expectedRevenue: Number(kpis.totalExpectedRevenue ?? kpis.expectedRevenue ?? 0),
      revenueGenerated: Number(
        kpis.totalRevenueGenerated ??
          kpis.revenueGenerated ??
          monthly.reduce((s, m) => s + Number(m.revenue ?? 0), 0),
      ),
      pendingPayouts: Number(kpis.pendingPayoutAmount ?? kpis.pendingPayouts ?? 0),
      paidPayouts: Number(kpis.paidPayoutAmount ?? 0),
      pendingApprovals: Number(kpis.pendingApprovals ?? 0),
      pendingDocumentCases: Number(kpis.pendingDocumentCases ?? 0),
      openTasks: Number(kpis.openTasks ?? 0),
      overdueTasks: Number(kpis.overdueTasks ?? 0),
      avgCycleDays: Number(kpis.avgCycleDays ?? 0),
      todayLeads: Number(kpis.todayLeads ?? 0),
      todayLogins: Number(kpis.todayLogins ?? 0),
      todaySanctions: Number(kpis.todaySanctions ?? 0),
      todayDisbursements: Number(kpis.todayDisbursements ?? 0),
      pipeline: casesByStage.map((row) => ({
        stage: String(row.stage) as LoanCase['stage'],
        label: String(row.label ?? row.stage),
        count: Number(row.count ?? 0),
        amount: Number(row.amount ?? 0),
      })),
      monthlyVolume: monthly.map((row) => ({
        month: String(row.month ?? ''),
        cases: Number(row.cases ?? 0),
        disbursement: Number(row.disbursement ?? 0),
        revenue: Number(row.revenue ?? 0),
      })),
      revenueByBank: slices('revenueByBank'),
      revenueByPartner: slices('revenueByPartner'),
      revenueByEmployee: slices('revenueByEmployee'),
      loanTypeDistribution: casesByProduct.map((row) => ({
        name: String(row.product ?? row.name),
        amount: Number(row.count ?? row.amount ?? 0),
      })),
    } satisfies LoanFulfillmentDashboard;
  },
  listCases: (params: Record<string, unknown>) =>
    apiGetPaginated<LoanCase>('/loan-fulfillment/cases', params),
  getCase: (id: string) => apiGet<LoanCase>(`/loan-fulfillment/cases/${id}`),
  createCase: (data: CreateLoanCaseInput) => apiPost<LoanCase>('/loan-fulfillment/cases', data),
  updateCase: (id: string, data: Record<string, unknown>) =>
    apiPatch<LoanCase>(`/loan-fulfillment/cases/${id}`, data),
  advanceStage: (id: string, data: Record<string, unknown>) =>
    apiPost<LoanCase>(`/loan-fulfillment/cases/${id}/advance-stage`, data),
  setStakeholders: (id: string, data: Record<string, unknown>) =>
    apiPut<LoanCase>(`/loan-fulfillment/cases/${id}/stakeholders`, data),
  addDocument: (id: string, data: Record<string, unknown>) =>
    apiPost(`/loan-fulfillment/cases/${id}/documents`, data),
  addTask: (id: string, data: Record<string, unknown>) =>
    apiPost(`/loan-fulfillment/cases/${id}/tasks`, data),
  updateTask: (id: string, taskId: string, data: Record<string, unknown>) =>
    apiPatch<LoanCase>(`/loan-fulfillment/cases/${id}/tasks/${taskId}`, data),
  verifyDocument: (id: string, documentId: string) =>
    apiPost<LoanCase>(`/loan-fulfillment/cases/${id}/documents/${documentId}/verify`, {}),
  decideApproval: (id: string, approvalId: string, data: Record<string, unknown>) =>
    apiPost(`/loan-fulfillment/cases/${id}/approvals/${approvalId}/decide`, data),
  listRevenueRules: (params?: Record<string, unknown>) =>
    apiGetPaginated<LoanRevenueRule>('/loan-fulfillment/revenue-rules', params ?? {}),
  getRevenueRule: (id: string) => apiGet<LoanRevenueRule>(`/loan-fulfillment/revenue-rules/${id}`),
  createRevenueRule: (data: Record<string, unknown>) =>
    apiPost<LoanRevenueRule>('/loan-fulfillment/revenue-rules', data),
  updateRevenueRule: (id: string, data: Record<string, unknown>) =>
    apiPatch<LoanRevenueRule>(`/loan-fulfillment/revenue-rules/${id}`, data),
};

export const revenueDistributionService = {
  summary: async () => {
    const raw = await apiGet<Record<string, unknown>>('/revenue-distribution/summary');
    return {
      totalRules: Number(raw.totalRules ?? 0),
      activeRules: Number(raw.activeRules ?? 0),
      inactiveRules: Number(raw.inactiveRules ?? 0),
      totalRuns: Number(raw.totalRuns ?? 0),
      completedRuns: Number(raw.completedRuns ?? 0),
      pendingRuns: Number(raw.pendingRuns ?? 0),
      totalDistributed: Number(raw.totalDistributed ?? 0),
      totalGrossRevenue: Number(raw.totalGrossRevenue ?? 0),
      totalGst: Number(raw.totalGst ?? 0),
      totalTds: Number(raw.totalTds ?? 0),
      uniqueStakeholderTypes: Number(raw.uniqueStakeholderTypes ?? 0),
      stakeholderCount: Number(raw.stakeholderCount ?? 0),
    };
  },
  listRules: (params?: Record<string, unknown>) =>
    apiGetPaginated<import('@/features/drde/data/types').DistributionRule>(
      '/revenue-distribution/rules',
      params ?? {},
    ),
  getRule: (id: string) =>
    apiGet<import('@/features/drde/data/types').DistributionRule>(`/revenue-distribution/rules/${id}`),
  createRule: (data: Record<string, unknown>) =>
    apiPost<import('@/features/drde/data/types').DistributionRule>('/revenue-distribution/rules', data),
  updateRule: (id: string, data: Record<string, unknown>) =>
    apiPatch<import('@/features/drde/data/types').DistributionRule>(
      `/revenue-distribution/rules/${id}`,
      data,
    ),
  deleteRule: (id: string) =>
    apiDelete<import('@/features/drde/data/types').DistributionRule>(`/revenue-distribution/rules/${id}`),
  simulate: (data: Record<string, unknown>) =>
    apiPost<import('@/features/drde/data/types').SimulationResult>('/revenue-distribution/simulate', data),
  createRun: (data: Record<string, unknown>) =>
    apiPost<import('@/features/drde/data/types').DistributionRun>('/revenue-distribution/runs', data),
  listRuns: (params?: Record<string, unknown>) =>
    apiGetPaginated<import('@/features/drde/data/types').DistributionRun>(
      '/revenue-distribution/runs',
      params ?? {},
    ),
  getRun: (id: string) =>
    apiGet<import('@/features/drde/data/types').DistributionRun>(`/revenue-distribution/runs/${id}`),
  listAudit: (params?: Record<string, unknown>) =>
    apiGetPaginated<import('@/features/drde/data/types').DistributionAuditEvent>(
      '/revenue-distribution/audit',
      params ?? {},
    ),
};

export const bankReconciliationService = {
  summary: async () => {
    const raw = await apiGet<Record<string, unknown>>('/bank-reconciliation/summary');
    return {
      totalStatements: Number(raw.totalStatements ?? 0),
      reconciledStatements: Number(raw.reconciledStatements ?? 0),
      totalReceived: Number(raw.totalReceived ?? 0),
      totalExpected: Number(raw.totalExpected ?? 0),
      totalVariance: Number(raw.totalVariance ?? 0),
      shortPaymentCount: Number(raw.shortPaymentCount ?? 0),
      shortPaymentAmount: Number(raw.shortPaymentAmount ?? 0),
      excessCount: Number(raw.excessCount ?? 0),
      excessAmount: Number(raw.excessAmount ?? 0),
      matchedCount: Number(raw.matchedCount ?? 0),
      probableCount: Number(raw.probableCount ?? 0),
      unmatchedCount: Number(raw.unmatchedCount ?? 0),
      matchedPercent: Number(raw.matchedPercent ?? 0),
      pendingReviewCount: Number(raw.pendingReviewCount ?? 0),
      openDisputes: Number(raw.openDisputes ?? 0),
      acceptedCount: Number(raw.acceptedCount ?? 0),
      writtenOffCount: Number(raw.writtenOffCount ?? 0),
    };
  },
  listStatements: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/bank-reconciliation/statements', params ?? {}),
  getStatement: (id: string) =>
    apiGet<Record<string, unknown>>(`/bank-reconciliation/statements/${id}`),
  createStatement: (data: unknown) =>
    apiPost<Record<string, unknown>>('/bank-reconciliation/statements', data),
  reconcileStatement: (id: string) =>
    apiPost<Record<string, unknown>>(`/bank-reconciliation/statements/${id}/reconcile`),
  listMatches: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/bank-reconciliation/matches', params ?? {}),
  reviewMatch: (id: string, data: unknown) =>
    apiPatch<Record<string, unknown>>(`/bank-reconciliation/matches/${id}`, data),
  createDispute: (id: string, data: unknown) =>
    apiPost<Record<string, unknown>>(`/bank-reconciliation/matches/${id}/dispute`, data),
  listDisputes: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/bank-reconciliation/disputes', params ?? {}),
  updateDispute: (id: string, data: unknown) =>
    apiPatch<Record<string, unknown>>(`/bank-reconciliation/disputes/${id}`, data),
  listAudit: (params?: Record<string, unknown>) =>
    apiGetPaginated<Record<string, unknown>>('/bank-reconciliation/audit', params ?? {}),
};
