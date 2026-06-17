import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const auditSources = [
  'AUTH', 'RBAC', 'CUSTOMERS', 'PARTNERS', 'LEADS', 'APPLICATIONS', 'DOCUMENTS',
  'REFERRALS', 'COMMISSIONS', 'NOTIFICATIONS', 'SUPPORT', 'AI', 'ANALYTICS',
  'CAMPAIGNS', 'AUTOMATION', 'CONTENT', 'KNOWLEDGE', 'RAG', 'SETTINGS', 'SYSTEM',
] as const;

export const auditActionTypes = [
  'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'ASSIGN', 'ESCALATE', 'EXPORT',
  'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PERMISSION_CHANGE', 'ROLE_CHANGE', 'CONFIG_CHANGE',
  'AI_ACTION', 'VOICE_ACTION', 'VIEW', 'DOWNLOAD', 'PUBLISH', 'ARCHIVE',
] as const;

export const complianceFrameworks = [
  'DPDP', 'KYC', 'AML', 'INTERNAL_POLICY', 'SECURITY', 'OPERATIONAL', 'AUDIT',
] as const;

export const riskTypes = [
  'OPERATIONAL', 'CREDIT', 'COMPLIANCE', 'SECURITY', 'AI', 'FRAUD', 'PARTNER',
] as const;

export const riskSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const securityEventTypes = [
  'FAILED_LOGIN', 'ACCOUNT_LOCKOUT', 'SUSPICIOUS_ACTIVITY', 'PERMISSION_ESCALATION',
  'API_ABUSE', 'RATE_LIMIT_VIOLATION', 'FILE_UPLOAD_RISK', 'AI_PROMPT_ABUSE',
  'SESSION_HIJACK', 'BRUTE_FORCE',
] as const;

export const dataAccessTypes = [
  'PII_ACCESS', 'SENSITIVE_DATA', 'DATA_EXPORT', 'BULK_ACTION', 'FILE_DOWNLOAD', 'DOCUMENT_VIEW',
] as const;

export const reportFormats = ['CSV', 'EXCEL', 'PDF', 'JSON'] as const;

export const listAuditEventsQuerySchema = paginationSchema.extend({
  source: z.enum(auditSources).optional(),
  action: z.enum(auditActionTypes).optional(),
  entityType: z.string().max(64).optional(),
  entityId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'source', 'action']).default('createdAt'),
});

export const exportAuditEventsQuerySchema = listAuditEventsQuerySchema.omit({
  page: true,
  limit: true,
}).extend({
  format: z.enum(reportFormats).default('CSV'),
});

export const createAuditReportSchema = z.object({
  code: z.string().min(2).max(64),
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  reportType: z.string().max(64),
  filters: z.record(z.unknown()).optional(),
  format: z.enum(reportFormats).default('CSV'),
});

export const listComplianceViolationsQuerySchema = paginationSchema.extend({
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED', 'ESCALATED']).optional(),
  framework: z.enum(complianceFrameworks).optional(),
  severity: z.enum(riskSeverities).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'severity']).default('createdAt'),
});

export const resolveViolationSchema = z.object({
  violationId: z.string().uuid(),
  status: z.enum(['RESOLVED', 'DISMISSED', 'ESCALATED']),
  comments: z.string().max(2000).optional(),
});

export const createComplianceReportSchema = z.object({
  code: z.string().min(2).max(64),
  name: z.string().min(2).max(200),
  framework: z.enum(complianceFrameworks).optional(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  format: z.enum(reportFormats).default('PDF'),
});

export const governanceAnalyticsQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
});

export const createRiskRegisterSchema = z.object({
  code: z.string().min(2).max(64),
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  riskType: z.enum(riskTypes),
  severity: z.enum(riskSeverities).default('MEDIUM'),
  likelihood: z.number().int().min(1).max(100).default(50),
  impact: z.number().int().min(1).max(100).default(50),
  ownerId: z.string().uuid().optional(),
  mitigationPlan: z.string().max(5000).optional(),
});

export const listRiskRegisterQuerySchema = paginationSchema.extend({
  riskType: z.enum(riskTypes).optional(),
  status: z.enum(['IDENTIFIED', 'ASSESSING', 'MITIGATING', 'ACCEPTED', 'CLOSED']).optional(),
  severity: z.enum(riskSeverities).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'riskScore', 'severity']).default('riskScore'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createRiskAssessmentSchema = z.object({
  riskId: z.string().uuid(),
  likelihood: z.number().int().min(1).max(100),
  impact: z.number().int().min(1).max(100),
  notes: z.string().max(5000).optional(),
});

export const listSecurityEventsQuerySchema = paginationSchema.extend({
  eventType: z.enum(securityEventTypes).optional(),
  severity: z.enum(riskSeverities).optional(),
  userId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'severity']).default('createdAt'),
});

export const listSecurityAlertsQuerySchema = paginationSchema.extend({
  status: z.enum(['OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE']).optional(),
  severity: z.enum(riskSeverities).optional(),
  sortBy: z.enum(['createdAt', 'severity']).default('createdAt'),
});

export const updateSecurityAlertSchema = z.object({
  alertId: z.string().uuid(),
  status: z.enum(['ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE']),
  assignedToId: z.string().uuid().optional(),
});

export const logDataAccessSchema = z.object({
  accessType: z.enum(dataAccessTypes),
  entityType: z.string().max(64),
  entityId: z.string().uuid().optional(),
  fieldNames: z.array(z.string()).optional(),
  recordCount: z.number().int().min(1).default(1),
  purpose: z.string().max(255).optional(),
});

export const governanceIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateComplianceReportInput = z.infer<typeof createComplianceReportSchema>;
export type ListAuditEventsQuery = z.infer<typeof listAuditEventsQuerySchema>;
export type ExportAuditEventsQuery = z.infer<typeof exportAuditEventsQuerySchema>;
export type CreateAuditReportInput = z.infer<typeof createAuditReportSchema>;
export type ListComplianceViolationsQuery = z.infer<typeof listComplianceViolationsQuerySchema>;
export type GovernanceAnalyticsQuery = z.infer<typeof governanceAnalyticsQuerySchema>;
export type CreateRiskRegisterInput = z.infer<typeof createRiskRegisterSchema>;
export type ListRiskRegisterQuery = z.infer<typeof listRiskRegisterQuerySchema>;
export type CreateRiskAssessmentInput = z.infer<typeof createRiskAssessmentSchema>;
export type ListSecurityEventsQuery = z.infer<typeof listSecurityEventsQuerySchema>;
export type ListSecurityAlertsQuery = z.infer<typeof listSecurityAlertsQuerySchema>;
