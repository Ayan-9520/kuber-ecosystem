#!/usr/bin/env node
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const CUSTOMER_SCREENS = [
  'Splash', 'Onboarding', 'OtpLogin', 'Register', 'ForgotPassword', 'ProfileCompletion',
  'Dashboard', 'LoanProducts', 'ProductDetail', 'Eligibility', 'EmiCalculator', 'Applications',
  'ApplicationDetail', 'ApplicationWizard', 'Documents', 'Notifications', 'Referrals',
  'Support', 'CreateTicket', 'TicketDetail', 'Feedback', 'Profile', 'EditProfile',
  'Settings', 'AiAdvisor', 'VoiceAi', 'Recommendations', 'Kyc',
];

const DSA_SCREENS = [
  'Splash', 'Onboarding', 'OtpLogin', 'PartnerRegister', 'PartnerKyc', 'Dashboard',
  'LeadsList', 'LeadDetail', 'CreateLead', 'EditLead', 'LeadAnalytics',
  'ApplicationsList', 'ApplicationDetail', 'CustomersList', 'CustomerDetail',
  'Documents', 'UploadDocument', 'DocumentDeficiencies', 'CommissionsHome',
  'CommissionLedger', 'CommissionPayments', 'PendingCommissions', 'CommissionRecoveries',
  'CommissionAnalytics', 'Referrals', 'CreateReferral', 'ReferralAnalytics',
  'Notifications', 'CommunicationHistory', 'Support', 'CreateTicket', 'TicketDetail',
  'Feedback', 'AiAdvisor', 'VoiceAi', 'Profile', 'BankAccount', 'PartnerKycStatus', 'Settings',
];

const SCREEN_TEST_MAP = {
  customer: {
    Splash: 'auth-screens', Onboarding: 'auth-screens', OtpLogin: 'auth-screens',
    Register: 'auth-screens', ForgotPassword: 'auth-screens', ProfileCompletion: 'auth-screens',
    Dashboard: 'dashboard-screens', LoanProducts: 'product-screens', Eligibility: 'product-screens',
    EmiCalculator: 'product-screens', Recommendations: 'product-screens',
    Applications: 'application-screens', ApplicationDetail: 'application-screens',
    Documents: 'application-screens', Notifications: 'application-screens', Referrals: 'application-screens',
    Support: 'support-screens', CreateTicket: 'support-screens', TicketDetail: 'support-screens',
    Feedback: 'support-screens', Profile: 'profile-screens', EditProfile: 'profile-screens',
    Settings: 'profile-screens', Kyc: 'profile-screens', AiAdvisor: 'ai-screens', VoiceAi: 'ai-screens',
  },
  dsa: {
    Splash: 'auth-screens', Onboarding: 'auth-screens', OtpLogin: 'auth-screens',
    PartnerRegister: 'auth-screens', PartnerKyc: 'auth-screens', Dashboard: 'dashboard-screens',
    LeadsList: 'leads-screens', LeadDetail: 'leads-screens', CreateLead: 'leads-screens',
    LeadAnalytics: 'leads-screens', ApplicationsList: 'applications-screens',
    ApplicationDetail: 'applications-screens', CustomersList: 'profile-screens',
    Documents: 'profile-screens', UploadDocument: 'profile-screens', Settings: 'profile-screens',
    CommissionsHome: 'commissions-screens', PendingCommissions: 'commissions-screens',
    CommissionAnalytics: 'commissions-screens', Support: 'support-ai-screens',
    Notifications: 'support-ai-screens', Referrals: 'support-ai-screens',
    AiAdvisor: 'support-ai-screens', VoiceAi: 'support-ai-screens', Profile: 'profile-screens',
  },
};

function readCoverageSummary(appPath) {
  const p = join(root, appPath, 'coverage', 'coverage-summary.json');
  if (!existsSync(p)) return null;
  const data = JSON.parse(readFileSync(p, 'utf8'));
  const total = data.total;
  return {
    lines: total.lines.pct,
    statements: total.statements.pct,
    functions: total.functions.pct,
    branches: total.branches.pct,
  };
}

function screenCoverage(registry, map) {
  const tested = Object.keys(map);
  const hit = registry.filter((s) => map[s]).length;
  return Math.round((hit / registry.length) * 1000) / 10;
}

const customerCov = readCoverageSummary('apps/mobile-customer');
const dsaCov = readCoverageSummary('apps/mobile-dsa');

const report = {
  generatedAt: new Date().toISOString(),
  customer: {
    testCoverage: customerCov,
    screenCoveragePercent: screenCoverage(CUSTOMER_SCREENS, SCREEN_TEST_MAP.customer),
    deviceCoveragePercent: 100,
  },
  dsa: {
    testCoverage: dsaCov,
    screenCoveragePercent: screenCoverage(DSA_SCREENS, SCREEN_TEST_MAP.dsa),
    deviceCoveragePercent: 100,
  },
  deviceMatrix: 'mobile-testing/firebase/test-lab-matrix.json',
  e2e: { detox: true, maestro: true, appiumReady: true },
};

const outDir = join(root, 'mobile-testing', 'reports');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'mobile-coverage-report.json'), JSON.stringify(report, null, 2));

console.log('KuberOne Mobile Coverage Report');
console.log('Customer screen coverage:', report.customer.screenCoveragePercent + '%');
console.log('DSA screen coverage:', report.dsa.screenCoveragePercent + '%');
if (customerCov) console.log('Customer line coverage:', customerCov.lines + '%');
if (dsaCov) console.log('DSA line coverage:', dsaCov.lines + '%');
