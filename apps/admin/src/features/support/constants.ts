export const TICKET_STATUSES = [
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'PENDING_CUSTOMER',
  'PENDING_INTERNAL',
  'RESOLVED',
  'CLOSED',
  'REJECTED',
] as const;

export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const ESCALATION_LEVELS = [
  'L1_SUPPORT',
  'L2_SUPPORT',
  'SUPPORT_MANAGER',
  'BRANCH_MANAGER',
  'REGIONAL_MANAGER',
  'ADMIN',
] as const;

export const STATUS_LABELS: Record<string, string> = {
  OPEN: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  PENDING_CUSTOMER: 'Waiting Customer',
  PENDING_INTERNAL: 'Waiting Internal',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const ESCALATION_LABELS: Record<string, string> = {
  L1_SUPPORT: 'Level 1',
  L2_SUPPORT: 'Level 2',
  SUPPORT_MANAGER: 'Support Manager',
  BRANCH_MANAGER: 'Branch Manager',
  REGIONAL_MANAGER: 'Regional Manager',
  ADMIN: 'Management',
};

export const SAVED_VIEWS_KEY = 'kuberone-support-saved-views';

export type TicketFilters = {
  status?: string;
  priority?: string;
  categoryId?: string;
  assignedUserId?: string;
  slaBreached?: boolean;
  fromDate?: string;
  toDate?: string;
};

export type SavedView = { id: string; name: string; filters: TicketFilters };
