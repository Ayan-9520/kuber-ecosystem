import { createHash, randomUUID } from 'node:crypto';

import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import { governanceRepository } from '../repositories/governance.repository.js';

type AuditLogInput = {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  source?: string;
  userRole?: string;
  sessionId?: string;
  deviceFingerprint?: string;
  geoLocation?: string;
};

const ACTION_MAP: Record<string, string> = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  ASSIGN: 'ASSIGN',
  ESCALATE: 'ESCALATE',
  EXPORT: 'EXPORT',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FAILED_LOGIN: 'FAILED_LOGIN',
  PERMISSION_CHANGE: 'PERMISSION_CHANGE',
  ROLE_CHANGE: 'ROLE_CHANGE',
  CONFIG_CHANGE: 'CONFIG_CHANGE',
  VIEW: 'VIEW',
  DOWNLOAD: 'DOWNLOAD',
  PUBLISH: 'PUBLISH',
  ARCHIVE: 'ARCHIVE',
};

const ENTITY_SOURCE_MAP: Record<string, string> = {
  user: 'AUTH',
  role: 'RBAC',
  permission: 'RBAC',
  customer: 'CUSTOMERS',
  partner: 'PARTNERS',
  lead: 'LEADS',
  application: 'APPLICATIONS',
  document: 'DOCUMENTS',
  referral: 'REFERRALS',
  commission: 'COMMISSIONS',
  notification: 'NOTIFICATIONS',
  ticket: 'SUPPORT',
  ai_request: 'AI',
  analytics: 'ANALYTICS',
  campaign: 'CAMPAIGNS',
  automation: 'AUTOMATION',
  content_generation: 'CONTENT',
  article: 'KNOWLEDGE',
  rag: 'RAG',
  setting: 'SETTINGS',
  audit_log: 'SYSTEM',
};

function mapAction(action: string): string {
  const upper = action.toUpperCase();
  for (const [key, val] of Object.entries(ACTION_MAP)) {
    if (upper.includes(key)) return val;
  }
  if (upper.includes('AI')) return 'AI_ACTION';
  if (upper.includes('VOICE')) return 'VOICE_ACTION';
  return 'UPDATE';
}

function mapSource(entityType: string, explicit?: string): string {
  if (explicit) return explicit;
  const key = entityType.toLowerCase();
  return ENTITY_SOURCE_MAP[key] ?? 'SYSTEM';
}

function computeIntegrityHash(payload: Record<string, unknown>): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  return createHash('sha256').update(canonical).digest('hex');
}

export const centralAuditService = {
  async log(input: AuditLogInput) {
    const traceId = input.requestId ?? randomUUID();
    const source = mapSource(input.entityType, input.source);
    const action = mapAction(input.action) as never;

    const eventPayload = {
      traceId,
      source: source as never,
      action,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId,
      userRole: input.userRole,
      sessionId: input.sessionId,
      beforeValue: input.oldValues ?? undefined,
      afterValue: input.newValues ?? undefined,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      deviceFingerprint: input.deviceFingerprint,
      geoLocation: input.geoLocation,
      requestId: input.requestId,
      metadata: { legacyAction: input.action },
    };

    const integrityHash = computeIntegrityHash({
      ...eventPayload,
      createdAt: new Date().toISOString().slice(0, 19),
    });

    const auditLog = await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValues: input.oldValues,
        newValues: input.newValues,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        requestId: input.requestId,
      },
    });

    let auditEvent = null;
    try {
      auditEvent = await governanceRepository.auditEvent.create({
        ...eventPayload,
        integrityHash,
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[audit] governance dual-write skipped:', (err as Error).message);
      }
    }

    return { auditLog, auditEvent };
  },

  async logSecurityEvent(params: {
    eventType: string;
    severity?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    description: string;
    metadata?: Prisma.InputJsonValue;
    createAlert?: boolean;
  }) {
    try {
    const event = await governanceRepository.securityEvent.create({
      eventType: params.eventType as never,
      severity: (params.severity ?? 'MEDIUM') as never,
      user: params.userId ? { connect: { id: params.userId } } : undefined,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      description: params.description,
      metadata: params.metadata,
    });

    if (params.createAlert !== false && ['HIGH', 'CRITICAL'].includes(params.severity ?? '')) {
      await governanceRepository.securityAlert.create({
        event: { connect: { id: event.id } },
        title: params.eventType.replace(/_/g, ' '),
        description: params.description,
        severity: (params.severity ?? 'HIGH') as never,
        status: 'OPEN',
      });
    }

    return event;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[audit] security event skipped:', (err as Error).message);
      }
      return null;
    }
  },

  async logDataAccess(params: {
    accessType: string;
    userId: string;
    entityType: string;
    entityId?: string;
    fieldNames?: string[];
    recordCount?: number;
    ipAddress?: string;
    purpose?: string;
  }) {
    return governanceRepository.dataAccessLog.create({
      accessType: params.accessType as never,
      user: { connect: { id: params.userId } },
      entityType: params.entityType,
      entityId: params.entityId,
      fieldNames: params.fieldNames,
      recordCount: params.recordCount ?? 1,
      ipAddress: params.ipAddress,
      purpose: params.purpose,
    });
  },

  async logComplianceViolation(params: {
    ruleCode: string;
    description: string;
    severity: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    evidence?: Prisma.InputJsonValue;
  }) {
    const rule = await prisma.complianceRule.findUnique({ where: { code: params.ruleCode } });
    if (!rule) return null;

    return governanceRepository.complianceViolation.create({
      rule: { connect: { id: rule.id } },
      status: 'OPEN',
      severity: params.severity as never,
      entityType: params.entityType,
      entityId: params.entityId,
      user: params.userId ? { connect: { id: params.userId } } : undefined,
      description: params.description,
      evidence: params.evidence,
    });
  },
};
