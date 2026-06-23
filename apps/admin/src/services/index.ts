import { recommendationsService } from './recommendations.service';
import { supportService } from './support.service';

import { normalizeCommissionAnalytics, normalizeLeadAnalytics } from '@/lib/analytics-helpers';
import { apiDownload, apiGet, apiGetPaginated, apiPatch, apiPost, apiDelete } from '@/lib/api';

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
  analytics: async (params?: Record<string, unknown>) =>
    normalizeCommissionAnalytics(await apiGet<Record<string, unknown>>('/commission-analytics', params)),
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
