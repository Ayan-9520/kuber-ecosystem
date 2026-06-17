export interface GuideSection {
  id: string;
  title: string;
  body?: string;
  code?: string;
  language?: string;
}

export const AUTHENTICATION_SECTIONS: GuideSection[] = [
  {
    id: 'jwt',
    title: 'JWT Bearer Authentication',
    body: 'All protected endpoints require an `Authorization: Bearer <accessToken>` header. Access tokens are short-lived (default 15 minutes). Include `Content-Type: application/json` on mutating requests.',
    code: `// Login (employee)
const res = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    loginType: 'employee',
    email: 'admin@kuberone.com',
    password: 'Admin@123',
  }),
});
const { data } = await res.json();
const accessToken = data.accessToken;`,
    language: 'typescript',
  },
  {
    id: 'refresh',
    title: 'Refresh Token Flow',
    body: 'When the access token expires (401), exchange the refresh token for a new pair. Refresh tokens are rotated on each use — always persist the latest refresh token.',
    code: `const res = await fetch('/api/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken }),
});
const { data } = await res.json();
// data.accessToken, data.refreshToken`,
    language: 'typescript',
  },
  {
    id: 'otp',
    title: 'OTP Authentication (Customers / DSA)',
    body: 'Mobile apps use phone OTP. In development (`APP_ENV=development`), OTP is always `123456`. Production uses SMS delivery with rate limiting.',
    code: `// Step 1: Send OTP
await fetch('/api/v1/auth/send-otp', {
  method: 'POST',
  body: JSON.stringify({ phone: '9876543210', purpose: 'LOGIN' }),
});

// Step 2: Verify OTP
await fetch('/api/v1/auth/verify-otp', {
  method: 'POST',
  body: JSON.stringify({ phone: '9876543210', otp: '123456', purpose: 'LOGIN' }),
});`,
    language: 'typescript',
  },
  {
    id: 'session',
    title: 'Session Management',
    body: 'Employee sessions are tracked server-side. Each login creates a session record. Concurrent session limits may apply per role. Session metadata is included in audit events.',
  },
  {
    id: 'logout',
    title: 'Logout Flow',
    body: 'Call `POST /auth/logout` with the current access token to invalidate the session and revoke refresh tokens for that device.',
    code: `await fetch('/api/v1/auth/logout', {
  method: 'POST',
  headers: { Authorization: \`Bearer \${accessToken}\` },
});`,
    language: 'typescript',
  },
];

export const ERROR_CATALOG: GuideSection[] = [
  {
    id: '400',
    title: '400 Bad Request',
    body: 'Malformed request body, invalid query parameters, or business rule violation at the edge. Check `error.code` and `error.message` in the response envelope.',
    code: `{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid request"
  }
}`,
    language: 'json',
  },
  {
    id: '401',
    title: '401 Unauthorized',
    body: 'Missing, invalid, or expired JWT. Refresh the token or re-authenticate. Do not retry indefinitely — implement exponential backoff.',
  },
  {
    id: '403',
    title: '403 Forbidden',
    body: 'Authenticated but lacking required permission or data scope. Verify RBAC assignment and branch/region scope for the user.',
  },
  {
    id: '404',
    title: '404 Not Found',
    body: 'Resource does not exist or is outside the caller data scope. Confirm the UUID and that the entity belongs to the accessible branch.',
  },
  {
    id: '409',
    title: '409 Conflict',
    body: 'Optimistic locking failure, duplicate unique key, or invalid state transition. Re-fetch the resource and retry with the latest version.',
  },
  {
    id: '422',
    title: '422 Validation Error',
    body: 'Zod/schema validation failed. Response includes `error.details` with field-level messages.',
    code: `{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "path": "email", "message": "Invalid email" }]
  }
}`,
    language: 'json',
  },
  {
    id: '429',
    title: '429 Rate Limited',
    body: 'Too many requests. Respect `Retry-After` header. Implement client-side throttling for bulk operations.',
  },
  {
    id: '500',
    title: '500 Internal Server Error',
    body: 'Unexpected server failure. Retry with idempotency keys where supported. Contact platform team with `X-Request-Id` from response headers.',
  },
];

