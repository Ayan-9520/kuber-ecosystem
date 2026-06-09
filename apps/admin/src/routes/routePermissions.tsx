import { type ReactNode } from 'react';

import { PermissionRoute } from '@/components/guards/PermissionRoute';

const PERMS: Record<string, string[] | undefined> = {
  dashboard: undefined,
  leads: ['leads.read'],
  customers: ['customers.read'],
  applications: ['applications.read'],
  documents: ['documents.read'],
  products: ['products.read'],
  partners: ['partners.read'],
  referrals: ['referrals.read'],
  commissions: ['commissions.read'],
  notifications: ['notifications.read'],
  email: ['emails.read', 'notifications.read'],
  sms: ['sms.read', 'notifications.read'],
  push: ['push.read', 'notifications.read'],
  campaigns: ['notifications.read'],
  support: ['tickets.read'],
  copilot: ['copilot.read', 'leads.read', 'applications.read', 'analytics.read'],
  analytics: ['analytics.read'],
  'executive-analytics': ['executive_analytics.read', 'analytics.read'],
  'branch-analytics': ['branch_analytics.read', 'analytics.read'],
  'regional-analytics': ['regional_analytics.read', 'analytics.read'],
  recommendations: ['recommendations.read', 'analytics.read'],
  knowledge: ['knowledge.read', 'knowledge.write', 'knowledge.manage'],
  rag: ['rag.read', 'rag.write', 'rag.manage'],
  'ai-platform': ['ai.read', 'ai.write', 'ai.manage'],
  users: ['users.read', 'roles.read'],
  audit: ['audit.read'],
  settings: ['settings.read'],
};

export function withPermission(page: string, element: ReactNode): ReactNode {
  return <PermissionRoute permissions={PERMS[page]}>{element}</PermissionRoute>;
}
