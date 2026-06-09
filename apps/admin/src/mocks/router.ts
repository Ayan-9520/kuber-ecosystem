import {
  MOCK_APPLICATIONS,
  MOCK_AUDIT_LOGS,
  MOCK_CAMPAIGNS,
  MOCK_COMMISSION_ANALYTICS,
  MOCK_COMMISSION_LEDGER,
  MOCK_CUSTOMERS,
  MOCK_DOCUMENTS,
  MOCK_LEAD_ANALYTICS,
  MOCK_LENDERS,
  MOCK_NOTIFICATIONS,
  MOCK_NOTIFICATION_TEMPLATES,
  MOCK_PARTNERS,
  MOCK_PERMISSIONS,
  MOCK_PRODUCT_FAMILIES,
  MOCK_PRODUCTS,
  MOCK_REFERRALS,
  MOCK_REFERRAL_TYPES,
  MOCK_ROLE_PERMISSIONS,
  MOCK_ROLES,
  MOCK_SETTINGS,
  MOCK_TICKETS,
  MOCK_TICKET_ANALYTICS,
  MOCK_USERS,
  MOCK_LEADS,
  mockApplicationTimeline,
  mockBankLogins,
  mockCommunicationLogs,
  mockCreditReviews,
  mockDisbursements,
  mockDocumentDeficiencies,
  mockEligibility,
  mockKycRecords,
  mockLeadActivities,
  mockLeadFollowUps,
  mockLeadNotes,
  mockLeadTimeline,
  mockOcrResults,
  mockSanctions,
  mockTicketMessages,
  mockVerificationResults,
  MOCK_COPILOT_ANALYTICS,
  MOCK_COPILOT_INSIGHTS,
  MOCK_COPILOT_RECOMMENDATIONS,
  mockCopilotLeadAnalysis,
  mockCopilotApplicationAnalysis,
  MOCK_LEAD_SCORING_ANALYTICS,
  MOCK_RECOMMENDATION_ANALYTICS,
  MOCK_KNOWLEDGE_CATEGORIES,
  MOCK_KNOWLEDGE_ARTICLES,
  MOCK_KNOWLEDGE_TAGS,
  MOCK_KNOWLEDGE_ANALYTICS,
  mockKnowledgeArticle,
  MOCK_RAG_DOCUMENTS,
  MOCK_RAG_ANALYTICS,
  mockRagDocument,
  MOCK_AI_PLATFORM_HEALTH,
  MOCK_AI_MODELS,
  MOCK_AI_USAGE,
  MOCK_AI_COSTS,
  MOCK_AI_PROMPTS,
  mockLeadScoreResult,
  mockRecommendationBundle,
} from './data';
import { findById, mockDelay, paginate, daysAgo } from './helpers';

function matchId(url: string, prefix: string): string | null {
  const re = new RegExp(`^${prefix}/([^/?]+)$`);
  const m = url.match(re);
  return m?.[1] ?? null;
}

function ticketTimelineId(path: string): string | null {
  const parts = path.split('/');
  if (parts.length === 4 && parts[1] === 'tickets' && parts[3] === 'timeline') {
    return parts[2] ?? null;
  }
  return null;
}

