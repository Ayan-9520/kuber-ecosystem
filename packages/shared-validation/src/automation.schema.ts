import { z } from 'zod';

import { paginationSchema } from './pagination.schema.js';

export const automationJourneyTypes = [
  'LEAD_NURTURING',
  'LEAD_REENGAGEMENT',
  'CUSTOMER_ONBOARDING',
  'DOCUMENT_COLLECTION',
  'APPLICATION_FOLLOWUP',
  'SANCTION_FOLLOWUP',
  'DISBURSEMENT_FOLLOWUP',
  'REFERRAL_AUTOMATION',
  'COMMISSION_AUTOMATION',
  'CUSTOMER_RETENTION',
  'CROSS_SELL',
  'UPSELL',
  'BIRTHDAY_CAMPAIGN',
  'ANNIVERSARY_CAMPAIGN',
  'RENEWAL_CAMPAIGN',
  'FEEDBACK_CAMPAIGN',
] as const;

export const automationWorkflowStatuses = [
  'DRAFT',
  'PENDING_APPROVAL',
  'ACTIVE',
  'PAUSED',
  'ARCHIVED',
] as const;

export const automationNodeTypes = [
  'TRIGGER',
  'CONDITION',
  'ACTION',
  'DELAY',
  'BRANCH',
  'LOOP',
  'GOAL',
  'EXIT',
] as const;

export const automationTriggerTypes = [
  'LEAD_CREATED',
  'LEAD_ASSIGNED',
  'LEAD_SCORE_CHANGED',
  'APPLICATION_CREATED',
  'APPLICATION_APPROVED',
  'APPLICATION_REJECTED',
  'APPLICATION_SANCTIONED',
  'APPLICATION_DISBURSED',
  'DOCUMENT_UPLOADED',
  'DOCUMENT_REJECTED',
  'REFERRAL_CREATED',
  'REFERRAL_CONVERTED',
  'COMMISSION_APPROVED',
  'SUPPORT_TICKET_CREATED',
  'SUPPORT_TICKET_CLOSED',
  'CUSTOMER_REGISTERED',
  'CUSTOMER_LOGIN',
  'CUSTOMER_INACTIVE',
] as const;

export const automationActionTypes = [
  'SEND_EMAIL',
  'SEND_SMS',
  'SEND_WHATSAPP',
  'SEND_PUSH',
  'CREATE_CRM_TASK',
  'ASSIGN_LEAD',
  'REASSIGN_LEAD',
  'UPDATE_LEAD_SCORE',
  'UPDATE_STATUS',
  'CREATE_FOLLOW_UP',
  'CREATE_TICKET',
  'ESCALATE_TICKET',
  'TRIGGER_AI_RECOMMENDATION',
  'GENERATE_AI_CONTENT',
] as const;

export const automationGoalTypes = [
  'APPLICATION_SUBMITTED',
  'APPLICATION_APPROVED',
  'APPLICATION_DISBURSED',
  'REFERRAL_CONVERTED',
  'COMMISSION_PAID',
  'SUPPORT_RESOLVED',
] as const;

const conditionSchema = z.object({
  field: z.string().min(1).max(64),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'contains', 'exists']),
  value: z.unknown().optional(),
  logicGroup: z.string().max(32).optional(),
});

const actionSchema = z.object({
  actionType: z.enum(automationActionTypes),
  channel: z.string().max(32).optional(),
  templateCode: z.string().max(64).optional(),
  config: z.record(z.unknown()).optional(),
  delayBefore: z.number().int().min(0).optional(),
});

const nodeSchema = z.object({
  nodeKey: z.string().min(1).max(64),
  type: z.enum(automationNodeTypes),
  label: z.string().min(1).max(200),
  positionX: z.number().default(0),
  positionY: z.number().default(0),
  config: z.record(z.unknown()).optional(),
  nextNodeKeys: z.array(z.string()).optional(),
  parentKey: z.string().max(64).optional(),
  conditions: z.array(conditionSchema).optional(),
  actions: z.array(actionSchema).optional(),
});

