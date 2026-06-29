import { createHash, randomBytes } from 'crypto';

import type { Prisma } from '@kuberone/database';
import type { PaginatedMeta } from '@kuberone/shared-types';

import { AppError } from '../../../shared/errors/app-error.js';
import type { RequestContext } from '../types/documents.types.js';

export function buildPaginationMeta(page: number, limit: number, total: number): PaginatedMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function auditDocumentMutation(
  log: (data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: Prisma.InputJsonValue;
    newValues?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }) => Promise<unknown>,
  ctx: RequestContext,
  action: string,
  entityType: string,
  entityId: string,
  newValues?: unknown,
  oldValues?: unknown,
): Promise<void> {
  await log({
    userId: ctx.actorId,
    action,
    entityType,
    entityId,
    newValues: newValues as Prisma.InputJsonValue,
    oldValues: oldValues as Prisma.InputJsonValue,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    requestId: ctx.requestId,
  });
}

let docSequence = 0;

export function generateDocumentCode(lastCode?: string | null): string {
  if (lastCode) {
    const match = lastCode.match(/KFD-(\d+)/);
    if (match) {
      return `KFD-${String(parseInt(match[1]!, 10) + 1).padStart(6, '0')}`;
    }
  }
  docSequence += 1;
  return `KFD-${String(Date.now()).slice(-6)}${String(docSequence).padStart(2, '0')}`;
}

export function sha256Checksum(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

type DocumentWithType = {
  documentType?: { name?: string | null; code?: string | null } | null;
  customer?: { customerCode?: string | null; fullName?: string | null } | null;
  uploadedBy?: { email?: string | null; fullName?: string | null } | null;
  documentCode?: string | null;
  [key: string]: unknown;
};

/** Flatten nested relations for API consumers (admin + mobile). */
export function serializeDocument<T extends DocumentWithType>(doc: T) {
  const type = doc.documentType;
  const customer = doc.customer;
  const uploadedBy = doc.uploadedBy;
  const typeLabel =
    type?.name?.trim() ||
    (type?.code ? type.code.trim().replace(/_/g, ' ') : null);
  return {
    ...doc,
    documentNumber: doc.documentCode ?? null,
    documentTypeName: type?.name ?? null,
    documentTypeCode: type?.code ?? null,
    typeName: type?.name ?? null,
    type: typeLabel ?? (typeof doc.type === 'string' ? doc.type : null),
    customerName: customer?.fullName ?? null,
    customerCode: customer?.customerCode ?? null,
    uploadedByName: uploadedBy?.fullName ?? uploadedBy?.email ?? null,
  };
}

export function buildS3Key(
  ownerType: string,
  ownerId: string,
  documentTypeCode: string,
  fileName: string,
): string {
  const date = new Date().toISOString().slice(0, 10);
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const nonce = randomBytes(4).toString('hex');
  return `documents/${ownerType.toLowerCase()}/${ownerId}/${documentTypeCode}/${date}/${nonce}-${safeName}`;
}

export function decodeBase64Content(contentBase64: string): Buffer {
  const base64 = contentBase64.includes(',') ? contentBase64.split(',')[1]! : contentBase64;
  return Buffer.from(base64, 'base64');
}

const MIME_ALIASES: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/x-png': 'image/png',
};

export function normalizeDocumentMimeType(mimeType: string): string {
  const trimmed = mimeType.trim().toLowerCase();
  return MIME_ALIASES[trimmed] ?? trimmed;
}

export function resolveOwnerId(input: {
  ownerType: string;
  customerId?: string;
  leadId?: string;
  applicationId?: string;
  partnerId?: string;
  employeeId?: string;
}): string {
  const map: Record<string, string | undefined> = {
    CUSTOMER: input.customerId,
    LEAD: input.leadId,
    APPLICATION: input.applicationId,
    PARTNER: input.partnerId,
    EMPLOYEE: input.employeeId,
  };
  const id = map[input.ownerType];
  if (!id) throw new AppError(400, 'OWNER_ID_REQUIRED', `Owner id required for ${input.ownerType}`);
  return id;
}

const SENSITIVE_DOC_FIELDS = ['internalNotes', 'verificationRaw', 'ocrRawPayload'] as const;

export function sanitizeDocumentResponse<T extends Record<string, unknown>>(doc: T): T {
  const sanitized = { ...doc };
  for (const field of SENSITIVE_DOC_FIELDS) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }
  return sanitized;
}

