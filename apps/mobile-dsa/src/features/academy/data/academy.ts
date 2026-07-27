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
  icon: string;
}[] = [
  { id: 'learning', title: 'My Learning', description: '10-level roadmap · Foundation to Master Partner', icon: 'book' },
  { id: 'certifications', title: 'Certifications', description: 'Bronze → Diamond certificates', icon: 'ribbon' },
  { id: 'downloads', title: 'Downloads', description: 'Starter kit, brochures, checklists', icon: 'download' },
  { id: 'crm', title: 'CRM Training', description: 'Lead pipeline, docs & reports in KuberOne', icon: 'git-network' },
  { id: 'marketing', title: 'Marketing Toolkit', description: 'WhatsApp, social & festival creatives', icon: 'color-palette' },
  { id: 'scripts', title: 'Sales Scripts', description: 'Call & WhatsApp scripts by profession', icon: 'chatbubbles' },
  { id: 'videos', title: 'Video Library', description: 'All academy lessons', icon: 'videocam' },
  { id: 'ai', title: 'AI Assistant', description: 'Pitches, proposals & objection handling', icon: 'sparkles' },
  { id: 'community', title: 'Community', description: 'Forum, webinars & success stories', icon: 'people' },
  { id: 'leaderboard', title: 'Leaderboard', description: 'Top revenue, learning & referrals', icon: 'trophy' },
  { id: 'support', title: 'Support', description: 'Academy helpdesk', icon: 'help-buoy' },
  { id: 'profile', title: 'Profile', description: 'KYC, progress, wallet & referral', icon: 'person' },
];

export const ACADEMY_LEVELS = [
  { id: 1, title: 'Foundation', progress: 100 },
  { id: 2, title: 'Home Loan Specialist', progress: 72 },
  { id: 3, title: 'Loan Against Property', progress: 35 },
  { id: 4, title: 'Business Loan Specialist', progress: 10 },
  { id: 5, title: 'Insurance Advisor', progress: 0 },
  { id: 6, title: 'CRM Expert', progress: 0 },
  { id: 7, title: 'Digital Marketing', progress: 0 },
  { id: 8, title: 'AI for Finance', progress: 0 },
  { id: 9, title: 'Leadership', progress: 0 },
  { id: 10, title: 'Master Partner', progress: 0 },
];

export const PARTNER_ACADEMY_STATS = {
  learningProgress: 48,
  certificates: 1,
  learningHours: 36,
  partnerRank: 18,
  continueCourse: 'Home Loan Specialist Certification',
};