export const listWorkflowsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(automationWorkflowStatuses).optional(),
  journeyType: z.enum(automationJourneyTypes).optional(),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
});

export const createWorkflowSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  journeyType: z.enum(automationJourneyTypes),
  branchId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  dataScopeJson: z.record(z.unknown()).optional(),
  requiresApproval: z.boolean().optional(),
  campaignId: z.string().uuid().optional(),
  canvasJson: z.record(z.unknown()).optional(),
  nodes: z.array(nodeSchema).optional(),
  triggers: z
    .array(
      z.object({
        triggerType: z.enum(automationTriggerTypes),
        config: z.record(z.unknown()).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .optional(),
  goals: z
    .array(
      z.object({
        goalType: z.enum(automationGoalTypes),
        config: z.record(z.unknown()).optional(),
        targetCount: z.number().int().positive().optional(),
      }),
    )
    .optional(),
});

export const updateWorkflowSchema = createWorkflowSchema.partial().extend({
  status: z.enum(automationWorkflowStatuses).optional(),
});

export const workflowIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listTemplatesQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  journeyType: z.enum(automationJourneyTypes).optional(),
  category: z.string().optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  journeyType: z.enum(automationJourneyTypes),
  category: z.string().max(64).optional(),
  canvasJson: z.record(z.unknown()).optional(),
  nodesJson: z.array(nodeSchema).optional(),
  triggersJson: z.array(z.record(z.unknown())).optional(),
  goalsJson: z.array(z.record(z.unknown())).optional(),
  isPublic: z.boolean().optional(),
});

export const listExecutionsQuerySchema = paginationSchema.extend({
  workflowId: z.string().uuid().optional(),
  status: z.string().optional(),
  triggerType: z.enum(automationTriggerTypes).optional(),
  subjectType: z.string().optional(),
  subjectId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const listTriggersQuerySchema = paginationSchema.extend({
  workflowId: z.string().uuid().optional(),
  triggerType: z.enum(automationTriggerTypes).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const updateTriggerSchema = z.object({
  triggerType: z.enum(automationTriggerTypes).optional(),
  config: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

export const createTriggerSchema = z.object({
  workflowId: z.string().uuid(),
  triggerType: z.enum(automationTriggerTypes),
  config: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

export const automationAnalyticsQuerySchema = paginationSchema.extend({
  workflowId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
});

export const listAutomationLogsQuerySchema = paginationSchema.extend({
  executionId: z.string().uuid().optional(),
  workflowId: z.string().uuid().optional(),
  level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const automationExportQuerySchema = z.object({
  type: z.enum(['workflows', 'executions', 'logs', 'analytics']).default('executions'),
  workflowId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  format: z.enum(['csv', 'json']).default('csv'),
});

export const automationAiSuggestSchema = z.object({
  type: z.enum(['journey', 'workflow', 'trigger', 'timing', 'audience', 'content']),
  journeyType: z.enum(automationJourneyTypes).optional(),
  context: z.record(z.unknown()).optional(),
  prompt: z.string().max(2000).optional(),
});

export const emitTriggerSchema = z.object({
  triggerType: z.enum(automationTriggerTypes),
  subjectType: z.string().min(1).max(64),
  subjectId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  context: z.record(z.unknown()).optional(),
});

export type ListWorkflowsQuery = z.infer<typeof listWorkflowsQuerySchema>;
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type ListExecutionsQuery = z.infer<typeof listExecutionsQuerySchema>;
export type ListTriggersQuery = z.infer<typeof listTriggersQuerySchema>;
export type CreateTriggerInput = z.infer<typeof createTriggerSchema>;
export type AutomationAnalyticsQuery = z.infer<typeof automationAnalyticsQuerySchema>;
export type ListAutomationLogsQuery = z.infer<typeof listAutomationLogsQuerySchema>;
export type AutomationExportQuery = z.infer<typeof automationExportQuerySchema>;
export type AutomationAiSuggestInput = z.infer<typeof automationAiSuggestSchema>;
export type EmitTriggerInput = z.infer<typeof emitTriggerSchema>;