export const RBAC_SECTIONS: GuideSection[] = [
  {
    id: 'roles',
    title: 'Roles',
    body: 'System roles include SUPER_ADMIN, ADMIN, BRANCH_MANAGER, RELATIONSHIP_MANAGER, OPERATIONS, PARTNER, CUSTOMER, and DSA. Roles are assigned via `user-roles` endpoints.',
  },
  {
    id: 'permissions',
    title: 'Permissions',
    body: 'Fine-grained permissions follow `<resource>.<action>` pattern (e.g. `leads.read`, `applications.write`). Each OpenAPI operation documents required permissions in `x-permissions`.',
  },
  {
    id: 'data-scope',
    title: 'Data Scope',
    body: 'Operations declare `x-data-scope`: SELF, BRANCH, REGION, ORGANIZATION, or N/A. Scope filters are applied automatically in repository queries.',
  },
  {
    id: 'branch-scope',
    title: 'Branch Scope',
    body: 'Branch-scoped users see only entities linked to their assigned branch(es). Cross-branch access requires elevated permissions.',
  },
  {
    id: 'region-scope',
    title: 'Region Scope',
    body: 'Regional managers aggregate data across branches in their region. Regional analytics endpoints respect this hierarchy.',
  },
  {
    id: 'matrix',
    title: 'API Access Matrix',
    body: 'Refer to each endpoint page for required permissions. SUPER_ADMIN and ADMIN bypass all permission checks. Partner APIs use partner-scoped tokens with limited resource access.',
  },
];

export const PAGINATION_SECTIONS: GuideSection[] = [
  {
    id: 'params',
    title: 'Query Parameters',
    body: 'List endpoints accept: `page` (default 1), `limit` (default 20, max 100), `sortBy`, `sortOrder` (asc|desc), and `search` for full-text filter.',
  },
  {
    id: 'response',
    title: 'Response Envelope',
    body: 'Paginated responses return `{ success, data: T[], meta: { page, limit, total, totalPages } }`.',
    code: `{
  "success": true,
  "data": [/* items */],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}`,
    language: 'json',
  },
];

export const RATE_LIMIT_SECTIONS: GuideSection[] = [
  {
    id: 'headers',
    title: 'Rate Limit Headers',
    body: 'Responses may include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`. OTP and auth endpoints have stricter limits.',
  },
  {
    id: 'backoff',
    title: 'Backoff Strategy',
    body: 'On 429, wait for `Retry-After` seconds (or use exponential backoff: 1s, 2s, 4s, 8s). Batch jobs should use queue-based processing.',
  },
];

export const WEBHOOK_SECTIONS: GuideSection[] = [
  {
    id: 'events',
    title: 'Webhook Events',
    body: 'KuberOne emits webhooks for application status changes, document verification, commission approvals, and ticket updates. Configure endpoints in Settings.',
  },
  {
    id: 'signature',
    title: 'Signature Verification',
    body: 'Each webhook includes `X-KuberOne-Signature` (HMAC-SHA256 of raw body with your webhook secret). Reject payloads with invalid signatures.',
    code: `const crypto = require('crypto');
const expected = crypto
  .createHmac('sha256', webhookSecret)
  .update(rawBody)
  .digest('hex');
if (signature !== expected) throw new Error('Invalid signature');`,
    language: 'javascript',
  },
];

export const WORKFLOW_SECTIONS: GuideSection[] = [
  {
    id: 'lead',
    title: 'Lead Workflow',
    body: 'NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → CONVERTED | LOST. Use `/leads`, `/lead-notes`, `/lead-activities`, `/lead-scoring/calculate/:id`.',
  },
  {
    id: 'application',
    title: 'Application Workflow',
    body: 'DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → SANCTIONED → DISBURSED | REJECTED. Timeline tracked via `/application-timeline`.',
  },
  {
    id: 'document',
    title: 'Document Workflow',
    body: 'UPLOADED → PENDING_VERIFICATION → VERIFIED | REJECTED. OCR and verification via `/ocr-results` and `POST /documents/:id/verify`.',
  },
  {
    id: 'referral',
    title: 'Referral Workflow',
    body: 'Referral created → linked to lead/customer → commission triggered on conversion. Track via `/referrals` and commission ledger.',
  },
  {
    id: 'commission',
    title: 'Commission Workflow',
    body: 'ACCRUED → PENDING_APPROVAL → APPROVED → PAID. Recoveries and adjustments via dedicated endpoints.',
  },
  {
    id: 'support',
    title: 'Support Workflow',
    body: 'OPEN → IN_PROGRESS → WAITING_CUSTOMER → RESOLVED → CLOSED. SLA timers and escalation rules apply per priority.',
  },
];

