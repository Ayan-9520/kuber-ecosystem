import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const uatUserGroups = [
  'CUSTOMER', 'DSA_PARTNER', 'SALES_EXECUTIVE', 'RELATIONSHIP_MANAGER',
  'CREDIT_EXECUTIVE', 'OPERATIONS_EXECUTIVE', 'BRANCH_MANAGER', 'REGIONAL_MANAGER',
  'COMPLIANCE_OFFICER', 'MANAGEMENT', 'ADMIN',
] as const;

export const uatBusinessFlows = [
  'AUTH', 'CUSTOMER', 'DSA', 'LMS', 'LOS', 'DOCUMENT', 'REFERRAL',
  'COMMISSION', 'SUPPORT', 'CAMPAIGN', 'AI', 'ANALYTICS',
] as const;

export const uatPlanStatuses = ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'] as const;
export const uatCycleStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
export const uatTestCaseTypes = ['POSITIVE', 'NEGATIVE', 'BOUNDARY', 'BUSINESS_RULE', 'EXCEPTION'] as const;
export const uatExecutionStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'] as const;
export const uatDefectSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
export const uatDefectStatuses = ['OPEN', 'ASSIGNED', 'FIXED', 'RETEST', 'CLOSED'] as const;
export const uatSignoffTypes = ['SALES', 'CREDIT', 'OPERATIONS', 'COMPLIANCE', 'MANAGEMENT', 'FINAL_UAT'] as const;
export const uatSignoffStatuses = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export const uatIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const uatAnalyticsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  planId: z.string().uuid().optional(),
  cycleId: z.string().uuid().optional(),
  businessFlow: z.enum(uatBusinessFlows).optional(),
});

export const listUatPlansQuerySchema = paginationSchema.extend({
  status: z.enum(uatPlanStatuses).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'name', 'status', 'startDate']).default('createdAt'),
});

export const createUatPlanSchema = z.object({
  code: z.string().min(2).max(64),
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  version: z.string().max(20).default('1.0'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  ownerId: z.string().uuid().optional(),
});

export const updateUatPlanSchema = createUatPlanSchema.partial().extend({
  status: z.enum(uatPlanStatuses).optional(),
});

export const listUatCyclesQuerySchema = paginationSchema.extend({
  planId: z.string().uuid().optional(),
  status: z.enum(uatCycleStatuses).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'name', 'status', 'startDate']).default('createdAt'),
});

export const createUatCycleSchema = z.object({
  planId: z.string().uuid(),
  code: z.string().min(2).max(64),
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateUatCycleSchema = createUatCycleSchema.partial().extend({
  status: z.enum(uatCycleStatuses).optional(),
});

export const listUatScenariosQuerySchema = paginationSchema.extend({
  cycleId: z.string().uuid().optional(),
  businessFlow: z.enum(uatBusinessFlows).optional(),
  userGroup: z.enum(uatUserGroups).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['sortOrder', 'name', 'businessFlow', 'createdAt']).default('sortOrder'),
});

export const createUatScenarioSchema = z.object({
  cycleId: z.string().uuid(),
  code: z.string().min(2).max(64),
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  businessFlow: z.enum(uatBusinessFlows),
  userGroup: z.enum(uatUserGroups),
  acceptanceCriteria: z.array(z.string()).optional(),
  priority: z.number().int().min(1).max(5).default(1),
  sortOrder: z.number().int().min(0).default(0),
});

export const listUatTestCasesQuerySchema = paginationSchema.extend({
  scenarioId: z.string().uuid().optional(),
  cycleId: z.string().uuid().optional(),
  businessFlow: z.enum(uatBusinessFlows).optional(),
  testType: z.enum(uatTestCaseTypes).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['sortOrder', 'title', 'testType', 'createdAt']).default('sortOrder'),
});

export const createUatTestCaseSchema = z.object({
  scenarioId: z.string().uuid(),
  code: z.string().min(2).max(64),
  title: z.string().min(2).max(300),
  description: z.string().max(2000).optional(),
  testType: z.enum(uatTestCaseTypes),
  preconditions: z.string().max(2000).optional(),
  steps: z.array(z.string()).optional(),
  expectedResult: z.string().min(2).max(2000),
  businessRule: z.string().max(2000).optional(),
  priority: z.number().int().min(1).max(5).default(1),
  sortOrder: z.number().int().min(0).default(0),
});

export const listUatExecutionsQuerySchema = paginationSchema.extend({
  cycleId: z.string().uuid().optional(),
  testCaseId: z.string().uuid().optional(),
  status: z.enum(uatExecutionStatuses).optional(),
  businessFlow: z.enum(uatBusinessFlows).optional(),
  sortBy: z.enum(['executedAt', 'status', 'createdAt']).default('executedAt'),
});

export const executeUatTestCaseSchema = z.object({
  cycleId: z.string().uuid(),
  testCaseId: z.string().uuid(),
  status: z.enum(uatExecutionStatuses),
  actualResult: z.string().max(5000).optional(),
  notes: z.string().max(2000).optional(),
  evidence: z.record(z.unknown()).optional(),
  duration: z.number().int().min(0).optional(),
});

export const listUatDefectsQuerySchema = paginationSchema.extend({
  cycleId: z.string().uuid().optional(),
  testCaseId: z.string().uuid().optional(),
  severity: z.enum(uatDefectSeverities).optional(),
  status: z.enum(uatDefectStatuses).optional(),
  businessFlow: z.enum(uatBusinessFlows).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'severity', 'status']).default('createdAt'),
});

