export const PLAY_STORE_PERMISSIONS = {
  MOBILE_RELEASE: 'mobile.release',
  MOBILE_PUBLISH: 'mobile.publish',
  RELEASE_MANAGE: 'release.manage',
} as const;

export const PACKAGE_NAMES = {
  CUSTOMER: 'com.kuberone.customer',
  DSA: 'com.kuberone.partner',
} as const;

export const STORE_READINESS_CHECKLIST = [
  { id: 'listing', label: 'Store listing complete', weight: 10 },
  { id: 'shortDesc', label: 'Short description (80 chars)', weight: 5 },
  { id: 'fullDesc', label: 'Full description', weight: 5 },
  { id: 'icon', label: 'App icon 512×512', weight: 10 },
  { id: 'featureGraphic', label: 'Feature graphic 1024×500', weight: 10 },
  { id: 'screenshots', label: 'Phone screenshots (min 2)', weight: 15 },
  { id: 'tabletScreenshots', label: 'Tablet screenshots', weight: 5 },
  { id: 'aab', label: 'Signed AAB uploaded', weight: 15 },
  { id: 'playSigning', label: 'Play App Signing enabled', weight: 10 },
  { id: 'crashlytics', label: 'Firebase Crashlytics', weight: 5 },
  { id: 'analytics', label: 'Firebase Analytics', weight: 5 },
  { id: 'internalTrack', label: 'Internal testing validated', weight: 5 },
  { id: 'uat', label: 'Closed testing UAT sign-off', weight: 10 },
] as const;

export const COMPLIANCE_CHECKLIST = [
  { id: 'privacyPolicy', label: 'Privacy Policy URL', weight: 15 },
  { id: 'terms', label: 'Terms & Conditions URL', weight: 10 },
  { id: 'dataSafety', label: 'Data Safety form complete', weight: 20 },
  { id: 'dataCollection', label: 'Data collection disclosure', weight: 10 },
  { id: 'dataUsage', label: 'Data usage disclosure', weight: 10 },
  { id: 'userDataPolicy', label: 'User Data policy alignment', weight: 10 },
  { id: 'financialDecl', label: 'Financial services declaration', weight: 10 },
  { id: 'targetAudience', label: 'Target audience 18+', weight: 5 },
  { id: 'adsDecl', label: 'Ads declaration (no ads)', weight: 5 },
  { id: 'permissions', label: 'Permissions justified', weight: 5 },
] as const;

export const PLAY_INTEGRITY_CHECKLIST = [
  { id: 'integrityApi', label: 'Play Integrity API enabled', weight: 40 },
  { id: 'deviceValidation', label: 'Device validation ready', weight: 30 },
  { id: 'fraudProtection', label: 'Fraud protection hooks', weight: 30 },
] as const;

export const STORE_ASSETS_CHECKLIST = [
  { asset: 'App Icon', spec: '512×512 PNG', customer: true, dsa: true },
  { asset: 'Adaptive Icon', spec: 'Foreground 432×432', customer: true, dsa: true },
  { asset: 'Feature Graphic', spec: '1024×500', customer: true, dsa: true },
  { asset: 'Promo Graphic', spec: '180×120 (optional)', customer: false, dsa: false },
  { asset: 'Splash Screen', spec: 'In-app #071A1F', customer: true, dsa: true },
  { asset: 'Phone Screenshots', spec: 'Min 2, max 8', customer: true, dsa: true },
  { asset: '7-inch Tablet', spec: 'Min 1', customer: true, dsa: true },
  { asset: '10-inch Tablet', spec: 'Min 1', customer: true, dsa: true },
] as const;

export const CUSTOMER_SCREENSHOTS = [
  'Login', 'Dashboard', 'Eligibility', 'EMI Calculator', 'Application',
  'Documents', 'Support', 'AI Advisor', 'Voice AI',
] as const;

export const DSA_SCREENSHOTS = [
  'Login', 'Dashboard', 'Leads', 'Applications', 'Commissions',
  'Referrals', 'Analytics', 'Support',
] as const;

export const TESTING_TRACKS = [
  { id: 'INTERNAL', label: 'Internal Testing', testers: '≤100', review: false },
  { id: 'CLOSED', label: 'Closed Testing', testers: 'Email list', review: false },
  { id: 'OPEN', label: 'Open Testing', testers: 'Public', review: true },
  { id: 'PRODUCTION', label: 'Production', testers: 'All users', review: true },
] as const;
