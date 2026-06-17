export const APP_STORE_PERMISSIONS = {
  MOBILE_RELEASE: 'mobile.release',
  MOBILE_PUBLISH: 'mobile.publish',
  RELEASE_MANAGE: 'release.manage',
} as const;

export const BUNDLE_IDS = {
  CUSTOMER: 'com.kuberone.customer',
  DSA: 'com.kuberone.partner',
} as const;

export const STORE_READINESS_CHECKLIST = [
  { id: 'listing', label: 'App Store listing complete', weight: 10 },
  { id: 'subtitle', label: 'Subtitle (30 chars)', weight: 5 },
  { id: 'description', label: 'Description', weight: 5 },
  { id: 'keywords', label: 'Keywords', weight: 5 },
  { id: 'icon', label: 'App icon 1024×1024', weight: 10 },
  { id: 'screenshots', label: 'iPhone screenshots', weight: 15 },
  { id: 'ipadScreenshots', label: 'iPad screenshots', weight: 5 },
  { id: 'ipa', label: 'IPA uploaded to App Store Connect', weight: 15 },
  { id: 'signing', label: 'Distribution cert & profile', weight: 10 },
  { id: 'crashlytics', label: 'Firebase Crashlytics', weight: 5 },
  { id: 'analytics', label: 'Firebase Analytics', weight: 5 },
  { id: 'testflight', label: 'TestFlight internal validated', weight: 5 },
  { id: 'externalBeta', label: 'External beta sign-off', weight: 10 },
] as const;

export const COMPLIANCE_CHECKLIST = [
  { id: 'privacyPolicy', label: 'Privacy Policy URL', weight: 12 },
  { id: 'terms', label: 'Terms & Conditions URL', weight: 8 },
  { id: 'nutritionLabels', label: 'Privacy nutrition labels', weight: 15 },
  { id: 'dataCollection', label: 'Data collection disclosure', weight: 10 },
  { id: 'dataUsage', label: 'Data usage disclosure', weight: 10 },
  { id: 'dataTracking', label: 'No tracking without ATT', weight: 8 },
  { id: 'userRights', label: 'User rights disclosure', weight: 7 },
  { id: 'financialDecl', label: 'Financial services compliance', weight: 10 },
  { id: 'userConsent', label: 'User consent flows', weight: 10 },
  { id: 'permissions', label: 'Permission usage strings', weight: 10 },
] as const;

export const REVIEW_READINESS_CHECKLIST = [
  { id: 'reviewerNotes', label: 'Reviewer instructions', weight: 25 },
  { id: 'demoAccount', label: 'Demo account credentials', weight: 25 },
  { id: 'aiExplanation', label: 'AI feature explanation', weight: 20 },
  { id: 'financialExplanation', label: 'Financial services explanation', weight: 20 },
  { id: 'contactInfo', label: 'Review contact info', weight: 10 },
] as const;

export const SECURITY_CHECKLIST = [
  { id: 'keychain', label: 'Keychain storage', weight: 20 },
  { id: 'tokenEncryption', label: 'Secure token storage', weight: 20 },
  { id: 'pinning', label: 'Certificate pinning ready', weight: 20 },
  { id: 'jailbreak', label: 'Jailbreak detection ready', weight: 15 },
  { id: 'encryption', label: 'Data encryption in transit', weight: 25 },
] as const;

export const STORE_ASSETS_CHECKLIST = [
  { asset: 'App Icon', spec: '1024×1024 PNG', customer: true, dsa: true },
  { asset: 'iPhone 6.7" Screenshots', spec: 'Min 3', customer: true, dsa: true },
  { asset: 'iPhone 6.5" Screenshots', spec: 'Min 3', customer: true, dsa: true },
  { asset: 'iPad 12.9" Screenshots', spec: 'Min 1', customer: true, dsa: true },
  { asset: 'App Preview Video', spec: '15–30s optional', customer: false, dsa: false },
  { asset: 'Promotional Text', spec: '170 chars', customer: true, dsa: true },
] as const;

export const CUSTOMER_SCREENSHOTS = [
  'Login', 'Dashboard', 'Eligibility', 'EMI Calculator', 'Loan Application',
  'Documents', 'Support', 'AI Advisor', 'Voice AI', 'Profile',
] as const;

export const DSA_SCREENSHOTS = [
  'Login', 'Dashboard', 'Leads', 'Applications', 'Customers',
  'Commissions', 'Referrals', 'Analytics', 'Support', 'Profile',
] as const;

export const TESTFLIGHT_TRACKS = [
  { id: 'TESTFLIGHT_INTERNAL', label: 'Internal Testing', testers: '≤100 team' },
  { id: 'TESTFLIGHT_EXTERNAL', label: 'External Testing', testers: '≤10,000' },
  { id: 'APP_STORE', label: 'App Store Production', testers: 'Public' },
] as const;

/** Organizational teams for launch briefing, TestFlight beta groups, and UAT coordination */
export const MANAGEMENT_TEAMS = [
  { id: 'branch-managers', label: 'Branch Managers', testflightGroup: 'TF-Branch-Managers', apps: ['CUSTOMER', 'DSA'] as const },
  { id: 'regional-managers', label: 'Regional Managers', testflightGroup: 'TF-Regional-Managers', apps: ['CUSTOMER', 'DSA'] as const },
  { id: 'sales-team', label: 'Sales Team', testflightGroup: 'TF-Sales-Customer', apps: ['CUSTOMER'] as const },
  { id: 'credit-team', label: 'Credit Team', testflightGroup: 'TF-Credit-Customer', apps: ['CUSTOMER'] as const },
  { id: 'operations-team', label: 'Operations Team', testflightGroup: 'TF-Operations', apps: ['CUSTOMER', 'DSA'] as const },
  { id: 'compliance-team', label: 'Compliance Team', testflightGroup: 'TF-Compliance', apps: ['CUSTOMER', 'DSA'] as const },
  { id: 'support-team', label: 'Support Team', testflightGroup: 'TF-Support', apps: ['CUSTOMER', 'DSA'] as const },
  { id: 'admin-team', label: 'Admin Team', testflightGroup: 'TF-Admin-Internal', apps: ['CUSTOMER', 'DSA'] as const },
] as const;

export const TESTFLIGHT_BETA_GROUPS = MANAGEMENT_TEAMS.map((t) => t.testflightGroup);
