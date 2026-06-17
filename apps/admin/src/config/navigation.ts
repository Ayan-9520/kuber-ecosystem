import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Building2,
  CreditCard,
  FileText,
  GitBranch,
  Server,
  Layers,
  Rocket,
  Smartphone,
  Store,
  Apple,
  Gift,
  Headphones,
  LayoutDashboard,
  MapPin,
  Mail,
  MessageSquare,
  MessageCircle,
  BellRing,
  Megaphone,
  Workflow,
  PenLine,
  Package,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  UserCog,
  ClipboardList,
  Code2,
  FlaskConical,
  LifeBuoy,
  Activity,
  Eye,
  Bug,
  HardDrive,
  Calculator,
  Mic,
  Scale,
  UserCheck,
  Landmark,
  Briefcase,
  CloudUpload,
  ShieldAlert,
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
  { path: '/kyc', label: 'KYC Center', icon: ShieldCheck, permissions: ['kyc.read', 'customers.read'], section: 'CRM' },
  { path: '/applications', label: 'Applications', icon: ClipboardList, permissions: ['applications.read'], section: 'CRM' },
  { path: '/documents', label: 'Documents', icon: FileText, permissions: ['documents.read'], section: 'CRM' },
  { path: '/eligibility', label: 'Eligibility Center', icon: Scale, permissions: ['eligibility.read'], section: 'CRM' },
  { path: '/emi', label: 'EMI Calculator', icon: Calculator, permissions: ['emi.read'], section: 'CRM' },
  { path: '/voice-ai', label: 'Voice AI Console', icon: Mic, permissions: ['eligibility.read', 'emi.read'], section: 'CRM' },
  { path: '/products', label: 'Products', icon: Package, permissions: ['products.read'], section: 'Catalog' },
  { path: '/partners', label: 'Partners', icon: Building2, permissions: ['partners.read'], section: 'Network' },
  { path: '/referrals', label: 'Referrals', icon: Gift, permissions: ['referrals.read'], section: 'Network' },
  { path: '/commissions', label: 'Commissions', icon: CreditCard, permissions: ['commissions.read'], section: 'Finance' },
  { path: '/notifications', label: 'Notifications', icon: Bell, permissions: ['notifications.read'], section: 'Communication' },
  { path: '/email', label: 'Email Platform', icon: Mail, permissions: ['emails.read', 'notifications.read'], section: 'Communication' },
  { path: '/sms', label: 'SMS Platform', icon: MessageSquare, permissions: ['sms.read', 'notifications.read'], section: 'Communication' },
  { path: '/whatsapp', label: 'WhatsApp Platform', icon: MessageCircle, permissions: ['notifications.read'], section: 'Communication' },
  { path: '/push', label: 'Push Platform', icon: BellRing, permissions: ['push.read', 'notifications.read'], section: 'Communication' },
  { path: '/campaigns', label: 'Campaigns', icon: Megaphone, permissions: ['campaigns.read'], section: 'Communication' },
  { path: '/automation', label: 'Marketing Automation', icon: Workflow, permissions: ['automation.read'], section: 'Communication' },
  { path: '/content', label: 'AI Content Studio', icon: PenLine, permissions: ['content.read'], section: 'Communication' },
  { path: '/support', label: 'Support', icon: Headphones, permissions: ['tickets.read'], section: 'Communication' },
  { path: '/copilot', label: 'AI Copilot', icon: Sparkles, permissions: ['copilot.read', 'leads.read', 'analytics.read'], section: 'Insights' },
  { path: '/knowledge', label: 'Knowledge Base', icon: BookOpen, permissions: ['knowledge.read', 'knowledge.manage'], section: 'Insights' },
  { path: '/rag', label: 'RAG Pipeline', icon: Brain, permissions: ['rag.read', 'rag.manage'], section: 'Insights' },
  { path: '/ai-platform', label: 'AI Platform', icon: Sparkles, permissions: ['ai.read', 'ai.manage'], section: 'Insights' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, permissions: ['analytics.read'], section: 'Insights' },
  { path: '/management', label: 'Management', icon: Briefcase, permissions: ['executive_analytics.read', 'analytics.read', 'branch_analytics.read', 'regional_analytics.read'], section: 'Management' },
  { path: '/executive-analytics', label: 'Executive Analytics', icon: Target, permissions: ['executive_analytics.read', 'analytics.read'], section: 'Insights' },
  { path: '/branch-analytics', label: 'Branch Analytics', icon: Building2, permissions: ['branch_analytics.read', 'analytics.read'], section: 'Insights' },
  { path: '/regional-analytics', label: 'Regional Analytics', icon: MapPin, permissions: ['regional_analytics.read', 'analytics.read'], section: 'Insights' },
  { path: '/users', label: 'Users & RBAC', icon: UserCog, permissions: ['users.read', 'roles.read'], section: 'Administration' },
  { path: '/employees', label: 'Employees', icon: UserCheck, permissions: ['employees.read'], section: 'Administration' },
  { path: '/branches', label: 'Branches', icon: Landmark, permissions: ['branches.read'], section: 'Administration' },
  { path: '/governance', label: 'Audit & Compliance', icon: Shield, permissions: ['audit.read', 'compliance.read', 'risk.read', 'security.read'], section: 'Administration' },
  { path: '/uat', label: 'UAT Signoff', icon: FlaskConical, permissions: ['uat.read'], section: 'Administration' },
  { path: '/monitoring', label: 'Production Monitoring', icon: Activity, permissions: ['monitoring.read'], section: 'Administration' },
  { path: '/observability', label: 'Logging & Observability', icon: Eye, permissions: ['observability.read', 'logs.read'], section: 'Administration' },
  { path: '/errors', label: 'Error Tracking', icon: Bug, permissions: ['errors.read'], section: 'Administration' },
  { path: '/backup', label: 'Backup & Recovery', icon: HardDrive, permissions: ['backup.read'], section: 'Administration' },
  { path: '/dr', label: 'Disaster Recovery', icon: ShieldAlert, permissions: ['dr.read', 'dr.manage', 'recovery.manage'], section: 'Administration' },
  { path: '/devops', label: 'DevOps & CI/CD', icon: GitBranch, permissions: ['devops.read'], section: 'Administration' },
  { path: '/infrastructure', label: 'Infrastructure', icon: Server, permissions: ['infrastructure.read'], section: 'Administration' },
  { path: '/staging', label: 'Staging Environment', icon: Layers, permissions: ['staging.read'], section: 'Administration' },
  { path: '/production', label: 'Production', icon: Rocket, permissions: ['production.read'], section: 'Administration' },
  { path: '/go-live', label: 'Go-Live Command Center', icon: Rocket, permissions: ['golive.read', 'launch.read', 'golive.manage', 'golive.approve', 'release.approve'], section: 'Administration' },
  { path: '/hypercare', label: 'Hypercare Support', icon: LifeBuoy, permissions: ['hypercare.read', 'hypercare.manage', 'hypercare.resolve'], section: 'Administration' },
  { path: '/backend-deployment', label: 'Backend Deployment', icon: CloudUpload, permissions: ['backend.deploy', 'backend.release', 'backend.manage', 'production.read'], section: 'Administration' },
  { path: '/mobile-releases', label: 'Mobile Releases', icon: Smartphone, permissions: ['mobile.release', 'mobile.build'], section: 'Administration' },
  { path: '/play-store', label: 'Play Store', icon: Store, permissions: ['mobile.release', 'mobile.publish'], section: 'Administration' },
  { path: '/app-store', label: 'App Store', icon: Apple, permissions: ['mobile.release', 'mobile.publish'], section: 'Administration' },
  { path: '/audit', label: 'Audit Logs', icon: Shield, permissions: ['audit.read'], section: 'Administration' },
  { path: '/settings', label: 'Settings', icon: Settings, permissions: ['settings.read'], section: 'Administration' },
  { path: '/developer-portal', label: 'Developer Portal', icon: Code2, permissions: ['settings.read', 'audit.read'], section: 'Administration' },
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
