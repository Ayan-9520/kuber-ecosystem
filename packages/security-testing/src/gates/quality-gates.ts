/** Security quality gate thresholds — CI fails on Critical/High */
export const SECURITY_GATE = {
  minOverallScore: 75,
  minOwaspCoveragePercent: 90,
  minRbacCoveragePercent: 70,
  minDomainScore: 60,
  failOnSeverity: ['critical', 'high'] as const,
  requiredSuites: [
    'apps/backend/tests/security',
    'apps/admin/tests/security',
    'apps/mobile-customer/tests/security',
    'apps/mobile-dsa/tests/security',
  ],
};

export const CRITICAL_SECURITY_TESTS = [
  { suite: 'backend', file: 'authentication.security.test.ts', check: 'JWT forgery rejected' },
  { suite: 'backend', file: 'authorization.security.test.ts', check: 'permission middleware blocks' },
  { suite: 'backend', file: 'api-injection.security.test.ts', check: 'SQL injection' },
  { suite: 'backend', file: 'ai.security.test.ts', check: 'prompt injection' },
  { suite: 'admin', file: 'crm.security.test.tsx', check: 'ProtectedRoute' },
  { suite: 'mobile-customer', file: 'mobile.security.test.ts', check: 'SECURITY_CONFIG' },
  { suite: 'mobile-dsa', file: 'mobile.security.test.ts', check: 'SECURITY_CONFIG' },
];
