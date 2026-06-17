/** API endpoints exercised by k6 / Artillery performance suites */
export const PERF_API_CATALOG = {
  auth: {
    health: 'GET /health',
    sendOtp: 'POST /api/v1/auth/send-otp',
    login: 'POST /api/v1/auth/login',
    me: 'GET /api/v1/auth/me',
    refresh: 'POST /api/v1/auth/refresh',
  },
  customers: {
    list: 'GET /api/v1/customers',
    get: 'GET /api/v1/customers/:id',
  },
  leads: {
    list: 'GET /api/v1/leads',
    create: 'POST /api/v1/leads',
    export: 'GET /api/v1/leads/export',
  },
  applications: {
    list: 'GET /api/v1/applications',
    create: 'POST /api/v1/applications',
  },
  documents: {
    list: 'GET /api/v1/documents',
    upload: 'POST /api/v1/documents',
  },
  referrals: {
    list: 'GET /api/v1/referrals',
  },
  commissions: {
    ledger: 'GET /api/v1/commission-ledger',
    analytics: 'GET /api/v1/commission-analytics/summary',
  },
  support: {
    tickets: 'GET /api/v1/tickets',
  },
  analytics: {
    dashboard: 'GET /api/v1/analytics/dashboard',
    executive: 'GET /api/v1/executive-analytics/summary',
    branch: 'GET /api/v1/branch-analytics/summary',
  },
  ai: {
    chat: 'POST /api/v1/ai/chat',
    advisor: 'POST /api/v1/ai/advisor/chat',
    leadScore: 'POST /api/v1/leads/score',
  },
  notifications: {
    list: 'GET /api/v1/notifications',
    email: 'POST /api/v1/email/send',
    sms: 'POST /api/v1/sms/send',
    push: 'POST /api/v1/push/send',
    whatsapp: 'POST /api/v1/whatsapp/send',
  },
} as const;

export const PERF_API_PATHS = [
  '/health',
  '/api/v1/auth/send-otp',
  '/api/v1/leads',
  '/api/v1/customers',
  '/api/v1/applications',
  '/api/v1/documents',
  '/api/v1/referrals',
  '/api/v1/commission-ledger',
  '/api/v1/tickets',
  '/api/v1/analytics/dashboard',
  '/api/v1/ai/chat',
  '/api/v1/notifications',
] as const;
