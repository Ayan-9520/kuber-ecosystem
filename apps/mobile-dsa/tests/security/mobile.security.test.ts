import {
  DEEP_LINK_ABUSE_PATHS,
  MOBILE_SECURITY_CHECKS,
  SECURE_TOKEN_KEYS,
} from '@kuberone/security-testing';

import { SECURITY_CONFIG } from '@/lib/security.config';

describe('Security — Mobile DSA', () => {
  it('exposes security readiness configuration', () => {
    expect(SECURITY_CONFIG.minTlsVersion).toBe('1.2');
    expect(typeof SECURITY_CONFIG.certificatePinningEnabled).toBe('boolean');
    expect(typeof SECURITY_CONFIG.rootDetectionEnabled).toBe('boolean');
  });

  it.each(MOBILE_SECURITY_CHECKS)('documents check: $title', (check) => {
    if (check.key === 'minTlsVersion') {
      expect(SECURITY_CONFIG.minTlsVersion).toBe('1.2');
    } else {
      expect(SECURITY_CONFIG).toHaveProperty(check.key);
    }
  });

  it('defines secure token storage keys for partner sessions', () => {
    expect(SECURE_TOKEN_KEYS).toContain('accessToken');
    expect(SECURE_TOKEN_KEYS).toContain('sessionId');
  });

  it.each(DEEP_LINK_ABUSE_PATHS)('flags deep link abuse path: %s', (path) => {
    expect(path.startsWith('kuberone://')).toBe(true);
  });

  it('root detection readiness is configurable', () => {
    expect(SECURITY_CONFIG.rootDetectionEnabled).toBe(
      process.env.EXPO_PUBLIC_ROOT_DETECTION === 'true',
    );
  });
});
