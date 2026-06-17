import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const goLiveChecklistStatuses = ['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'WAIVED'] as const;
export const goLiveApprovalTypes = ['QA', 'SECURITY', 'DEVOPS', 'PRODUCT', 'MANAGEMENT', 'FINAL_RELEASE'] as const;
export const goLiveApprovalStatuses = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export const launchExecutionStatuses = ['PLANNED', 'PRE_LAUNCH', 'IN_PROGRESS', 'COMPLETED', 'ROLLED_BACK', 'ABORTED'] as const;
export const releaseGateStatuses = ['PENDING', 'PASSED', 'FAILED', 'BLOCKED'] as const;
export const goLiveSections = [
  'APPLICATION', 'DATABASE', 'API', 'CRM', 'CUSTOMER_APP', 'DSA_APP',
  'AI', 'NOTIFICATIONS', 'SECURITY', 'INFRASTRUCTURE', 'PERFORMANCE',
  'COMPLIANCE', 'ROLLBACK', 'LAUNCH_DAY',
] as const;

export const listGoLiveChecklistQuerySchema = paginationSchema.extend({
  section: z.enum(goLiveSections).optional(),
  status: z.enum(goLiveChecklistStatuses).optional(),
});

export const updateGoLiveChecklistSchema = z.object({
  status: z.enum(goLiveChecklistStatuses),
  evidence: z.record(z.unknown()).optional(),
});

export const decideGoLiveApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().max(2000).optional(),
  checklist: z.record(z.unknown()).optional(),
});

export const startLaunchSchema = z.object({
  launchExecutionId: z.string().uuid().optional(),
  code: z.string().max(64).optional(),
});

export const completeLaunchSchema = z.object({
  launchExecutionId: z.string().uuid(),
  rolledBack: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
});

export const goLiveWebhookSchema = z.object({
  event: z.enum([
    'CHECKLIST_PASSED', 'GATE_PASSED', 'GATE_FAILED',
    'APPROVAL_SUBMITTED', 'LAUNCH_STARTED', 'LAUNCH_COMPLETED',
  ]),
  itemCode: z.string().max(64).optional(),
  gateCode: z.string().max(64).optional(),
  launchCode: z.string().max(64).optional(),
  details: z.record(z.unknown()).optional(),
});

export const launchIdParamSchema = z.object({
  launchId: z.string().uuid(),
});

export const goLiveStatusQuerySchema = z.object({
  launchExecutionId: z.string().uuid().optional(),
});

export const listLaunchEventsQuerySchema = paginationSchema.extend({
  launchExecutionId: z.string().uuid().optional(),
});

export const createLaunchEventSchema = z.object({
  launchExecutionId: z.string().uuid().optional(),
  eventType: z.enum([
    'WORKFLOW_STEP', 'VALIDATION', 'SMOKE_TEST', 'DEPLOYMENT', 'HEALTH_CHECK',
    'TRAFFIC', 'INCIDENT', 'ROLLBACK', 'APPROVAL', 'WAR_ROOM', 'ALERT', 'SYSTEM',
  ]),
  step: z.enum([
    'PRODUCTION_FREEZE', 'DATABASE_BACKUP', 'RELEASE_DEPLOYMENT', 'HEALTH_VALIDATION',
    'SMOKE_TESTING', 'BUSINESS_VALIDATION', 'LAUNCH_APPROVAL', 'TRAFFIC_ENABLEMENT', 'COMPLETED',
  ]).optional(),
  title: z.string().min(2).max(300),
  message: z.string().max(2000).optional(),
  severity: z.enum(['SEV_1', 'SEV_2', 'SEV_3', 'SEV_4']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const advanceWorkflowSchema = z.object({
  launchExecutionId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
});

export const listLaunchIncidentsQuerySchema = z.object({
  launchExecutionId: z.string().uuid().optional(),
  severity: z.enum(['SEV_1', 'SEV_2', 'SEV_3', 'SEV_4']).optional(),
  status: z.enum(['OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED', 'CLOSED']).optional(),
});

export const createLaunchIncidentSchema = z.object({
  launchExecutionId: z.string().uuid().optional(),
  code: z.string().min(2).max(64),
  title: z.string().min(2).max(300),
  description: z.string().min(2).max(5000),
  severity: z.enum(['SEV_1', 'SEV_2', 'SEV_3', 'SEV_4']).default('SEV_3'),
  runbook: z.string().max(5000).optional(),
});

export const updateLaunchIncidentSchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED', 'CLOSED']).optional(),
  assignedToId: z.string().uuid().optional(),
  description: z.string().max(5000).optional(),
});

export const launchIncidentIdParamSchema = z.object({
  incidentId: z.string().uuid(),
});

export const listLaunchMetricsQuerySchema = z.object({
  launchExecutionId: z.string().uuid().optional(),
  category: z.enum(['TRAFFIC', 'PERFORMANCE', 'ERRORS', 'BUSINESS', 'INFRASTRUCTURE', 'NOTIFICATIONS', 'AI']).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const activateWarRoomSchema = z.object({
  launchExecutionId: z.string().uuid().optional(),
});

export const checklistItemCodeParamSchema = z.object({
  itemCode: z.string().max(64),
});
