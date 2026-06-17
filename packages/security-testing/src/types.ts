export type OwaspCategory =
  | 'A01_BROKEN_ACCESS_CONTROL'
  | 'A02_CRYPTOGRAPHIC_FAILURES'
  | 'A03_INJECTION'
  | 'A04_INSECURE_DESIGN'
  | 'A05_SECURITY_MISCONFIGURATION'
  | 'A06_VULNERABLE_COMPONENTS'
  | 'A07_AUTH_FAILURES'
  | 'A08_INTEGRITY_FAILURES'
  | 'A09_LOGGING_FAILURES'
  | 'A10_SSRF';

export type SecurityDomain =
  | 'authentication'
  | 'authorization'
  | 'rbac'
  | 'api'
  | 'files'
  | 'pii'
  | 'ai'
  | 'crm'
  | 'mobile'
  | 'infrastructure';

export interface OwaspTestCase {
  id: string;
  category: OwaspCategory;
  title: string;
  domain: SecurityDomain;
  automated: boolean;
  testFile?: string;
}

export interface RbacEndpointRule {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  module: string;
  requiredAuth: boolean;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  dataScope?: 'SELF' | 'BRANCH' | 'REGION' | 'ORGANIZATION';
}

export interface SecurityScoreCard {
  authentication: number;
  authorization: number;
  rbac: number;
  api: number;
  mobile: number;
  ai: number;
  infrastructure: number;
  overall: number;
}

export interface SecurityReport {
  generatedAt: string;
  coveragePercent: number;
  owaspCoveragePercent: number;
  rbacCoveragePercent: number;
  scores: SecurityScoreCard;
  testCounts: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  owasp: { total: number; automated: number };
  rbac: { totalEndpoints: number; tested: number };
  criticalFindings: string[];
  highFindings: string[];
  remainingRisks: string[];
}
