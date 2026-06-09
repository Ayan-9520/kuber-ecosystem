import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Building2,
  CreditCard,
  FileText,
  Gift,
  Headphones,
  LayoutDashboard,
  MapPin,
  Mail,
  MessageSquare,
  BellRing,
  Megaphone,
  Package,
  Settings,
  Shield,
  Sparkles,
  Target,
  Users,
  UserCog,
  ClipboardList,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  permissions?: string[];
  section?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview' },
  { path: '/leads', label: 'Leads', icon: Target, permissions: ['leads.read'], section: 'CRM' },
  { path: '/leads/analytics', label: 'Lead Analytics', icon: BarChart3, permissions: ['leads.read'], section: 'CRM' },
  { path: '/leads/scoring-analytics', label: 'Lead Scoring', icon: Target, permissions: ['lead_scoring.read'], section: 'CRM' },
  { path: '/recommendations/analytics', label: 'Recommendations', icon: Sparkles, permissions: ['recommendations.read', 'analytics.read'], section: 'Insights' },
  { path: '/customers', label: 'Customers', icon: Users, permissions: ['customers.read'], section: 'CRM' },
  { path: '/applications', label: 'Applications', icon: ClipboardList, permissions: ['applications.read'], section: 'CRM' },
  { path: '/documents', label: 'Documents', icon: FileText, permissions: ['documents.read'], section: 'CRM' },
  { path: '/products', label: 'Products', icon: Package, permissions: ['products.read'], section: 'Catalog' },
  { path: '/partners', label: 'Partners', icon: Building2, permissions: ['partners.read'], section: 'Network' },
  { path: '/referrals', label: 'Referrals', icon: Gift, permissions: ['referrals.read'], section: 'Network' },
  { path: '/commissions', label: 'Commissions', icon: CreditCard, permissions: ['commissions.read'], section: 'Finance' },
  { path: '/notifications', label: 'Notifications', icon: Bell, permissions: ['notifications.read'], section: 'Communication' },
  { path: '/email', label: 'Email Platform', icon: Mail, permissions: ['emails.read', 'notifications.read'], section: 'Communication' },
  { path: '/sms', label: 'SMS Platform', icon: MessageSquare, permissions: ['sms.read', 'notifications.read'], section: 'Communication' },
  { path: '/push', label: 'Push Platform', icon: BellRing, permissions: ['push.read', 'notifications.read'], section: 'Communication' },
  { path: '/campaigns', label: 'Campaigns', icon: Megaphone, permissions: ['notifications.read'], section: 'Communication' },
  { path: '/support', label: 'Support', icon: Headphones, permissions: ['tickets.read'], section: 'Communication' },
  { path: '/copilot', label: 'AI Copilot', icon: Sparkles, permissions: ['copilot.read', 'leads.read', 'analytics.read'], section: 'Insights' },
  { path: '/knowledge', label: 'Knowledge Base', icon: BookOpen, permissions: ['knowledge.read', 'knowledge.manage'], section: 'Insights' },
  { path: '/rag', label: 'RAG Pipeline', icon: Brain, permissions: ['rag.read', 'rag.manage'], section: 'Insights' },
  { path: '/ai-platform', label: 'AI Platform', icon: Sparkles, permissions: ['ai.read', 'ai.manage'], section: 'Insights' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, permissions: ['analytics.read'], section: 'Insights' },
  { path: '/executive-analytics', label: 'Executive Analytics', icon: Target, permissions: ['executive_analytics.read', 'analytics.read'], section: 'Insights' },
  { path: '/branch-analytics', label: 'Branch Analytics', icon: Building2, permissions: ['branch_analytics.read', 'analytics.read'], section: 'Insights' },
  { path: '/regional-analytics', label: 'Regional Analytics', icon: MapPin, permissions: ['regional_analytics.read', 'analytics.read'], section: 'Insights' },
  { path: '/users', label: 'Users & RBAC', icon: UserCog, permissions: ['users.read', 'roles.read'], section: 'Administration' },
  { path: '/audit', label: 'Audit Logs', icon: Shield, permissions: ['audit.read'], section: 'Administration' },
  { path: '/settings', label: 'Settings', icon: Settings, permissions: ['settings.read'], section: 'Administration' },
];

export function filterNavByPermissions(permissions: string[], roles: string[]): NavItem[] {
  const isAdmin = roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');
  if (isAdmin) return NAV_ITEMS;

  return NAV_ITEMS.filter((item) => {
    if (!item.permissions?.length) return true;
    return item.permissions.some((p) => permissions.includes(p));
  });
}

export function groupNavItems(items: NavItem[]): Record<string, NavItem[]> {
  return items.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section ?? 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});
}
