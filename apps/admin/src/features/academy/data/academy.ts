export type AcademyModuleId =
  | 'learning'
  | 'certifications'
  | 'downloads'
  | 'crm'
  | 'marketing'
  | 'scripts'
  | 'videos'
  | 'ai'
  | 'community'
  | 'leaderboard'
  | 'support'
  | 'profile';

export const ACADEMY_MODULES: {
  id: AcademyModuleId;
  title: string;
  description: string;
  status: 'Active' | 'Coming soon';
}[] = [
  { id: 'learning', title: 'My Learning', description: '10-level roadmap from Foundation to Master Partner', status: 'Active' },
  { id: 'certifications', title: 'Certifications', description: 'Bronze to Diamond certificates with verification', status: 'Active' },
  { id: 'downloads', title: 'Downloads', description: 'Starter kit, brochures, checklists and decks', status: 'Active' },
  { id: 'crm', title: 'CRM Training', description: 'KuberOne lead pipeline, docs and reports', status: 'Active' },
  { id: 'marketing', title: 'Marketing Toolkit', description: 'WhatsApp, social and festival creatives', status: 'Active' },
  { id: 'scripts', title: 'Sales Scripts', description: 'Call, WhatsApp and profession-specific scripts', status: 'Active' },
  { id: 'videos', title: 'Video Library', description: 'All academy lessons in one place', status: 'Active' },
  { id: 'ai', title: 'AI Assistant', description: 'Pitch, proposal and objection drafting', status: 'Active' },
  { id: 'community', title: 'Community', description: 'Forum, webinars and success stories', status: 'Active' },
  { id: 'leaderboard', title: 'Leaderboard', description: 'Top revenue, learning and referrals', status: 'Active' },
  { id: 'support', title: 'Support', description: 'Academy helpdesk and escalations', status: 'Active' },
  { id: 'profile', title: 'Partner Profile', description: 'KYC, progress, wallet and referral link', status: 'Active' },
];

export const ACADEMY_LEVELS = [
  { id: 1, title: 'Foundation', progress: 100, certificate: 'Bronze' },
  { id: 2, title: 'Home Loan Specialist', progress: 72, certificate: 'Silver' },
  { id: 3, title: 'Loan Against Property', progress: 35, certificate: 'Silver' },
  { id: 4, title: 'Business Loan Specialist', progress: 10, certificate: 'Gold' },
  { id: 5, title: 'Insurance Advisor', progress: 0, certificate: 'Gold' },
  { id: 6, title: 'CRM Expert', progress: 0, certificate: 'Gold' },
  { id: 7, title: 'Digital Marketing', progress: 0, certificate: 'Platinum' },
  { id: 8, title: 'AI for Finance', progress: 0, certificate: 'Platinum' },
  { id: 9, title: 'Leadership', progress: 0, certificate: 'Diamond' },
  { id: 10, title: 'Master Partner', progress: 0, certificate: 'Diamond' },
];

/** Demo ops metrics for unified KuberOne dashboard (API-ready placeholders) */
export const ACADEMY_DASHBOARD_STATS = {
  enrolledPartners: 128,
  activeLearners: 64,
  certificatesIssued: 41,
  avgProgressPercent: 38,
  webinarsThisMonth: 2,
  topModule: 'Home Loan Specialist',
};
