/** Certificate pinning — enable in production EAS builds via expo-ssl-pinning or native config. */
export const SECURITY_CONFIG = {
  certificatePinningEnabled: process.env.EXPO_PUBLIC_CERT_PINNING === 'true',
  biometricGateEnabled: process.env.EXPO_PUBLIC_BIOMETRIC_GATE === 'true',
  rootDetectionEnabled: process.env.EXPO_PUBLIC_ROOT_DETECTION === 'true',
  minTlsVersion: '1.2' as const,
};
