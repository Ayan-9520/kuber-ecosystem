export interface ManagementTeam {
  id: string;
  label: string;
  description: string;
  path: string;
  permissions: string[];
  launchBriefing?: string;
  testflightGroup?: string;
}

export const MANAGEMENT_TEAMS: ManagementTeam[] = [
  {
    id: 'branch-managers',
    label: 'Branch Managers',
    description: 'Branch funnel, team performance, partner oversight, and SLA escalations.',
    path: '/branch-analytics',
    permissions: ['branch_analytics.read', 'analytics.read'],
    launchBriefing: 'Branch rollout plan, partner comms, SLA monitoring',
    testflightGroup: 'TF-Branch-Managers',
  },
  {
    id: 'regional-managers',
    label: 'Regional Managers',
    description: 'Multi-branch comparison, regional KPIs, and escalation resolution.',
    path: '/regional-analytics',
    permissions: ['regional_analytics.read', 'analytics.read'],
    launchBriefing: 'Regional targets, branch coaching, commission disputes',
    testflightGroup: 'TF-Regional-Managers',
  },
  {
    id: 'sales-team',
    label: 'Sales Team',
    description: 'Lead queue, applications, customer onboarding, and copilot insights.',
    path: '/leads',
    permissions: ['leads.read'],
    launchBriefing: 'Customer app flows, lead capture, AI Advisor usage',
    testflightGroup: 'TF-Sales-Customer',
  },
  {
    id: 'credit-team',
    label: 'Credit Team',
    description: 'Credit review queue, eligibility, sanctions, and document verification.',
    path: '/applications',
    permissions: ['applications.read'],
    launchBriefing: 'Loan application accuracy, credit disclaimers, SoD flows',
    testflightGroup: 'TF-Credit-Customer',
  },
  {
    id: 'operations-team',
    label: 'Operations Team',
    description: 'LOS processing, document verification, lender submissions, disbursements.',
    path: '/documents',
    permissions: ['documents.read', 'applications.read'],
    launchBriefing: 'Document upload, OCR, lender handoff workflows',
    testflightGroup: 'TF-Operations',
  },
  {
    id: 'compliance-team',
    label: 'Compliance Team',
    description: 'Audit center, regulatory compliance, risk, and security oversight.',
    path: '/governance',
    permissions: ['audit.read', 'compliance.read'],
    launchBriefing: 'Privacy labels, consent flows, financial disclaimers',
    testflightGroup: 'TF-Compliance',
  },
  {
    id: 'support-team',
    label: 'Support Team',
    description: 'Ticket queue, SLA tracking, escalations, and customer communications.',
    path: '/support',
    permissions: ['tickets.read'],
    launchBriefing: 'In-app support, Voice AI escalations, review responses',
    testflightGroup: 'TF-Support',
  },
  {
    id: 'admin-team',
    label: 'Admin Team',
    description: 'Users, RBAC, settings, campaigns, and platform configuration.',
    path: '/users',
    permissions: ['users.read', 'roles.read'],
    launchBriefing: 'CRM access, release dashboards, incident runbooks',
    testflightGroup: 'TF-Admin-Internal',
  },
];