export const AI_PLATFORM_SECTIONS: GuideSection[] = [
  { id: 'advisor', title: 'AI Advisor', body: 'Loan advisory via `/ai-advisor` — product matching, eligibility hints, and conversational guidance.' },
  { id: 'voice', title: 'Voice AI', body: 'Voice transcription and intent detection for call-center integration via `/voice-ai` endpoints.' },
  { id: 'copilot', title: 'AI Copilot', body: 'CRM copilot analyzes leads and applications: `/ai-copilot/lead/:id`, `/ai-copilot/application/:id`.' },
  { id: 'scoring', title: 'Lead Scoring', body: 'ML-based scoring: `POST /lead-scoring/calculate/:id`, history and analytics endpoints.' },
  { id: 'recommendations', title: 'Recommendation Engine', body: 'Product/lender recommendations per lead via `/recommendations/lead/:id`.' },
  { id: 'knowledge', title: 'Knowledge Base', body: 'Curated articles with approval workflow. RAG augments with vector search over ingested documents.' },
  { id: 'rag', title: 'RAG Pipeline', body: 'Ingest → chunk → embed → index. Query via `/rag/search` and `/rag/query`.' },
  { id: 'openai', title: 'OpenAI Layer', body: 'Centralized model routing, prompt templates, usage/cost tracking via `/ai/platform/*`.' },
];

export const SDK_EXAMPLES: GuideSection[] = [
  {
    id: 'fetch',
    title: 'Fetch API',
    body: 'Native fetch with bearer token.',
    code: `const response = await fetch('/api/v1/leads?page=1&limit=20', {
  headers: { Authorization: \`Bearer \${token}\` },
});
const { data, meta } = await response.json();`,
    language: 'typescript',
  },
  {
    id: 'axios',
    title: 'Axios',
    body: 'Axios instance with interceptors (used by KuberOne admin).',
    code: `import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1' });
api.interceptors.request.use((cfg) => {
  cfg.headers.Authorization = \`Bearer \${getToken()}\`;
  return cfg;
});

const { data } = await api.get('/leads', { params: { page: 1, limit: 20 } });`,
    language: 'typescript',
  },
  {
    id: 'react',
    title: 'React + TanStack Query',
    body: 'React Query integration with bearer-authenticated fetch.',
    code: `import { useQuery } from '@tanstack/react-query';

function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await fetch('/api/v1/leads', {
        headers: { Authorization: \`Bearer \${token}\` },
      });
      return res.json();
    },
  });
}`,
    language: 'typescript',
  },
  {
    id: 'react-native',
    title: 'React Native (Expo)',
    code: `import * as SecureStore from 'expo-secure-store';

const API_BASE = 'https://api.kuberone.kuberfinserve.com/api/v1';

export async function apiGet(path: string) {
  const token = await SecureStore.getItemAsync('accessToken');
  const res = await fetch(\`\${API_BASE}\${path}\`, {
    headers: { Authorization: \`Bearer \${token}\` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}`,
    language: 'typescript',
  },
  {
    id: 'nodejs',
    title: 'Node.js',
    code: `import axios from 'axios';

const client = axios.create({
  baseURL: process.env.KUBERONE_API_URL,
  headers: { Authorization: \`Bearer \${process.env.KUBERONE_API_TOKEN}\` },
});

const { data } = await client.post('/leads', {
  fullName: 'Test Lead',
  phone: '9876543210',
  source: 'API',
});`,
    language: 'typescript',
  },
];

export const POSTMAN_SECTIONS: GuideSection[] = [
  {
    id: 'import',
    title: 'Import Collection',
    body: 'Download `KuberOne.postman_collection.json` from the portal or import from `/postman/KuberOne.postman_collection.json`.',
  },
  {
    id: 'env',
    title: 'Environment Variables',
    body: 'Create a Postman environment with: `baseUrl` (http://localhost:4000/api/v1), `accessToken`, `refreshToken`, `adminEmail`, `adminPassword`.',
    code: `{
  "baseUrl": "http://localhost:4000/api/v1",
  "accessToken": "",
  "refreshToken": "",
  "adminEmail": "admin@kuberone.com",
  "adminPassword": "Admin@123"
}`,
    language: 'json',
  },
  {
    id: 'usage',
    title: 'Usage Guide',
    body: '1. Run Auth → Login to populate tokens. 2. Collection uses `{{baseUrl}}` and `{{accessToken}}` variables. 3. Folders mirror API modules.',
  },
];

export const TESTING_SECTIONS: GuideSection[] = [
  { id: 'auth-test', title: 'Authentication Testing', body: 'Verify login, token refresh, expired token handling, and OTP flows in isolated test suites.' },
  { id: 'rbac-test', title: 'RBAC Testing', body: 'Test each role against protected endpoints. Expect 403 for unauthorized permissions.' },
  { id: 'error-test', title: 'Error Testing', body: 'Send invalid payloads to trigger 400/422. Use non-existent UUIDs for 404.' },
  { id: 'rate-test', title: 'Rate Limit Testing', body: 'Burst OTP requests to verify 429 responses and Retry-After headers.' },
];
