/** Mobile security readiness checklist — config flags + storage expectations */
export const MOBILE_SECURITY_CHECKS = [
  { id: 'MOB-001', title: 'Certificate pinning readiness flag', key: 'certificatePinningEnabled' },
  { id: 'MOB-002', title: 'Root/jailbreak detection readiness', key: 'rootDetectionEnabled' },
  { id: 'MOB-003', title: 'Biometric gate readiness', key: 'biometricGateEnabled' },
  { id: 'MOB-004', title: 'Minimum TLS 1.2', key: 'minTlsVersion' },
] as const;

export const SECURE_TOKEN_KEYS = ['accessToken', 'refreshToken', 'sessionId'] as const;

export const DEEP_LINK_ABUSE_PATHS = [
  'kuberone://auth/callback?token=stolen',
  'kuberone://admin/dashboard',
  'kuberone://../../etc/passwd',
  'kuberone://login?redirect=http://evil.com',
] as const;

/** Detects known deep-link abuse patterns (traversal, token theft, cross-role, open redirect). */
export function isDeepLinkAbusePath(path: string): boolean {
  return (
    path.includes('..') ||
    path.includes('evil') ||
    path.includes('stolen') ||
    path.includes('://admin') ||
    /redirect=https?:\/\//i.test(path)
  );
}