export const createUatDefectSchema = z.object({
  testCaseId: z.string().uuid().optional(),
  title: z.string().min(2).max(300),
  description: z.string().min(2).max(5000),
  severity: z.enum(uatDefectSeverities).default('MEDIUM'),
  businessFlow: z.enum(uatBusinessFlows).optional(),
  assignedToId: z.string().uuid().optional(),
});

export const updateUatDefectSchema = z.object({
  title: z.string().min(2).max(300).optional(),
  description: z.string().min(2).max(5000).optional(),
  severity: z.enum(uatDefectSeverities).optional(),
  status: z.enum(uatDefectStatuses).optional(),
  assignedToId: z.string().uuid().optional(),
});

export const listUatSignoffsQuerySchema = paginationSchema.extend({
  cycleId: z.string().uuid().optional(),
  signoffType: z.enum(uatSignoffTypes).optional(),
  status: z.enum(uatSignoffStatuses).optional(),
});

export const submitUatSignoffSchema = z.object({
  cycleId: z.string().uuid(),
  signoffType: z.enum(uatSignoffTypes),
  status: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().max(2000).optional(),
  checklist: z.array(z.object({
    item: z.string(),
    checked: z.boolean(),
  })).optional(),
});

export const listUatTemplatesQuerySchema = paginationSchema.extend({
  businessFlow: z.enum(uatBusinessFlows).optional(),
  userGroup: z.enum(uatUserGroups).optional(),
  search: z.string().max(200).optional(),
});

export const uatReportQuerySchema = z.object({
  cycleId: z.string().uuid().optional(),
  planId: z.string().uuid().optional(),
  format: z.enum(['JSON', 'CSV']).default('JSON'),
});

// ── Final UAT Signoff Framework ──

export const uatApprovalStages = ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'REWORK_REQUIRED'] as const;
export const uatReviewAreas = [
  'CUSTOMER_JOURNEY', 'DSA_JOURNEY', 'CRM_JOURNEY', 'BUSINESS_WORKFLOWS', 'AI_WORKFLOWS',
  'NOTIFICATIONS', 'SECURITY', 'OPERATIONS', 'PERFORMANCE',
] as const;
export const uatRiskSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
export const uatRiskStatuses = ['OPEN', 'MITIGATED', 'ACCEPTED', 'CLOSED'] as const;

export const listUatApprovalsQuerySchema = paginationSchema.extend({
  cycleId: z.string().uuid().optional(),
  stage: z.enum(uatApprovalStages).optional(),
});

export const submitUatApprovalSchema = z.object({
  cycleId: z.string().uuid(),
  stakeholderId: z.string().uuid(),
  stage: z.enum(['IN_REVIEW', 'APPROVED', 'REJECTED', 'REWORK_REQUIRED']),
  approverName: z.string().max(200).optional(),
  approverRole: z.string().max(128).optional(),
  department: z.string().max(128).optional(),
  comments: z.string().max(2000).optional(),
  checklist: z.record(z.unknown()).optional(),
});

export const listUatReviewsQuerySchema = z.object({
  cycleId: z.string().uuid().optional(),
});

export const updateUatReviewSchema = z.object({
  cycleId: z.string().uuid(),
  reviewArea: z.enum(uatReviewAreas),
  stage: z.enum(['IN_REVIEW', 'APPROVED', 'REJECTED', 'REWORK_REQUIRED']),
  score: z.number().int().min(0).max(100).optional(),
  comments: z.string().max(2000).optional(),
  checklist: z.record(z.unknown()).optional(),
  findings: z.record(z.unknown()).optional(),
});

export const listUatRisksQuerySchema = paginationSchema.extend({
  cycleId: z.string().uuid().optional(),
  severity: z.enum(uatRiskSeverities).optional(),
  status: z.enum(uatRiskStatuses).optional(),
});

export const createUatRiskSchema = z.object({
  cycleId: z.string().uuid(),
  code: z.string().min(2).max(64),
  title: z.string().min(2).max(300),
  description: z.string().min(2).max(5000),
  severity: z.enum(uatRiskSeverities).default('MEDIUM'),
  reviewArea: z.enum(uatReviewAreas).optional(),
  mitigation: z.string().max(2000).optional(),
});

export const uatStatusQuerySchema = z.object({
  cycleId: z.string().uuid().optional(),
});

export const createUatCommentSchema = z.object({
  cycleId: z.string().uuid(),
  targetType: z.enum(['APPROVAL', 'REVIEW', 'RISK', 'SIGNOFF']),
  targetId: z.string().uuid(),
  body: z.string().min(1).max(5000),
});

export type UatAnalyticsQuery = z.infer<typeof uatAnalyticsQuerySchema>;
export type ListUatPlansQuery = z.infer<typeof listUatPlansQuerySchema>;
export type CreateUatPlanInput = z.infer<typeof createUatPlanSchema>;
export type UpdateUatPlanInput = z.infer<typeof updateUatPlanSchema>;
export type ListUatCyclesQuery = z.infer<typeof listUatCyclesQuerySchema>;
export type UpdateUatCycleInput = z.infer<typeof updateUatCycleSchema>;
export type ListUatScenariosQuery = z.infer<typeof listUatScenariosQuerySchema>;
export type ListUatTestCasesQuery = z.infer<typeof listUatTestCasesQuerySchema>;
export type ExecuteUatTestCaseInput = z.infer<typeof executeUatTestCaseSchema>;
export type ListUatDefectsQuery = z.infer<typeof listUatDefectsQuerySchema>;
export type CreateUatDefectInput = z.infer<typeof createUatDefectSchema>;
export type UpdateUatDefectInput = z.infer<typeof updateUatDefectSchema>;
export type SubmitUatSignoffInput = z.infer<typeof submitUatSignoffSchema>;
