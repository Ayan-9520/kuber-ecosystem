import { recommendationsService } from './recommendations.service';
import { supportService } from './support.service';

import { normalizeCommissionAnalytics, normalizeLeadAnalytics } from '@/lib/analytics-helpers';
import { apiDownload, apiGet, apiGetPaginated, apiPatch, apiPost } from '@/lib/api';

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
    normalizeLeadAnalytics(await apiGet<Record<string, unknown>>('/lead-analytics', params)),
  notes: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/lead-notes', params),
  activities: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/lead-activities', params),
  followUps: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/lead-followups', params),
  timeline: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/lead-timeline', params),
  scores: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/lead-scores', params),
  assign: (id: string, data: unknown) => apiPost(`/leads/${id}/assign`, data),
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
  timeline: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/application-timeline', params),
  eligibility: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/eligibility-results', params),
  bankLogins: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/bank-logins', params),
  creditReviews: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/credit-reviews', params),
  sanctions: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/sanctions', params),
  disbursements: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/disbursements', params),
  submit: (id: string) => apiPost(`/applications/${id}/submit`),
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
};

export const referralsService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/referrals', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/referrals/${id}`),
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
};

export const notificationsService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/notifications', params),
  templates: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/notification-templates', params ?? {}),
  createTemplate: (data: unknown) => apiPost('/notification-templates', data),
  updateTemplate: (id: string, data: unknown) => apiPatch(`/notification-templates/${id}`, data),
  preferences: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/notification-preferences', params),
  emails: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/emails', params),
  sms: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/sms', params),
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
  roles: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/roles', params ?? {}),
  permissions: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/permissions', params ?? {}),
  rolePermissions: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/role-permissions', params ?? {}),
  userRoles: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/user-roles', params ?? {}),
};

export const auditService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/audit-logs', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/audit-logs/${id}`),
  export: (params: Record<string, unknown>) => apiDownload('/audit-logs/export', params),
};

export const settingsService = {
  list: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/settings', params ?? {}),
  getByKey: (key: string) => apiGet<Record<string, unknown>>(`/settings/${key}`),
};

export const campaignsService = {
  list: (params?: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/campaigns', params ?? {}),
};

export const kycService = {
  list: (params: Record<string, unknown>) => apiGetPaginated<Record<string, unknown>>('/kyc', params),
  getById: (id: string) => apiGet<Record<string, unknown>>(`/kyc/${id}`),
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
