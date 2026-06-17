import type { ApiModule } from './types';

/** Maps OpenAPI tags and path prefixes to portal module categories. */
export const API_MODULES: ApiModule[] = [
  { id: 'auth', name: 'Authentication', description: 'JWT, OTP, refresh tokens, and session management.', tags: ['Authentication'] },
  { id: 'users', name: 'Users', description: 'Employee and partner user management.', tags: ['Users', 'RBAC'] },
  { id: 'roles', name: 'Roles & Permissions', description: 'RBAC roles, permissions, and assignments.', tags: ['RBAC'] },
  { id: 'customers', name: 'Customers', description: 'Customer profiles, addresses, and consents.', tags: ['Customers'] },
  { id: 'kyc', name: 'KYC', description: 'PAN, Aadhaar, and KYC profile verification.', tags: ['KYC'] },
  { id: 'products', name: 'Products', description: 'Product families, variants, and catalog rules.', tags: ['Products'] },
  { id: 'lenders', name: 'Lenders', description: 'Lender registry and policy configuration.', tags: ['Products', 'LOS'] },
  { id: 'eligibility', name: 'Eligibility', description: 'Eligibility rules and scoring results.', tags: ['Eligibility', 'LOS'] },
  { id: 'emi', name: 'EMI', description: 'EMI calculators and amortization.', tags: ['EMI'] },
  { id: 'leads', name: 'Leads', description: 'Lead capture, scoring, notes, and timeline.', tags: ['LOS'] },
  { id: 'applications', name: 'Applications', description: 'Loan application lifecycle and sanctions.', tags: ['LOS', 'LMS'] },
  { id: 'documents', name: 'Documents', description: 'Document upload, OCR, and verification.', tags: ['Documents'] },
  { id: 'referrals', name: 'Referrals', description: 'Referral programs and tracking.', tags: ['Referrals'] },
  { id: 'commissions', name: 'Commissions', description: 'Commission ledger, approvals, and payouts.', tags: ['Commissions'] },
  { id: 'notifications', name: 'Notifications', description: 'In-app notifications and templates.', tags: ['Notifications'] },
  { id: 'email', name: 'Email', description: 'Transactional email platform.', tags: ['Notifications'] },
  { id: 'sms', name: 'SMS', description: 'SMS delivery, templates, and providers.', tags: ['Notifications'] },
  { id: 'whatsapp', name: 'WhatsApp', description: 'WhatsApp messaging integration.', tags: ['Notifications'] },
  { id: 'push', name: 'Push', description: 'Mobile push notifications.', tags: ['Notifications'] },
  { id: 'support', name: 'Support', description: 'Tickets, SLA, and customer support.', tags: ['Support'] },
  { id: 'knowledge', name: 'Knowledge Base', description: 'Articles, categories, and search.', tags: ['Knowledge Base'] },
  { id: 'rag', name: 'RAG Pipeline', description: 'Document ingestion, embedding, and retrieval.', tags: ['AI', 'Knowledge Base'] },
  { id: 'ai-advisor', name: 'AI Advisor', description: 'AI-powered loan advisory.', tags: ['AI'] },
  { id: 'voice-ai', name: 'Voice AI', description: 'Voice interaction and transcription.', tags: ['AI'] },
  { id: 'copilot', name: 'AI Copilot', description: 'CRM copilot for leads and applications.', tags: ['AI'] },
  { id: 'lead-scoring', name: 'Lead Scoring', description: 'Predictive lead scoring engine.', tags: ['AI', 'LOS'] },
  { id: 'recommendations', name: 'Recommendations', description: 'Product and lender recommendations.', tags: ['AI'] },
  { id: 'campaigns', name: 'Campaigns', description: 'Marketing campaigns and outreach.', tags: ['Campaigns'] },
  { id: 'automation', name: 'Automation', description: 'Journey builder and workflow automation.', tags: ['Campaigns'] },
  { id: 'content', name: 'Content Engine', description: 'AI content generation studio.', tags: ['AI'] },
  { id: 'analytics', name: 'Analytics', description: 'Platform analytics and KPIs.', tags: ['Analytics'] },
  { id: 'audit', name: 'Audit', description: 'Immutable audit events and reports.', tags: ['Audit'] },
  { id: 'compliance', name: 'Compliance', description: 'Compliance rules and violations.', tags: ['Compliance'] },
  { id: 'settings', name: 'Settings', description: 'System settings and configuration.', tags: ['Settings'] },
];