export async function mockGetPaginated(
  url: string,
  params?: Record<string, unknown>,
): Promise<{ items: Record<string, unknown>[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
  await mockDelay();
  const path = url.split('?')[0] ?? url;

  if (path === '/leads') return paginate(MOCK_LEADS, params) as never;
  if (path === '/customers') return paginate(MOCK_CUSTOMERS, params) as never;
  if (path === '/applications') return paginate(MOCK_APPLICATIONS, params) as never;
  if (path === '/documents') return paginate(MOCK_DOCUMENTS, params) as never;
  if (path === '/partners') return paginate(MOCK_PARTNERS, params) as never;
  if (path === '/referrals') return paginate(MOCK_REFERRALS, params) as never;
  if (path === '/referral-types') return paginate(MOCK_REFERRAL_TYPES, params) as never;
  if (path === '/tickets') return paginate(MOCK_TICKETS, params) as never;
  if (path === '/users') return paginate(MOCK_USERS, params) as never;
  if (path === '/roles') return paginate(MOCK_ROLES, params) as never;
  if (path === '/permissions') return paginate(MOCK_PERMISSIONS, params) as never;
  if (path === '/role-permissions') return paginate(MOCK_ROLE_PERMISSIONS, params) as never;
  if (path === '/audit-logs') return paginate(MOCK_AUDIT_LOGS, params) as never;
  if (path === '/settings') return paginate(MOCK_SETTINGS, params) as never;
  if (path === '/campaigns') return paginate(MOCK_CAMPAIGNS, params) as never;
  if (path === '/notifications') return paginate(MOCK_NOTIFICATIONS, params) as never;
  if (path === '/notification-templates') return paginate(MOCK_NOTIFICATION_TEMPLATES, params) as never;
  if (path === '/commission-ledger') return paginate(MOCK_COMMISSION_LEDGER, params) as never;
  if (path === '/commission-approvals') return paginate(MOCK_COMMISSION_LEDGER.filter((c) => c.status === 'PENDING'), params) as never;
  if (path === '/commission-payments') return paginate(MOCK_COMMISSION_LEDGER.filter((c) => c.status === 'PAID'), params) as never;
  if (path === '/commission-recoveries') return paginate([], params) as never;
  if (path === '/commission-adjustments') return paginate([], params) as never;
  if (path === '/product-families') return paginate(MOCK_PRODUCT_FAMILIES, params) as never;
  if (path === '/products') return paginate(MOCK_PRODUCTS, params) as never;
  if (path === '/product-variants') return paginate(MOCK_PRODUCTS.map((p) => ({ ...p, id: `${p.id}-v`, variantName: 'Standard' })), params) as never;
  if (path === '/eligibility-rules') return paginate([{ id: 'er-1', name: 'Min Age 21', productName: 'Home Loan', status: 'ACTIVE' }], params) as never;
  if (path === '/document-rules') return paginate([{ id: 'dr-1', name: 'PAN Required', productName: 'Personal Loan', status: 'ACTIVE' }], params) as never;
  if (path === '/lenders') return paginate(MOCK_LENDERS, params) as never;
  if (path === '/lender-policies') return paginate(MOCK_LENDERS.map((l) => ({ ...l, id: `${l.id}-pol`, policyName: 'Standard Policy' })), params) as never;
  if (path === '/notification-preferences') return paginate([{ id: 'np-1', channel: 'EMAIL', enabled: true }], params) as never;
  if (path === '/emails') return paginate(mockCommunicationLogs().filter((c) => c.channel === 'EMAIL'), params) as never;
  if (path === '/email/templates') return paginate([
    { id: 'et-1', code: 'APPLICATION_SUBMITTED', name: 'Application Submitted', category: 'TRANSACTIONAL', eventType: 'APPLICATION_SUBMITTED', currentVersion: 1, isActive: true, locale: 'en' },
    { id: 'et-2', code: 'LOGIN_OTP', name: 'Login OTP', category: 'TRANSACTIONAL', eventType: 'LOGIN_OTP', currentVersion: 1, isActive: true, locale: 'en' },
  ], params) as never;
  if (path === '/email/logs') return paginate([
    { id: 'ed-1', status: 'DELIVERED', providerRef: 'sg-mock-1', sentAt: new Date().toISOString(), deliveredAt: new Date().toISOString(), provider: { name: 'SendGrid' } },
  ], params) as never;
  if (path === '/email/providers') return paginate([
    { id: 'ep-1', code: 'EMAIL_SENDGRID', name: 'SendGrid', providerType: 'SENDGRID', isActive: true, isDefault: true, rateLimit: 200 },
    { id: 'ep-2', code: 'EMAIL_AWS_SES', name: 'AWS SES', providerType: 'AWS_SES', isActive: true, isDefault: false, rateLimit: 500 },
  ], params) as never;
  if (path === '/email/queue') return paginate([{ id: 'eq-1', toEmail: 'user@example.com', queueType: 'NOTIFICATION', priority: 'NORMAL', status: 'PENDING', retryCount: 0 }], params) as never;
  if (path === '/email/preferences') return paginate([{ id: 'epr-1', userId: 'user-1', category: 'MARKETING', enabled: true, marketingOptIn: false }], params) as never;
  if (path === '/sms') return paginate(mockCommunicationLogs().filter((c) => c.channel === 'SMS'), params) as never;
  if (path === '/sms/templates') return paginate([
    { id: 'st-1', code: 'APPLICATION_SUBMITTED', name: 'Application Submitted', category: 'TRANSACTIONAL', eventType: 'APPLICATION_SUBMITTED', currentVersion: 1, isActive: true, locale: 'en' },
    { id: 'st-2', code: 'LOGIN_OTP', name: 'Login OTP', category: 'OTP', eventType: 'LOGIN_OTP', currentVersion: 1, isActive: true, locale: 'en' },
  ], params) as never;
  if (path === '/sms/logs') return paginate([
    { id: 'sd-1', status: 'DELIVERED', toPhone: '+919876543210', providerRef: 'msg91-mock-1', sentAt: new Date().toISOString(), deliveredAt: new Date().toISOString(), provider: { name: 'MSG91' } },
  ], params) as never;
  if (path === '/sms/providers') return paginate([
    { id: 'sp-1', code: 'SMS_MSG91', name: 'MSG91', providerType: 'MSG91', isActive: true, isDefault: true, rateLimit: 200 },
    { id: 'sp-2', code: 'SMS_TWILIO', name: 'Twilio', providerType: 'TWILIO', isActive: true, isDefault: false, rateLimit: 100 },
  ], params) as never;
  if (path === '/sms/queue') return paginate([{ id: 'sq-1', toPhone: '+919876543210', queueType: 'OTP', priority: 'URGENT', status: 'PENDING', retryCount: 0 }], params) as never;
  if (path === '/sms/preferences') return paginate([{ id: 'spr-1', userId: 'user-1', category: 'MARKETING', enabled: true, marketingOptIn: false }], params) as never;
  if (path === '/whatsapp') return paginate(mockCommunicationLogs().filter((c) => c.channel === 'WHATSAPP'), params) as never;
  if (path === '/communication-logs') return paginate(mockCommunicationLogs(), params) as never;
  if (path === '/communication-providers') return paginate([
    { id: 'cp-1', code: 'EMAIL_SENDGRID', name: 'SendGrid Email', channel: 'EMAIL', providerType: 'SENDGRID', isActive: true, isDefault: true, rateLimit: 100 },
    { id: 'cp-2', code: 'SMS_MSG91', name: 'MSG91 SMS', channel: 'SMS', providerType: 'MSG91', isActive: true, isDefault: true, rateLimit: 200 },
    { id: 'cp-3', code: 'WA_META', name: 'Meta WhatsApp', channel: 'WHATSAPP', providerType: 'META_WHATSAPP', isActive: true, isDefault: true, rateLimit: 80 },
    { id: 'cp-4', code: 'PUSH_FCM', name: 'Firebase FCM', channel: 'PUSH', providerType: 'FCM', isActive: true, isDefault: true, rateLimit: 500 },
  ], params) as never;
  if (path === '/notification-queue') return paginate([
    { id: 'nq-1', channel: 'EMAIL', eventType: 'APPLICATION_SUBMITTED', queueType: 'NOTIFICATION', status: 'PENDING', retryCount: 0 },
  ], params) as never;
  if (path === '/notification-dead-letters') return paginate([
    { id: 'dl-1', channel: 'SMS', eventType: 'LOGIN_OTP', errorMessage: 'Provider timeout', retryCount: 3, createdAt: new Date().toISOString() },
  ], params) as never;
  if (path === '/push') return paginate(mockCommunicationLogs().filter((c) => c.channel === 'PUSH'), params) as never;
  if (path === '/ticket-assignments') return paginate(MOCK_TICKETS.map((t) => ({ id: `ta-${t.id}`, ticketId: t.id, assignedTo: t.assignedToName })), params) as never;
  if (path === '/ticket-escalations') return paginate(MOCK_TICKETS.filter((t) => t.status === 'ESCALATED').map((t) => ({ id: `te-${t.id}`, ticketId: t.id, reason: 'SLA breach' })), params) as never;
  if (path === '/ticket-resolutions') return paginate(MOCK_TICKETS.filter((t) => t.status === 'RESOLVED').map((t) => ({ id: `tr-${t.id}`, ticketId: t.id, resolution: 'Issue resolved' })), params) as never;
  if (path === '/ticket-categories') return paginate([{ id: 'tc-1', name: 'Technical' }, { id: 'tc-2', name: 'Application' }], params) as never;
  if (path === '/ticket-messages') return paginate(mockTicketMessages(String(params?.ticketId ?? 'tkt-001')), params) as never;
  if (path === '/lead-notes') return paginate(mockLeadNotes(String(params?.leadId ?? 'lead-001')), params) as never;
  if (path === '/lead-activities') return paginate(mockLeadActivities(String(params?.leadId ?? 'lead-001')), params) as never;
  if (path === '/lead-followups') return paginate(mockLeadFollowUps(String(params?.leadId ?? 'lead-001')), params) as never;
  if (path === '/lead-timeline') return paginate(mockLeadTimeline(String(params?.leadId ?? 'lead-001')), params) as never;
  if (path === '/application-timeline') return paginate(mockApplicationTimeline(String(params?.applicationId ?? 'app-001')), params) as never;
  if (path === '/eligibility-results') return paginate(mockEligibility(String(params?.applicationId ?? 'app-001')), params) as never;
  if (path === '/bank-logins') return paginate(mockBankLogins(String(params?.applicationId ?? 'app-001')), params) as never;
  if (path === '/credit-reviews') return paginate(mockCreditReviews(String(params?.applicationId ?? 'app-001')), params) as never;
  if (path === '/sanctions') return paginate(mockSanctions(String(params?.applicationId ?? 'app-001')), params) as never;
  if (path === '/disbursements') return paginate(mockDisbursements(String(params?.applicationId ?? 'app-001')), params) as never;
  if (path === '/kyc') return paginate(mockKycRecords(String(params?.customerId ?? 'cust-001')), params) as never;
  if (path === '/ocr-results') return paginate(mockOcrResults(String(params?.documentId ?? 'doc-001')), params) as never;
  if (path === '/verification-results') return paginate(mockVerificationResults(String(params?.documentId ?? 'doc-001')), params) as never;
  if (path === '/document-deficiencies') return paginate(mockDocumentDeficiencies(String(params?.documentId ?? 'doc-001')), params) as never;

  const timelineTicketId = ticketTimelineId(path);
  if (timelineTicketId) {
    return paginate(mockLeadTimeline(timelineTicketId), params) as never;
  }

  return paginate([], params) as never;
}

export async function mockGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  await mockDelay();
  const path = url.split('?')[0] ?? url;

  if (path === '/analytics/overview') return {
    period: { timePreset: 'THIS_MONTH' },
    scorecards: [
      { code: 'total_leads', name: 'Total Leads', value: 1240, unit: 'count' },
      { code: 'revenue', name: 'Revenue', value: 48500000, unit: 'INR' },
      { code: 'disbursements', name: 'Disbursements', value: 186, unit: 'count' },
      { code: 'approval_rate', name: 'Approval Rate', value: 72.4, unit: 'percent' },
    ],
    applications: { totalApplications: 420, sanctioned: 298, disbursed: 186, approvalRate: 72.4 },
    support: { openTickets: 34 },
    notifications: { total: 8420 },
    ai: { totalRequests: 1560 },
  } as T;
  if (path === '/analytics/kpis') return {
    kpis: [
      { code: 'total_leads', name: 'Total Leads', value: 1240, unit: 'count' },
      { code: 'hot_leads', name: 'Hot Leads', value: 312, unit: 'count' },
      { code: 'revenue', name: 'Revenue', value: 48500000, unit: 'INR' },
      { code: 'commission_paid', name: 'Commission Paid', value: 1240000, unit: 'INR' },
    ],
  } as T;
  if (path === '/executive-analytics/dashboard') return {
    period: { timePreset: 'THIS_MONTH', periodType: 'MONTHLY' },
    executiveRole: 'SALES_EXECUTIVE',
    employee: { id: 'emp-1', name: 'Demo Executive', designation: 'Sales Executive' },
    kpis: [
      { code: 'leads_assigned', name: 'Leads Assigned', value: 48, unit: 'count', target: 50, achievementPct: 96 },
      { code: 'conversions', name: 'Conversions', value: 12, unit: 'count', target: 15, achievementPct: 80 },
      { code: 'revenue_generated', name: 'Revenue Generated', value: 4200000, unit: 'INR', target: 5000000, achievementPct: 84 },
      { code: 'target_achievement_pct', name: 'Target Achievement %', value: 84, unit: 'percent' },
    ],
    productivity: { daily_activity: 22, task_completion: 78, pending_workload: 5 },
    ai: { aiUsage: 45, voiceAiUsage: 12, copilotUsage: 28, recommendationAdoption: 8, aiEffectiveness: 92 },
  } as T;
  if (path === '/executive-analytics/performance') return {
    scores: { performanceScore: 82, productivityScore: 76, qualityScore: 88, complianceScore: 91, overallRating: 84 },
    kpis: [],
  } as T;
  if (path === '/executive-analytics/leaderboard') return {
    entries: [
      { rank: 1, score: 92, employee: { firstName: 'Asha', lastName: 'Verma' } },
      { rank: 2, score: 88, employee: { firstName: 'Rahul', lastName: 'Mehta' } },
    ],
  } as T;
  if (path === '/executive-analytics/forecast') return {
    forecasts: [
      { metricCode: 'revenue_generated', metricName: 'Revenue Generated', currentValue: 4200000, predictedValue: 5100000, confidence: 78 },
    ],
  } as T;
  if (path === '/executive-analytics/targets') return paginate([
    { id: 't1', metricName: 'Leads Assigned', targetValue: 50, actualValue: 48, achievementPct: 96, employee: { firstName: 'Demo', lastName: 'Executive' } },
  ], params) as never;
  if (path === '/branch-analytics/dashboard') return {
    period: { timePreset: 'THIS_MONTH', periodType: 'MONTHLY' },
    branch: { id: 'br-1', name: 'Mumbai Central', code: 'MUM-01', city: 'Mumbai', state: 'MH' },
    scores: { growthScore: 78, revenueScore: 82, operationsScore: 74, complianceScore: 88, customerScore: 80, overallScore: 80 },
    kpis: [
      { code: 'total_leads', name: 'Total Leads', value: 320, unit: 'count', target: 400, achievementPct: 80 },
      { code: 'revenue_generated', name: 'Revenue Generated', value: 12500000, unit: 'INR', target: 15000000, achievementPct: 83 },
      { code: 'applications_disbursed', name: 'Applications Disbursed', value: 42, unit: 'count' },
      { code: 'conversion_rate', name: 'Conversion Rate', value: 28.5, unit: 'percent' },
    ],
    executiveAnalytics: {
      topPerformers: [
        { employee: { id: 'e1', firstName: 'Priya', lastName: 'Shah' }, leads: 48, apps: 12, revenue: 3200000 },
      ],
    },
    ai: { aiUsage: 120, voiceAiUsage: 35, copilotUsage: 68, recommendationAdoption: 22, aiEffectiveness: 91 },
  } as T;
  if (path === '/branch-analytics/performance') return {
    scores: { growthScore: 78, revenueScore: 82, operationsScore: 74, complianceScore: 88, customerScore: 80, overallScore: 80 },
    kpis: [],
  } as T;
  if (path === '/branch-analytics/revenue') return {
    kpis: [
      { code: 'revenue_generated', name: 'Revenue Generated', value: 12500000, unit: 'INR' },
      { code: 'revenue_achievement_pct', name: 'Revenue Achievement %', value: 83, unit: 'percent' },
    ],
    trends: [],
  } as T;
  if (path === '/branch-analytics/leads') return {
    kpis: [
      { code: 'total_leads', name: 'Total Leads', value: 320, unit: 'count' },
      { code: 'hot_leads', name: 'Hot Leads', value: 86, unit: 'count' },
    ],
    sources: [{ sourceId: 's1', sourceName: 'Website', count: 120 }],
  } as T;
  if (path === '/branch-analytics/applications') return {
    kpis: [
      { code: 'applications_created', name: 'Applications Created', value: 98, unit: 'count' },
      { code: 'approval_rate', name: 'Approval Rate', value: 72, unit: 'percent' },
    ],
    productMix: [{ productId: 'p1', productName: 'Home Loan', familyCode: 'HL', count: 45 }],
  } as T;
  if (path === '/branch-analytics/partners') return {
    partners: [
      { partnerId: 'pt1', partnerName: 'ABC DSA', partnerType: 'DSA', leads: 64, conversions: 18, conversionRate: 28.1, revenue: 4200000 },
    ],
  } as T;
  if (path === '/branch-analytics/forecast') return {
    forecasts: [
      { metricCode: 'revenue_generated', metricName: 'Revenue Generated', currentValue: 12500000, predictedValue: 14800000, confidence: 76 },
    ],
  } as T;
  if (path === '/branch-analytics/rankings') return {
    entries: [
      { rank: 1, score: 88, branch: { name: 'Mumbai Central' } },
      { rank: 2, score: 84, branch: { name: 'Pune West' } },
    ],
  } as T;
  if (path.startsWith('/branch-analytics/')) return {} as T;
  if (path === '/regional-analytics/dashboard') return {
    period: { timePreset: 'THIS_MONTH', periodType: 'MONTHLY' },
    region: { id: 'reg-1', name: 'West Region', code: 'WEST' },
    scores: { revenueScore: 85, growthScore: 78, operationsScore: 72, complianceScore: 90, customerScore: 82, aiAdoptionScore: 68, overallScore: 79 },
    kpis: [
      { code: 'total_branches', name: 'Total Branches', value: 12, unit: 'count' },
      { code: 'total_leads', name: 'Total Leads', value: 2840, unit: 'count' },
      { code: 'total_revenue', name: 'Total Revenue', value: 98500000, unit: 'INR' },
      { code: 'regional_growth_rate', name: 'Regional Growth Rate', value: 14.2, unit: 'percent' },
    ],
    executiveAnalytics: {
      topPerformers: [
        { employee: { id: 'e1', firstName: 'Amit', lastName: 'Kulkarni' }, leads: 128, apps: 34, revenue: 8200000 },
      ],
    },
    ai: { aiUsage: 420, voiceAiUsage: 95, copilotUsage: 210, recommendationAdoption: 58, aiConversionImpact: 89 },
  } as T;
  if (path === '/regional-analytics/revenue') return {
    kpis: [
      { code: 'revenue_generated', name: 'Regional Revenue', value: 98500000, unit: 'INR' },
      { code: 'revenue_achievement_pct', name: 'Revenue Achievement %', value: 87, unit: 'percent' },
    ],
    trends: [],
  } as T;
  if (path === '/regional-analytics/leads') return {
    kpis: [
      { code: 'regional_leads', name: 'Regional Leads', value: 2840, unit: 'count' },
      { code: 'conversion_rate', name: 'Lead Conversion Rate', value: 26.4, unit: 'percent' },
    ],
    sources: [{ sourceId: 's1', sourceName: 'DSA', count: 980 }],
  } as T;
  if (path === '/regional-analytics/applications') return {
    kpis: [
      { code: 'applications_created', name: 'Applications Created', value: 680, unit: 'count' },
      { code: 'approval_rate', name: 'Approval Rate', value: 74, unit: 'percent' },
    ],
  } as T;
  if (path === '/regional-analytics/branches') return {
    comparison: {
      topBranches: [
        { branch: { id: 'b1', name: 'Mumbai Central' }, leads: 420, apps: 98, revenue: 28500000, conversionRate: 28.5 },
        { branch: { id: 'b2', name: 'Pune West' }, leads: 380, apps: 86, revenue: 24200000, conversionRate: 26.1 },
      ],
    },
  } as T;
  if (path === '/regional-analytics/partners') return {
    partners: [
      { partnerId: 'p1', partnerName: 'Prime DSA', partnerType: 'DSA', leads: 320, conversions: 88, conversionRate: 27.5, revenue: 12400000 },
    ],
  } as T;
  if (path === '/regional-analytics/forecast') return {
    forecasts: [
      { metricCode: 'revenue_generated', metricName: 'Regional Revenue', currentValue: 98500000, predictedValue: 112000000, confidence: 81 },
    ],
  } as T;
  if (path === '/regional-analytics/rankings') return {
    entries: [
      { rank: 1, score: 28500000, branch: { name: 'Mumbai Central' } },
      { rank: 2, score: 24200000, branch: { name: 'Pune West' } },
    ],
  } as T;
  if (path.startsWith('/regional-analytics/')) return {} as T;
  if (path.startsWith('/executive-analytics/')) return {} as T;
  if (path.startsWith('/analytics/')) return {} as T;

  if (path === '/lead-analytics') return MOCK_LEAD_ANALYTICS as T;
  if (path === '/commission-analytics') return MOCK_COMMISSION_ANALYTICS as T;
  if (path === '/ticket-analytics') return MOCK_TICKET_ANALYTICS as T;
  if (path === '/ai-copilot/analytics') return MOCK_COPILOT_ANALYTICS as T;
  if (path === '/lead-scoring/analytics') return MOCK_LEAD_SCORING_ANALYTICS as T;
  if (path === '/recommendations/analytics') return MOCK_RECOMMENDATION_ANALYTICS as T;
  if (path === '/ai/platform/health' || path === '/ai/health') return MOCK_AI_PLATFORM_HEALTH as T;
  if (path === '/ai/platform/models' || path === '/ai/models') return MOCK_AI_MODELS as T;
  if (path === '/ai/platform/usage' || path === '/ai/usage') return MOCK_AI_USAGE as T;
  if (path === '/ai/platform/costs' || path === '/ai/costs') return MOCK_AI_COSTS as T;
  if (path === '/ai/platform/prompts' || path === '/ai/prompts') return MOCK_AI_PROMPTS as T;
  if (path === '/ai/platform/errors' || path === '/ai/errors') return { items: [] } as T;

  if (path === '/push/templates') return paginate([
    { id: 'pt-1', code: 'APPLICATION_SUBMITTED_PUSH', name: 'Application Submitted', category: 'TRANSACTIONAL', eventType: 'APPLICATION_SUBMITTED', isActive: true },
    { id: 'pt-2', code: 'LEAD_ASSIGNED_PUSH', name: 'Lead Assigned', category: 'TRANSACTIONAL', eventType: 'LEAD_ASSIGNED', isActive: true },
  ], params) as never;
  if (path === '/push/logs') return paginate([
    { id: 'pd-1', status: 'DELIVERED', providerRef: 'fcm-mock-1', sentAt: new Date().toISOString(), openedAt: new Date().toISOString() },
  ], params) as never;
  if (path === '/push/providers') return paginate([
    { id: 'pp-1', code: 'PUSH_FCM', name: 'Firebase Cloud Messaging', providerType: 'FCM', isActive: true, isDefault: true, rateLimit: 500 },
  ], params) as never;
  if (path === '/push/topics') return paginate([
    { id: 'pto-1', code: 'dsa_leads', name: 'DSA Leads', topicType: 'ROLE', appTarget: 'DSA', isActive: true },
    { id: 'pto-2', code: 'customer_application_updates', name: 'Application Updates', topicType: 'CUSTOM', appTarget: 'CUSTOMER', isActive: true },
  ], params) as never;
  if (path === '/push/queue') return paginate([{ id: 'pq-1', queueType: 'NOTIFICATION', priority: 'NORMAL', status: 'PENDING', retryCount: 0 }], params) as never;
  if (path === '/push/preferences') return paginate([{ id: 'ppr-1', userId: 'user-1', category: 'MARKETING', enabled: true, doNotDisturb: false }], params) as never;
  if (path === '/push/analytics') return {
    notificationsSent: 28400,
    notificationsDelivered: 27100,
    deliveryRate: 95.4,
    openRate: 38.2,
    clickRate: 12.5,
    failureRate: 3.1,
    templatePerformance: [
      { templateId: 'LEAD_ASSIGNED_PUSH', sent: 4200, delivered: 4050, opened: 1800, openRate: 44.4 },
      { templateId: 'APPLICATION_SUBMITTED_PUSH', sent: 3100, delivered: 2980, opened: 1200, openRate: 40.3 },
    ],
    topicPerformance: [
      { topicCode: 'dsa_leads', sent: 8500, delivered: 8200, failed: 120 },
      { topicCode: 'customer_application_updates', sent: 6200, delivered: 6000, failed: 80 },
    ],
  } as T;

  if (path === '/sms/analytics') return {
    smsSent: 12450,
    smsDelivered: 11980,
    deliveryRate: 96.2,
    failureRate: 2.8,
    rejectedRate: 1.0,
    otpSent: 4200,
    otpVerified: 3950,
    otpFailed: 180,
    otpSuccessRate: 94.0,
    otpFailureRate: 4.3,
    templatePerformance: [
      { templateId: 'LOGIN_OTP', sent: 4200, delivered: 4050, failed: 50, deliveryRate: 96.4 },
      { templateId: 'APPLICATION_SUBMITTED', sent: 1800, delivered: 1750, failed: 20, deliveryRate: 97.2 },
    ],
    providerPerformance: [
      { providerId: 'SMS_MSG91', sent: 9000, delivered: 8700, failed: 120, deliveryRate: 96.7 },
      { providerId: 'SMS_TWILIO', sent: 3450, delivered: 3280, failed: 80, deliveryRate: 95.1 },
    ],
    categoryBreakdown: [
      { category: 'OTP', sent: 4200, delivered: 4050, failed: 50, otpSent: 4200 },
      { category: 'TRANSACTIONAL', sent: 7200, delivered: 6950, failed: 100, otpSent: 0 },
    ],
  } as T;

  if (path === '/email/analytics') return {
    emailsSent: 8420,
    deliveryRate: 96.4,
    openRate: 41.2,
    clickRate: 14.8,
    bounceRate: 1.9,
    failureRate: 2.1,
    unsubscribedCount: 12,
    templatePerformance: [
      { templateId: 'APPLICATION_SUBMITTED', sent: 1200, opened: 520, clicked: 180, failed: 15, openRate: 43.3 },
      { templateId: 'LOGIN_OTP', sent: 3400, opened: 2100, clicked: 0, failed: 8, openRate: 61.8 },
    ],
    categoryBreakdown: [
      { category: 'TRANSACTIONAL', sent: 6200, delivered: 6100, opened: 2800, failed: 50 },
      { category: 'MARKETING', sent: 1500, delivered: 1420, opened: 620, failed: 30 },
    ],
  } as T;
  if (path === '/communication-logs/analytics') return {
    messagesSent: 1240,
    deliveryRate: 94.2,
    openRate: 38.5,
    clickRate: 12.1,
    failureRate: 2.3,
    sentCount: 1180,
    deliveredCount: 1168,
    openedCount: 478,
    clickedCount: 150,
    failedCount: 28,
    channelPerformance: [
      { channel: 'EMAIL', total: 520, sent: 510, failed: 10, deliveryRate: 98.1, failureRate: 1.9 },
      { channel: 'SMS', total: 380, sent: 372, failed: 8, deliveryRate: 97.9, failureRate: 2.1 },
      { channel: 'WHATSAPP', total: 210, sent: 205, failed: 5, deliveryRate: 97.6, failureRate: 2.4 },
      { channel: 'PUSH', total: 130, sent: 93, failed: 5, deliveryRate: 71.5, failureRate: 3.8 },
    ],
  } as T;
  if (path === '/rag/analytics') return MOCK_RAG_ANALYTICS as T;
  if (path === '/rag/documents') return { items: MOCK_RAG_DOCUMENTS, meta: { total: MOCK_RAG_DOCUMENTS.length, page: 1, limit: 20 } } as T;
  if (path === '/rag/search') {
    const q = String(params?.q ?? '').toLowerCase();
    const chunks = MOCK_RAG_DOCUMENTS
      .filter((d) => d.title.toLowerCase().includes(q) || !q)
      .map((d, i) => ({
        chunkId: `ch-mock-${i}`,
        documentTitle: d.title,
        content: `Retrieved context from ${d.title} matching "${q || 'query'}".`,
        score: 0.92 - i * 0.05,
      }));
    return { chunks } as T;
  }
  if (path === '/rag/context') {
    return {
      snippets: ['[POLICY] Home Loan Eligibility: Minimum income ₹25,000, CIBIL 700+'],
      policies: ['Minimum income ₹25,000 for salaried applicants'],
      faqs: ['Q: CIBIL impact\nA: Score below 650 may require co-applicant'],
      source: 'ADMIN',
      generatedAt: new Date().toISOString(),
    } as T;
  }

  const ragDocumentId = matchId(path, '/rag/documents');
  if (ragDocumentId) return mockRagDocument(ragDocumentId) as T;

  if (path === '/knowledge/analytics') return MOCK_KNOWLEDGE_ANALYTICS as T;
  if (path === '/knowledge/categories') return MOCK_KNOWLEDGE_CATEGORIES as T;
  if (path === '/knowledge/tags') return MOCK_KNOWLEDGE_TAGS as T;
  if (path === '/knowledge/articles') return { items: MOCK_KNOWLEDGE_ARTICLES, meta: { total: MOCK_KNOWLEDGE_ARTICLES.length, page: 1, limit: 20, totalPages: 1 } } as T;
  if (path === '/knowledge/approvals') return { items: [{ id: 'ap-1', articleId: 'ka-5', articleTitle: 'KYC Document Checklist', articleStatus: 'REVIEW', action: 'SUBMITTED', actorRole: 'AUTHOR', createdAt: daysAgo(0) }], meta: { page: 1, limit: 20 } } as T;
  if (path === '/knowledge/reviews') return { items: [{ id: 'rv-1', articleId: 'ka-5', articleTitle: 'KYC Document Checklist', reviewerId: 'user-002', status: 'PENDING', createdAt: daysAgo(0) }], meta: { page: 1, limit: 20 } } as T;

  const knowledgeArticleId = matchId(path, '/knowledge/articles');
  if (knowledgeArticleId) return mockKnowledgeArticle(knowledgeArticleId) as T;

  if (path === '/knowledge/search') {
    const q = String(params?.q ?? '').toLowerCase();
    const filtered = MOCK_KNOWLEDGE_ARTICLES.filter((a) =>
      a.title.toLowerCase().includes(q) || (a.summary ?? '').toLowerCase().includes(q),
    );
    return { items: filtered.length ? filtered : MOCK_KNOWLEDGE_ARTICLES, meta: { total: filtered.length || MOCK_KNOWLEDGE_ARTICLES.length, searchType: 'fulltext' } } as T;
  }

  if (path === '/ai-copilot/insights') return MOCK_COPILOT_INSIGHTS as T;
  if (path === '/ai-copilot/recommendations') return MOCK_COPILOT_RECOMMENDATIONS as T;

  const scoringLeadId = matchId(path, '/lead-scoring/calculate');
  if (scoringLeadId) return mockLeadScoreResult(scoringLeadId) as T;

  const scoringHistoryId = matchId(path, '/lead-scoring/history');
  if (scoringHistoryId) {
    const latest = mockLeadScoreResult(scoringHistoryId);
    return { history: [{ id: 'h1', newScore: latest.score, newGrade: latest.grade }], latestScore: latest, riskProfile: { riskRating: latest.riskRating }, predictions: [] } as T;
  }

  const recCustomerId = matchId(path, '/recommendations/customer');
  if (recCustomerId) return mockRecommendationBundle('CUSTOMER', recCustomerId) as T;

  const recLeadId = matchId(path, '/recommendations/lead');
  if (recLeadId) return mockRecommendationBundle('LEAD', recLeadId) as T;

  const recAppId = matchId(path, '/recommendations/application');
  if (recAppId) return mockRecommendationBundle('APPLICATION', recAppId) as T;

  const recLenderId = matchId(path, '/recommendations/lender');
  if (recLenderId) {
    const bundle = mockRecommendationBundle(String(params?.entityType ?? 'LEAD'), recLenderId);
    return { lenders: bundle.lenders, approvalProbability: bundle.approvalProbability } as T;
  }

  if (path === '/recommendations/cross-sell') {
    const bundle = mockRecommendationBundle(String(params?.entityType ?? 'LEAD'), String(params?.entityId ?? 'lead-001'));
    return { crossSell: bundle.crossSell } as T;
  }

  if (path === '/recommendations/actions') {
    const bundle = mockRecommendationBundle(String(params?.entityType ?? 'LEAD'), String(params?.entityId ?? 'lead-001'));
    return { actions: bundle.actions, risk: bundle.risk } as T;
  }

  const copilotLeadId = matchId(path, '/ai-copilot/lead');
  if (copilotLeadId) return mockCopilotLeadAnalysis(copilotLeadId) as T;

  const copilotAppId = matchId(path, '/ai-copilot/application');
  if (copilotAppId) return mockCopilotApplicationAnalysis(copilotAppId) as T;

  const copilotCustomerId = matchId(path, '/ai-copilot/customer');
  if (copilotCustomerId) {
    const customer = findById(MOCK_CUSTOMERS, copilotCustomerId);
    const bundle = mockRecommendationBundle('CUSTOMER', copilotCustomerId);
    return {
      entityType: 'CUSTOMER',
      entityId: copilotCustomerId,
      title: customer?.fullName ?? copilotCustomerId,
      insights: [
        { category: 'LEAD', title: 'Customer portfolio', summary: '2 active leads and 1 application on file.', confidence: 80 },
        { category: 'PRODUCT', title: 'Top product recommendation', summary: bundle.products[0]?.reason ?? '', confidence: bundle.approvalProbability },
      ],
      recommendations: bundle.products.map((p) => ({ type: 'PRODUCT', title: p.productName, description: p.reason, priority: p.rankScore })),
      predictions: [{ type: 'APPROVAL', probability: bundle.approvalProbability }],
      riskFlags: bundle.risk.explanations.map((e) => ({ code: 'RISK', label: e, severity: bundle.risk.riskLevel })),
      nextBestActions: bundle.actions.map((a) => ({ actionType: a.actionType, title: a.title, description: a.description, priority: a.priority })),
      crossSellOpportunities: bundle.crossSell.map((c) => ({ code: c.label, label: c.label, description: c.description, score: c.matchScore })),
      sessionId: `sess-cust-${copilotCustomerId}`,
    } as T;
  }

  const copilotExecutiveId = matchId(path, '/ai-copilot/executive');
  if (copilotExecutiveId) {
    return {
      entityType: 'EXECUTIVE',
      entityId: copilotExecutiveId,
      title: 'Executive Performance',
      insights: [{ category: 'EXECUTIVE', title: 'Conversion rate', summary: '32% lead-to-application conversion — above average.', confidence: 82 }],
      predictions: [{ predictionType: 'CONVERSION', probability: 32 }],
      sessionId: `sess-exec-${copilotExecutiveId}`,
    } as T;
  }

  const copilotBranchId = matchId(path, '/ai-copilot/branch');
  if (copilotBranchId) {
    return {
      entityType: 'BRANCH',
      entityId: copilotBranchId,
      title: 'Branch Performance',
      insights: [{ category: 'BRANCH', title: 'Pipeline health', summary: '18 active applications with 76% average success probability.', confidence: 78 }],
      sessionId: `sess-branch-${copilotBranchId}`,
    } as T;
  }

  const leadId = matchId(path, '/leads');
  if (leadId) {
    const lead = findById(MOCK_LEADS, leadId);
    if (!lead) throw new Error('Not found');
    return lead as T;
  }

  const customerId = matchId(path, '/customers');
  if (customerId) {
    const customer = findById(MOCK_CUSTOMERS, customerId);
    if (!customer) throw new Error('Not found');
    return customer as T;
  }

  if (path === '/customer-profiles') {
    const cid = String(params?.customerId ?? 'cust-001');
    const customer = findById(MOCK_CUSTOMERS, cid);
    return { ...customer, pan: 'ABCDE1234F', dob: '1985-06-15', gender: 'Male', occupation: 'Software Engineer' } as T;
  }

  const appId = matchId(path, '/applications');
  if (appId) {
    const app = findById(MOCK_APPLICATIONS, appId);
    if (!app) throw new Error('Not found');
    return app as T;
  }

  const docId = matchId(path, '/documents');
  if (docId) {
    const doc = findById(MOCK_DOCUMENTS, docId);
    if (!doc) throw new Error('Not found');
    return { ...doc, fileUrl: '#', fileName: `${doc.documentType}.pdf` } as T;
  }

  const partnerId = matchId(path, '/partners');
  if (partnerId) {
    const partner = findById(MOCK_PARTNERS, partnerId);
    if (!partner) throw new Error('Not found');
    return partner as T;
  }

  const ticketId = matchId(path, '/tickets');
  if (ticketId) {
    const ticket = findById(MOCK_TICKETS, ticketId);
    if (!ticket) throw new Error('Not found');
    return ticket as T;
  }

  const userId = matchId(path, '/users');
  if (userId) {
    const user = findById(MOCK_USERS, userId);
    if (!user) throw new Error('Not found');
    return user as T;
  }

  const auditId = matchId(path, '/audit-logs');
  if (auditId) {
    const log = findById(MOCK_AUDIT_LOGS, auditId);
    if (!log) throw new Error('Not found');
    return log as T;
  }

  const settingsKey = path.startsWith('/settings/') ? path.slice('/settings/'.length) : null;
  if (settingsKey) {
    const setting = MOCK_SETTINGS.find((s) => s.key === settingsKey);
    if (!setting) throw new Error('Not found');
    return setting as T;
  }

  return {} as T;
}

export async function mockMutate<T>(_url: string, _body?: unknown): Promise<T> {
  await mockDelay(80);
  return {} as T;
}

export async function mockDownload(_url: string, _params?: Record<string, unknown>): Promise<Blob> {
  await mockDelay();
  return new Blob(['mock,csv,data'], { type: 'text/csv' });
}

export function isMockEnabled(): boolean {
  return import.meta.env.VITE_USE_MOCK === 'true';
}

export function shouldUseMock(url: string): boolean {
  return isMockEnabled() && !url.startsWith('/auth');
}
