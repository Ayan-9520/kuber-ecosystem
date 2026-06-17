import type { OwaspTestCase } from '../types.js';

/** OWASP Top 10 (2021) automated test registry for KuberOne */
export const OWASP_TEST_REGISTRY: OwaspTestCase[] = [
  // A01 — Broken Access Control
  { id: 'A01-001', category: 'A01_BROKEN_ACCESS_CONTROL', title: 'Unauthenticated API access blocked', domain: 'authentication', automated: true, testFile: 'authentication.security.test.ts' },
  { id: 'A01-002', category: 'A01_BROKEN_ACCESS_CONTROL', title: 'Horizontal privilege escalation denied', domain: 'authorization', automated: true, testFile: 'authorization.security.test.ts' },
  { id: 'A01-003', category: 'A01_BROKEN_ACCESS_CONTROL', title: 'Vertical privilege escalation denied', domain: 'authorization', automated: true, testFile: 'authorization.security.test.ts' },
  { id: 'A01-004', category: 'A01_BROKEN_ACCESS_CONTROL', title: 'IDOR path tampering rejected', domain: 'api', automated: true, testFile: 'api-injection.security.test.ts' },
  { id: 'A01-005', category: 'A01_BROKEN_ACCESS_CONTROL', title: 'Branch scope bypass blocked', domain: 'rbac', automated: true, testFile: 'rbac-matrix.security.test.ts' },
  { id: 'A01-006', category: 'A01_BROKEN_ACCESS_CONTROL', title: 'CRM hidden route access denied', domain: 'crm', automated: true, testFile: 'crm.security.test.tsx' },
  // A02 — Cryptographic Failures
  { id: 'A02-001', category: 'A02_CRYPTOGRAPHIC_FAILURES', title: 'JWT signed with wrong secret rejected', domain: 'authentication', automated: true, testFile: 'authentication.security.test.ts' },
  { id: 'A02-002', category: 'A02_CRYPTOGRAPHIC_FAILURES', title: 'Refresh token stored as SHA-256 hash', domain: 'authentication', automated: true, testFile: 'authentication.security.test.ts' },
  { id: 'A02-003', category: 'A02_CRYPTOGRAPHIC_FAILURES', title: 'TLS minimum version configured (mobile)', domain: 'mobile', automated: true, testFile: 'mobile.security.test.ts' },
  { id: 'A02-004', category: 'A02_CRYPTOGRAPHIC_FAILURES', title: 'PII masked in AI output', domain: 'pii', automated: true, testFile: 'pii.security.test.ts' },
  // A03 — Injection
  { id: 'A03-001', category: 'A03_INJECTION', title: 'SQL injection payloads rejected', domain: 'api', automated: true, testFile: 'api-injection.security.test.ts' },
  { id: 'A03-002', category: 'A03_INJECTION', title: 'NoSQL injection payloads rejected', domain: 'api', automated: true, testFile: 'api-injection.security.test.ts' },
  { id: 'A03-003', category: 'A03_INJECTION', title: 'Command injection payloads rejected', domain: 'api', automated: true, testFile: 'api-injection.security.test.ts' },
  { id: 'A03-004', category: 'A03_INJECTION', title: 'Header injection blocked', domain: 'api', automated: true, testFile: 'api-injection.security.test.ts' },
  { id: 'A03-005', category: 'A03_INJECTION', title: 'Prompt injection patterns filtered', domain: 'ai', automated: true, testFile: 'ai.security.test.ts' },
  { id: 'A03-006', category: 'A03_INJECTION', title: 'Stored XSS payloads sanitized (CRM)', domain: 'crm', automated: true, testFile: 'crm.security.test.tsx' },
  // A04 — Insecure Design
  { id: 'A04-001', category: 'A04_INSECURE_DESIGN', title: 'OTP resend cooldown enforced', domain: 'authentication', automated: true, testFile: 'authentication.security.test.ts' },
  { id: 'A04-002', category: 'A04_INSECURE_DESIGN', title: 'Account lockout after failed logins', domain: 'authentication', automated: true, testFile: 'authentication.security.test.ts' },
  { id: 'A04-003', category: 'A04_INSECURE_DESIGN', title: 'Mass assignment fields rejected', domain: 'api', automated: true, testFile: 'api-injection.security.test.ts' },
  // A05 — Security Misconfiguration
  { id: 'A05-001', category: 'A05_SECURITY_MISCONFIGURATION', title: 'Helmet security headers present', domain: 'infrastructure', automated: true, testFile: 'infrastructure.security.test.ts' },
  { id: 'A05-002', category: 'A05_SECURITY_MISCONFIGURATION', title: 'X-Powered-By disabled', domain: 'infrastructure', automated: true, testFile: 'infrastructure.security.test.ts' },
  { id: 'A05-003', category: 'A05_SECURITY_MISCONFIGURATION', title: 'Rate limit headers exposed', domain: 'infrastructure', automated: true, testFile: 'infrastructure.security.test.ts' },
  { id: 'A05-004', category: 'A05_SECURITY_MISCONFIGURATION', title: 'OpenAI key not in client bundles', domain: 'ai', automated: true, testFile: 'ai.security.test.ts' },
  // A06 — Vulnerable Components
  { id: 'A06-001', category: 'A06_VULNERABLE_COMPONENTS', title: 'pnpm audit gate (dependency scan)', domain: 'infrastructure', automated: true, testFile: 'security-scan.mjs' },
  { id: 'A06-002', category: 'A06_VULNERABLE_COMPONENTS', title: 'Semgrep static analysis ready', domain: 'infrastructure', automated: true, testFile: 'semgrep.yml' },
  // A07 — Authentication Failures
  { id: 'A07-001', category: 'A07_AUTH_FAILURES', title: 'Expired JWT rejected', domain: 'authentication', automated: true, testFile: 'authentication.security.test.ts' },
  { id: 'A07-002', category: 'A07_AUTH_FAILURES', title: 'Malformed JWT rejected', domain: 'authentication', automated: true, testFile: 'authentication.security.test.ts' },
  { id: 'A07-003', category: 'A07_AUTH_FAILURES', title: 'Refresh token abuse blocked', domain: 'authentication', automated: true, testFile: 'authentication.security.test.ts' },
  { id: 'A07-004', category: 'A07_AUTH_FAILURES', title: 'Session replay without valid session', domain: 'authentication', automated: true, testFile: 'authentication.security.test.ts' },
  { id: 'A07-005', category: 'A07_AUTH_FAILURES', title: 'Invalid login payload rejected', domain: 'authentication', automated: true, testFile: 'authentication.security.test.ts' },
  // A08 — Integrity Failures
  { id: 'A08-001', category: 'A08_INTEGRITY_FAILURES', title: 'Document checksum SHA-256', domain: 'files', automated: true, testFile: 'files.security.test.ts' },
  { id: 'A08-002', category: 'A08_INTEGRITY_FAILURES', title: 'MIME type spoofing rejected', domain: 'files', automated: true, testFile: 'files.security.test.ts' },
  { id: 'A08-003', category: 'A08_INTEGRITY_FAILURES', title: 'S3 key path traversal sanitized', domain: 'files', automated: true, testFile: 'files.security.test.ts' },
  // A09 — Logging Failures
  { id: 'A09-001', category: 'A09_LOGGING_FAILURES', title: 'Failed login audit event', domain: 'authentication', automated: true, testFile: 'authentication.security.test.ts' },
  { id: 'A09-002', category: 'A09_LOGGING_FAILURES', title: 'AI prompt abuse audit event', domain: 'ai', automated: true, testFile: 'ai.security.test.ts' },
  { id: 'A09-003', category: 'A09_LOGGING_FAILURES', title: 'Sensitive doc fields stripped from response', domain: 'pii', automated: true, testFile: 'pii.security.test.ts' },
  // A10 — SSRF
  { id: 'A10-001', category: 'A10_SSRF', title: 'Internal URL in params rejected', domain: 'api', automated: true, testFile: 'api-injection.security.test.ts' },
  { id: 'A10-002', category: 'A10_SSRF', title: 'Metadata endpoint blocked', domain: 'api', automated: true, testFile: 'api-injection.security.test.ts' },
];

export function getOwaspCoverage(): { total: number; automated: number; percent: number } {
  const total = OWASP_TEST_REGISTRY.length;
  const automated = OWASP_TEST_REGISTRY.filter((t) => t.automated).length;
  return { total, automated, percent: Math.round((automated / total) * 1000) / 10 };
}

export function getOwaspByCategory(category: OwaspTestCase['category']): OwaspTestCase[] {
  return OWASP_TEST_REGISTRY.filter((t) => t.category === category);
}