const PATH_PREFIX_MAP: Array<{ prefix: string; moduleId: string }> = [
  { prefix: '/auth', moduleId: 'auth' },
  { prefix: '/users', moduleId: 'users' },
  { prefix: '/roles', moduleId: 'roles' },
  { prefix: '/permissions', moduleId: 'roles' },
  { prefix: '/role-permissions', moduleId: 'roles' },
  { prefix: '/user-roles', moduleId: 'roles' },
  { prefix: '/customers', moduleId: 'customers' },
  { prefix: '/customer-', moduleId: 'customers' },
  { prefix: '/kyc', moduleId: 'kyc' },
  { prefix: '/products', moduleId: 'products' },
  { prefix: '/product-', moduleId: 'products' },
  { prefix: '/lenders', moduleId: 'lenders' },
  { prefix: '/lender-', moduleId: 'lenders' },
  { prefix: '/eligibility', moduleId: 'eligibility' },
  { prefix: '/emi', moduleId: 'emi' },
  { prefix: '/leads', moduleId: 'leads' },
  { prefix: '/lead-', moduleId: 'leads' },
  { prefix: '/applications', moduleId: 'applications' },
  { prefix: '/application-', moduleId: 'applications' },
  { prefix: '/bank-logins', moduleId: 'applications' },
  { prefix: '/credit-reviews', moduleId: 'applications' },
  { prefix: '/sanctions', moduleId: 'applications' },
  { prefix: '/disbursements', moduleId: 'applications' },
  { prefix: '/documents', moduleId: 'documents' },
  { prefix: '/document-', moduleId: 'documents' },
  { prefix: '/ocr-', moduleId: 'documents' },
  { prefix: '/verification-', moduleId: 'documents' },
  { prefix: '/referrals', moduleId: 'referrals' },
  { prefix: '/referral-', moduleId: 'referrals' },
  { prefix: '/commissions', moduleId: 'commissions' },
  { prefix: '/commission-', moduleId: 'commissions' },
  { prefix: '/notifications', moduleId: 'notifications' },
  { prefix: '/notification-', moduleId: 'notifications' },
  { prefix: '/email', moduleId: 'email' },
  { prefix: '/emails', moduleId: 'email' },
  { prefix: '/sms', moduleId: 'sms' },
  { prefix: '/whatsapp', moduleId: 'whatsapp' },
  { prefix: '/push', moduleId: 'push' },
  { prefix: '/support', moduleId: 'support' },
  { prefix: '/tickets', moduleId: 'support' },
  { prefix: '/knowledge', moduleId: 'knowledge' },
  { prefix: '/rag', moduleId: 'rag' },
  { prefix: '/ai-copilot', moduleId: 'copilot' },
  { prefix: '/ai-advisor', moduleId: 'ai-advisor' },
  { prefix: '/voice-ai', moduleId: 'voice-ai' },
  { prefix: '/lead-scoring', moduleId: 'lead-scoring' },
  { prefix: '/recommendations', moduleId: 'recommendations' },
  { prefix: '/campaigns', moduleId: 'campaigns' },
  { prefix: '/automation', moduleId: 'automation' },
  { prefix: '/content', moduleId: 'content' },
  { prefix: '/analytics', moduleId: 'analytics' },
  { prefix: '/executive-analytics', moduleId: 'analytics' },
  { prefix: '/branch-analytics', moduleId: 'analytics' },
  { prefix: '/regional-analytics', moduleId: 'analytics' },
  { prefix: '/audit', moduleId: 'audit' },
  { prefix: '/compliance', moduleId: 'compliance' },
  { prefix: '/risk', moduleId: 'compliance' },
  { prefix: '/security', moduleId: 'compliance' },
  { prefix: '/settings', moduleId: 'settings' },
  { prefix: '/ai/', moduleId: 'ai-advisor' },
];

export function resolveModuleId(path: string, tags: string[]): string {
  for (const { prefix, moduleId } of PATH_PREFIX_MAP) {
    if (path.startsWith(prefix)) return moduleId;
  }

  for (const mod of API_MODULES) {
    if (tags.some((t) => mod.tags.includes(t))) return mod.id;
  }

  return 'settings';
}

export function getModuleById(id: string): ApiModule | undefined {
  return API_MODULES.find((m) => m.id === id);
}
