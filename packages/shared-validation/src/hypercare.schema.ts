import { z } from 'zod';

export const hypercarePhases = ['WEEK_1', 'WEEK_2', 'WEEK_3', 'WEEK_4', 'EXTENSION'] as const;
export const hypercareIncidentSeverities = ['SEV_1', 'SEV_2', 'SEV_3', 'SEV_4'] as const;
export const hypercareIncidentStatuses = ['OPEN', 'INVESTIGATING', 'ESCALATED', 'MITIGATED', 'RESOLVED', 'CLOSED'] as const;
export const hypercareIssueCategories = ['CUSTOMER', 'DSA', 'CRM', 'AI', 'NOTIFICATION', 'PERFORMANCE', 'BUG', 'SUPPORT'] as const;
export const hypercareIssueTypes = ['BUG', 'SUPPORT', 'PERFORMANCE', 'HOTFIX', 'PATCH'] as const;
export const hypercareIssueStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
export const hypercareMetricCategories = ['SYSTEM', 'API', 'DATABASE', 'QUEUE', 'AI', 'NOTIFICATION', 'BUSINESS', 'ADOPTION', 'PERFORMANCE'] as const;
export const hypercareRcaTargets = ['INCIDENT', 'ISSUE', 'PERFORMANCE', 'SECURITY'] as const;

export const hypercareStatusQuerySchema = z.object({
  sessionId: z.string().uuid().optional(),
});

export const listHypercareIncidentsQuerySchema = z.object({
  sessionId: z.string().uuid().optional(),
  severity: z.enum(hypercareIncidentSeverities).optional(),
  status: z.enum(hypercareIncidentStatuses).optional(),
});

export const createHypercareIncidentSchema = z.object({
  sessionId: z.string().uuid().optional(),
  code: z.string().min(2).max(64),
  title: z.string().min(2).max(300),
  description: z.string().min(2).max(5000),
  severity: z.enum(hypercareIncidentSeverities).default('SEV_3'),
});

export const updateHypercareIncidentSchema = z.object({
  status: z.enum(hypercareIncidentStatuses).optional(),
  assignedToId: z.string().uuid().optional(),
});

export const hypercareIncidentIdParamSchema = z.object({
  incidentId: z.string().uuid(),
});

export const listHypercareIssuesQuerySchema = z.object({
  sessionId: z.string().uuid().optional(),
  category: z.enum(hypercareIssueCategories).optional(),
  status: z.enum(hypercareIssueStatuses).optional(),
});

export const createHypercareIssueSchema = z.object({
  sessionId: z.string().uuid().optional(),
  code: z.string().min(2).max(64),
  title: z.string().min(2).max(300),
  description: z.string().min(2).max(5000),
  category: z.enum(hypercareIssueCategories),
  issueType: z.enum(hypercareIssueTypes).default('BUG'),
  severity: z.enum(hypercareIncidentSeverities).default('SEV_3'),
  hotfixRequired: z.boolean().default(false),
});

export const updateHypercareIssueSchema = z.object({
  status: z.enum(hypercareIssueStatuses).optional(),
  assignedToId: z.string().uuid().optional(),
});

export const hypercareIssueIdParamSchema = z.object({
  issueId: z.string().uuid(),
});

export const listHypercareMetricsQuerySchema = z.object({
  sessionId: z.string().uuid().optional(),
  category: z.enum(hypercareMetricCategories).optional(),
});

export const createHypercareRcaSchema = z.object({
  sessionId: z.string().uuid().optional(),
  targetType: z.enum(hypercareRcaTargets),
  targetId: z.string().uuid(),
  title: z.string().min(2).max(300),
  rootCause: z.string().min(2).max(5000),
  correctiveAction: z.string().max(5000).optional(),
  preventiveAction: z.string().max(5000).optional(),
});

export const hypercareReportsQuerySchema = z.object({
  sessionId: z.string().uuid().optional(),
});
