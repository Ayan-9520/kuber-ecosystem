import { GuidePage } from './GuidePage';

import {
  AI_PLATFORM_SECTIONS,
  AUTHENTICATION_SECTIONS,
  ERROR_CATALOG,
  PAGINATION_SECTIONS,
  POSTMAN_SECTIONS,
  RBAC_SECTIONS,
  RATE_LIMIT_SECTIONS,
  SDK_EXAMPLES,
  TESTING_SECTIONS,
  WEBHOOK_SECTIONS,
  WORKFLOW_SECTIONS,
} from '@/pages/api-docs/content/guide-content';


export function AuthenticationGuidePage() {
  return (
    <GuidePage
      title="Authentication"
      subtitle="JWT Bearer tokens, refresh rotation, OTP flows, session management, and logout."
      sections={AUTHENTICATION_SECTIONS}
    />
  );
}

export function ErrorCatalogPage() {
  return (
    <GuidePage
      title="Error Catalog"
      subtitle="Standard HTTP error codes, response structures, and recovery guidance."
      sections={ERROR_CATALOG}
    />
  );
}

export function RbacGuidePage() {
  return (
    <GuidePage
      title="RBAC Guide"
      subtitle="Roles, permissions, data scope, branch/region scope, and API access matrix."
      sections={RBAC_SECTIONS}
    />
  );
}

export function PaginationGuidePage() {
  return (
    <GuidePage
      title="Pagination"
      subtitle="List endpoint pagination, sorting, filtering, and response envelope."
      sections={PAGINATION_SECTIONS}
    />
  );
}

export function RateLimitGuidePage() {
  return (
    <GuidePage
      title="Rate Limits"
      subtitle="Rate limiting headers, quotas, and client backoff strategies."
      sections={RATE_LIMIT_SECTIONS}
    />
  );
}

export function WebhookGuidePage() {
  return (
    <GuidePage
      title="Webhooks"
      subtitle="Event types, signature verification, and retry policy."
      sections={WEBHOOK_SECTIONS}
    />
  );
}

export function WorkflowsGuidePage() {
  return (
    <GuidePage
      title="Workflows"
      subtitle="End-to-end business flows for leads, applications, documents, referrals, commissions, and support."
      sections={WORKFLOW_SECTIONS}
    />
  );
}

export function AiPlatformGuidePage() {
  return (
    <GuidePage
      title="AI Platform"
      subtitle="AI Advisor, Voice AI, Copilot, Lead Scoring, Recommendations, Knowledge Base, RAG, and OpenAI layer."
      sections={AI_PLATFORM_SECTIONS}
    />
  );
}

export function SdkGuidePage() {
  return (
    <GuidePage
      title="SDK & Code Examples"
      subtitle="JavaScript, TypeScript, React, React Native, Node.js, Axios, and Fetch examples."
      sections={SDK_EXAMPLES}
    />
  );
}

export function PostmanGuidePage() {
  return (
    <GuidePage
      title="Postman Collection"
      subtitle="Import, environment setup, and team usage guide."
      sections={POSTMAN_SECTIONS}
    />
  );
}

export function TestingGuidePage() {
  return (
    <GuidePage
      title="API Testing"
      subtitle="Authentication, RBAC, error, and rate limit testing strategies."
      sections={TESTING_SECTIONS}
    />
  );
}
