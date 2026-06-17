import {
  DEEP_LINK_ABUSE_PATHS,
  isDeepLinkAbusePath,
  MOBILE_SECURITY_CHECKS,
  SECURE_TOKEN_KEYS,
} from '@kuberone/security-testing';

import { SECURITY_CONFIG } from '@/lib/security.config';

describe('Security — Mobile Customer', () => {
  it('exposes security readiness configuration', () => {
    expect(SECURITY_CONFIG.minTlsVersion).toBe('1.2');
    expect(typeof SECURITY_CONFIG.certificatePinningEnabled).toBe('boolean');
    expect(typeof SECURITY_CONFIG.rootDetectionEnabled).toBe('boolean');
    expect(typeof SECURITY_CONFIG.biometricGateEnabled).toBe('boolean');
  });

  it.each(MOBILE_SECURITY_CHECKS)('documents check: $title', (check) => {
    if (check.key === 'minTlsVersion') {
      expect(SECURITY_CONFIG.minTlsVersion).toBe('1.2');
    } else {
      expect(SECURITY_CONFIG).toHaveProperty(check.key);
    }
  });

  it('defines secure token storage keys', () => {
    expect(SECURE_TOKEN_KEYS).toContain('accessToken');
    expect(SECURE_TOKEN_KEYS).toContain('refreshToken');
  });

  it.each(DEEP_LINK_ABUSE_PATHS)('flags deep link abuse path: %s', (path) => {
    expect(path.startsWith('kuberone://')).toBe(true);
    expect(isDeepLinkAbusePath(path)).toBe(true);
  });

  it('certificate pinning is opt-in via env (production readiness)', () => {
    expect(SECURITY_CONFIG.certificatePinningEnabled).toBe(
      process.env.EXPO_PUBLIC_CERT_PINNING === 'true',
    );
  });
});
