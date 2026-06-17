export const MOBILE_RELEASE_PERMISSIONS = {
  MOBILE_RELEASE: 'mobile.release',
  MOBILE_BUILD: 'mobile.build',
  RELEASE_MANAGE: 'release.manage',
} as const;

export const PACKAGE_IDS = {
  CUSTOMER: {
    DEVELOPMENT: 'com.kuberone.customer.debug',
    QA: 'com.kuberone.customer.qa',
    STAGING: 'com.kuberone.customer.staging',
    PRODUCTION: 'com.kuberone.customer',
  },
  DSA: {
    DEVELOPMENT: 'com.kuberone.partner.debug',
    QA: 'com.kuberone.partner.qa',
    STAGING: 'com.kuberone.partner.staging',
    PRODUCTION: 'com.kuberone.partner',
  },
} as const;

export const PLAY_STORE_CHECKLIST = [
  { id: 'versionCode', label: 'versionCode incremented', weight: 10 },
  { id: 'signing', label: 'Release keystore configured', weight: 15 },
  { id: 'aab', label: 'AAB signed for Play Store', weight: 15 },
  { id: 'crashlytics', label: 'Firebase Crashlytics configured', weight: 10 },
  { id: 'privacy', label: 'Privacy Policy URL set', weight: 10 },
  { id: 'terms', label: 'Terms URL set', weight: 5 },
  { id: 'icon', label: 'App icon & splash screen', weight: 10 },
  { id: 'permissions', label: 'Permissions justified', weight: 10 },
  { id: 'fcm', label: 'FCM push notifications validated', weight: 10 },
  { id: 'uat', label: 'UAT sign-off', weight: 15 },
] as const;

export const SECURITY_CHECKLIST = [
  { id: 'proguard', label: 'ProGuard/R8 enabled', weight: 20 },
  { id: 'obfuscation', label: 'Code obfuscation', weight: 20 },
  { id: 'pinning', label: 'Certificate pinning ready', weight: 20 },
  { id: 'root', label: 'Root detection ready', weight: 15 },
  { id: 'secureStorage', label: 'Encrypted token storage', weight: 25 },
] as const;
