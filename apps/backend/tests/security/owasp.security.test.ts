import { getOwaspByCategory, getOwaspCoverage, OWASP_TEST_REGISTRY } from '@kuberone/security-testing';

describe('Security — OWASP Top 10 Registry', () => {
  it('covers all 10 OWASP categories', () => {
    const categories = new Set(OWASP_TEST_REGISTRY.map((t) => t.category));
    expect(categories.size).toBe(10);
  });

  it('meets minimum automated OWASP coverage threshold', () => {
    const { percent, automated, total } = getOwaspCoverage();
    expect(automated).toBe(total);
    expect(percent).toBeGreaterThanOrEqual(90);
  });

  it('maps A01 broken access control tests', () => {
    const a01 = getOwaspByCategory('A01_BROKEN_ACCESS_CONTROL');
    expect(a01.length).toBeGreaterThanOrEqual(4);
    expect(a01.every((t) => t.automated)).toBe(true);
  });

  it('maps A03 injection tests across API and AI', () => {
    const a03 = getOwaspByCategory('A03_INJECTION');
    const domains = new Set(a03.map((t) => t.domain));
    expect(domains.has('api')).toBe(true);
    expect(domains.has('ai')).toBe(true);
  });

  it('maps A07 authentication failure tests', () => {
    const a07 = getOwaspByCategory('A07_AUTH_FAILURES');
    expect(a07.length).toBeGreaterThanOrEqual(4);
  });
});
