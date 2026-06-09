import { env } from '../../../config/env.js';
import type { ExecutiveRoleType } from '../types/executive-analytics.types.js';

export const EXECUTIVE_CACHE_TTL_MS = env.ANALYTICS_CACHE_TTL_MS;

export const MANAGER_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGEMENT',
  'REGIONAL_MANAGER',
  'BRANCH_MANAGER',
] as const;

export const ROLE_TO_EXECUTIVE: Record<string, ExecutiveRoleType> = {
  SALES_EXECUTIVE: 'SALES_EXECUTIVE',
  RELATIONSHIP_MANAGER: 'RELATIONSHIP_MANAGER',
  CREDIT_EXECUTIVE: 'CREDIT_EXECUTIVE',
  CREDIT_ANALYST: 'CREDIT_EXECUTIVE',
  OPERATIONS_EXECUTIVE: 'OPERATIONS_EXECUTIVE',
  OPS_EXECUTIVE: 'OPERATIONS_EXECUTIVE',
};

export const SALES_KPI_CODES = [
  'leads_assigned',
  'leads_contacted',
  'followups_completed',
  'meetings_scheduled',
  'applications_created',
  'applications_submitted',
  'conversions',
  'conversion_rate',
  'revenue_generated',
  'commission_earned',
  'target_achievement_pct',
] as const;

export const RM_KPI_CODES = [
  'portfolio_size',
  'active_customers',
  'renewals',
  'cross_sell_revenue',
  'retention_rate',
  'customer_satisfaction',
  'repeat_business',
] as const;

export const CREDIT_KPI_CODES = [
  'applications_reviewed',
  'eligibility_checks',
  'approval_recommendations',
  'rejections',
  'credit_tat',
  'risk_cases',
  'approval_accuracy',
] as const;

export const OPS_KPI_CODES = [
  'applications_processed',
  'bank_logins',
  'document_verification',
  'sanctions',
  'disbursements',
  'operational_tat',
  'escalations',
  'resolution_time',
] as const;

export const PRODUCTIVITY_CODES = [
  'daily_activity',
  'weekly_activity',
  'working_hours',
  'task_completion',
  'response_time',
  'pending_workload',
] as const;
