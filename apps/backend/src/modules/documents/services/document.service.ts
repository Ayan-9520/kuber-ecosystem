import type { Prisma } from '@kuberone/database';
import type { AuthenticatedUser } from '@kuberone/shared-types';
import type {
  ConfirmUploadInput,
  ListDocumentsQuery,
  PresignUploadInput,
  ReplaceDocumentInput,
  UploadDocumentInput,
  VerifyDocumentInput,
} from '@kuberone/shared-validation';

import { AppError, NotFoundError } from '../../../shared/errors/app-error.js';
import { appLogger } from '../../../shared/observability/logger.js';
import { applyDocumentScope, assertDocumentAccess } from '../../../shared/utils/data-scope.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { documentTypeRepository } from '../repositories/document-type.repository.js';
import { documentVersionRepository } from '../repositories/document-version.repository.js';
import { documentRepository } from '../repositories/document.repository.js';
import { presignedUploadRepository } from '../repositories/presigned-upload.repository.js';
import type { RequestContext } from '../types/documents.types.js';
import {
  auditDocumentMutation,
  buildPaginationMeta,
  buildS3Key,
  decodeBase64Content,
  generateDocumentCode,
  normalizeDocumentMimeType,
  resolveOwnerId,
  serializeDocument,
  sha256Checksum,
} from '../utils/documents.utils.js';
import { shouldUseLocalDocumentStorage } from '../utils/document-storage.util.js';

import { ocrResultService } from './ocr-result.service.js';
import { s3StorageService } from './s3-storage.service.js';
import { verificationResultService } from './verification-result.service.js';

function buildListWhere(query: ListDocumentsQuery): Prisma.DocumentWhereInput {
  return {
    ...(query.includeDeleted ? {} : { deletedAt: null }),
    ...(query.status ? { status: query.status as never } : {}),
    ...(query.documentTypeId ? { documentTypeId: query.documentTypeId } : {}),
    ...(query.ownerType ? { ownerType: query.ownerType as never } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.leadId ? { leadId: query.leadId } : {}),
    ...(query.applicationId ? { applicationId: query.applicationId } : {}),
    ...(query.partnerId ? { partnerId: query.partnerId } : {}),
    ...(query.employeeId ? { employeeId: query.employeeId } : {}),
    ...(query.search
      ? {
          OR: [
            { documentCode: { contains: query.search } },
            { fileName: { contains: query.search } },
          ],
        }
      : {}),
  };
}

function ownerFields(input: {
  ownerType: string;
  customerId?: string;
  leadId?: string;
  applicationId?: string;
  partnerId?: string;
  employeeId?: string;
}) {
  return {
    ownerType: input.ownerType as never,
    customerId: input.customerId,
    leadId: input.leadId,
    applicationId: input.applicationId,
    partnerId: input.partnerId,
    employeeId: input.employeeId,
  };
}

async function validateDocumentType(documentTypeId: string, mimeType: string, fileSizeBytes: number) {
  const docType = await documentTypeRepository.findById(documentTypeId);
  if (!docType || !docType.isActive) throw new NotFoundError('DocumentType', documentTypeId);

  const normalizedMime = normalizeDocumentMimeType(mimeType);
  const allowed = (docType.allowedMimeTypes as string[]).map((m) => normalizeDocumentMimeType(m));
  if (!allowed.includes(normalizedMime)) {
    throw new AppError(400, 'INVALID_MIME_TYPE', `Mime type ${mimeType} not allowed for ${docType.name}`);
  }

  if (fileSizeBytes > docType.maxSizeMb * 1024 * 1024) {
    throw new AppError(400, 'FILE_TOO_LARGE', `File exceeds ${docType.maxSizeMb}MB limit`);
  }

  return docType;
}

export const documentService = {
  async list(actor: AuthenticatedUser, query: ListDocumentsQuery) {
    const where = applyDocumentScope(actor, buildListWhere(query));
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      documentRepository.list(where, skip, query.limit, orderBy),
      documentRepository.count(where),
    ]);

    return {
      items: items.map((doc) => serializeDocument(doc)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getById(actor: AuthenticatedUser, id: string) {
    const doc = await documentRepository.findById(id);
    if (!doc) throw new NotFoundError('Document', id);
    assertDocumentAccess(actor, doc);
    return serializeDocument(doc);
  },

  async upload(input: UploadDocumentInput, ctx: RequestContext) {
    const buffer = decodeBase64Content(input.contentBase64);
    const mimeType = normalizeDocumentMimeType(input.mimeType);
    const docType = await validateDocumentType(input.documentTypeId, mimeType, buffer.length);
    const ownerId = resolveOwnerId(input);
    const s3Key = buildS3Key(input.ownerType, ownerId, docType.code, input.fileName);
    const checksum = sha256Checksum(buffer);

    try {
      await s3StorageService.uploadObject(s3Key, buffer, mimeType, {
        documentType: docType.code,
        ownerType: input.ownerType,
        ownerId,
      });
    } catch (err) {
      appLogger.error('Document storage upload failed', err instanceof Error ? err : undefined, {
        module: 'documents',
        action: 'upload',
        metadata: { localFallback: shouldUseLocalDocumentStorage() },
      });
      throw new AppError(
        503,
        'STORAGE_UNAVAILABLE',
        shouldUseLocalDocumentStorage()
          ? 'Local document storage failed. Check disk permissions for storage/documents.'
          : 'Document storage is not available. Configure AWS S3 bucket and credentials.',
      );
    }

    const lastCode = await documentRepository.getLastDocumentCode();
    const document = await documentRepository.create({
      documentCode: generateDocumentCode(lastCode?.documentCode),
      ...ownerFields(input),
      documentTypeId: input.documentTypeId,
      s3Key,
      fileName: input.fileName,
      mimeType,
      fileSizeBytes: BigInt(buffer.length),
      checksum,
      currentVersion: 1,
      status: 'UPLOADED',
      expiresAt: input.expiresAt,
      metadata: input.metadata as Prisma.InputJsonValue,
      uploadedById: ctx.actorId,
    });

    const version = await documentVersionRepository.create({
      documentId: document.id,
      versionNumber: 1,
      s3Key,
      fileName: input.fileName,
      mimeType,
      fileSizeBytes: BigInt(buffer.length),
      checksum,
      uploadReason: 'INITIAL',
      uploadedById: ctx.actorId,
    });

    if (input.runOcr) {
      try {
        await ocrResultService.run(
          { documentId: document.id, documentVersionId: version.id, provider: 'INTERNAL' },
          ctx,
          buffer,
          docType.code,
        );
        await documentRepository.update(document.id, { status: 'PENDING_VERIFICATION' });
      } catch (err) {
        appLogger.warn('OCR skipped after document upload', {
          module: 'documents',
          action: 'upload.ocr',
          metadata: {
            documentId: document.id,
            message: err instanceof Error ? err.message : String(err),
          },
        });
      }
    }

    if (input.autoVerify) {
      await verificationResultService.autoVerify(document.id, ctx);
    }

    await auditDocumentMutation(authAuditRepository.log, ctx, 'DOCUMENT_UPLOADED', 'document', document.id, {
      documentCode: document.documentCode,
    });

    return documentRepository.findById(document.id);
  },

  async presignUpload(input: PresignUploadInput, ctx: RequestContext) {
    const docType = await validateDocumentType(input.documentTypeId, input.mimeType, input.fileSizeBytes);
    const ownerId = resolveOwnerId(input);
    const s3Key = buildS3Key(input.ownerType, ownerId, docType.code, input.fileName);
    const presigned = await s3StorageService.getPresignedUploadUrl(s3Key, input.mimeType);

    const intent = await presignedUploadRepository.create({
      requestedById: ctx.actorId,
      s3Key,
      documentTypeId: input.documentTypeId,
      ownerType: input.ownerType,
      customerId: input.customerId,
      leadId: input.leadId,
      applicationId: input.applicationId,
      partnerId: input.partnerId,
      employeeId: input.employeeId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
    });

    await auditDocumentMutation(authAuditRepository.log, ctx, 'DOCUMENT_PRESIGN_UPLOAD', 'document', s3Key, {
      ownerType: input.ownerType,
      ownerId,
      uploadToken: intent.uploadToken,
    });

    return { ...presigned, uploadToken: intent.uploadToken, s3Key };
  },

  async confirmUpload(input: ConfirmUploadInput, ctx: RequestContext) {
    const intent = await presignedUploadRepository.findValidByToken(input.uploadToken, ctx.actorId);
    if (!intent) {
      throw new AppError(400, 'INVALID_UPLOAD_TOKEN', 'Upload token expired or invalid');
    }
    if (intent.s3Key !== input.s3Key) {
      throw new AppError(400, 'S3_KEY_MISMATCH', 'S3 key does not match presigned upload');
    }
    if (intent.documentTypeId !== input.documentTypeId) {
      throw new AppError(400, 'DOCUMENT_TYPE_MISMATCH', 'Document type does not match presigned upload');
    }

    const metadata = await s3StorageService.getObjectMetadata(input.s3Key);
    if (!metadata.exists) throw new AppError(400, 'S3_OBJECT_MISSING', 'Uploaded file not found in storage');

    if (metadata.contentType && metadata.contentType !== input.mimeType) {
      throw new AppError(400, 'MIME_MISMATCH', 'Uploaded file content type does not match declared type');
    }

    if (metadata.contentLength !== undefined && metadata.contentLength > input.fileSizeBytes * 1.05) {
      throw new AppError(400, 'FILE_SIZE_MISMATCH', 'Uploaded file exceeds declared size');
    }

    const docType = await validateDocumentType(input.documentTypeId, input.mimeType, input.fileSizeBytes);
    const lastCode = await documentRepository.getLastDocumentCode();

    const document = await documentRepository.create({
      documentCode: generateDocumentCode(lastCode?.documentCode),
      ...ownerFields(input),
      documentTypeId: input.documentTypeId,
      s3Key: input.s3Key,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSizeBytes: BigInt(input.fileSizeBytes),
      checksum: input.checksum,
      currentVersion: 1,
      status: 'UPLOADED',
      expiresAt: input.expiresAt,
      metadata: input.metadata as Prisma.InputJsonValue,
      uploadedById: ctx.actorId,
    });

    const version = await documentVersionRepository.create({
      documentId: document.id,
      versionNumber: 1,
      s3Key: input.s3Key,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSizeBytes: BigInt(input.fileSizeBytes),
      checksum: input.checksum,
      uploadReason: 'INITIAL',
      uploadedById: ctx.actorId,
    });

    if (input.runOcr) {
      await ocrResultService.run(
        { documentId: document.id, documentVersionId: version.id, provider: 'INTERNAL' },
        ctx,
        undefined,
        docType.code,
      );
      await documentRepository.update(document.id, { status: 'PENDING_VERIFICATION' });
    }

    await presignedUploadRepository.markConsumed(intent.id);

    return documentRepository.findById(document.id);
  },

  async replace(actor: AuthenticatedUser, id: string, input: ReplaceDocumentInput, ctx: RequestContext) {
    const existing = await documentService.getById(actor, id);
    const buffer = decodeBase64Content(input.contentBase64);
    const docType = await documentTypeRepository.findById(existing.documentTypeId);
    if (!docType) throw new NotFoundError('DocumentType', existing.documentTypeId);

    await validateDocumentType(existing.documentTypeId, input.mimeType, buffer.length);

    const ownerId = resolveOwnerId({
      ownerType: existing.ownerType,
      customerId: existing.customerId ?? undefined,
      leadId: existing.leadId ?? undefined,
      applicationId: existing.applicationId ?? undefined,
      partnerId: existing.partnerId ?? undefined,
      employeeId: existing.employeeId ?? undefined,
    });

    const latest = await documentVersionRepository.getLatestVersionNumber(id);
    const nextVersion = (latest?.versionNumber ?? existing.currentVersion) + 1;
    const s3Key = buildS3Key(existing.ownerType, ownerId, docType.code, input.fileName);
    const checksum = sha256Checksum(buffer);

    await s3StorageService.uploadObject(s3Key, buffer, input.mimeType);

    await documentVersionRepository.create({
      documentId: id,
      versionNumber: nextVersion,
      s3Key,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSizeBytes: BigInt(buffer.length),
      checksum,
      uploadReason: input.uploadReason as never,
      uploadedById: ctx.actorId,
    });

    await documentRepository.update(id, {
      s3Key,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSizeBytes: BigInt(buffer.length),
      checksum,
      currentVersion: nextVersion,
      status: 'UPLOADED',
    });

    if (input.runOcr) {
      await ocrResultService.run({ documentId: id, provider: 'INTERNAL' }, ctx, buffer, docType.code);
      await documentRepository.update(id, { status: 'PENDING_VERIFICATION' });
    }

    await auditDocumentMutation(authAuditRepository.log, ctx, 'DOCUMENT_REPLACED', 'document', id, { version: nextVersion });
    return documentRepository.findById(id);
  },

  async remove(actor: AuthenticatedUser, id: string, ctx: RequestContext) {
    const doc = await documentService.getById(actor, id);
    await documentRepository.softDelete(id, ctx.actorId);
    await auditDocumentMutation(authAuditRepository.log, ctx, 'DOCUMENT_DELETED', 'document', id);
    return { id: doc.id, deleted: true };
  },

  async getDownloadUrl(actor: AuthenticatedUser, id: string, ctx: RequestContext) {
    const doc = await documentService.getById(actor, id);
    const result = await s3StorageService.getPresignedDownloadUrl(doc.s3Key, doc.fileName);
    await auditDocumentMutation(authAuditRepository.log, ctx, 'DOCUMENT_DOWNLOAD_URL', 'document', id);
    return result;
  },

  async streamLocalDownload(actor: AuthenticatedUser, storageKey: string) {
    if (!shouldUseLocalDocumentStorage()) {
      throw new AppError(404, 'NOT_FOUND', 'Local document download is only available in development');
    }

    const doc = await documentRepository.findByS3Key(storageKey);
    if (!doc) throw new NotFoundError('Document', storageKey);
    assertDocumentAccess(actor, doc);

    const buffer = await s3StorageService.readObject(storageKey);
    return { buffer, fileName: doc.fileName, mimeType: doc.mimeType };
  },

  async verify(actor: AuthenticatedUser, id: string, input: VerifyDocumentInput, ctx: RequestContext) {
    await documentService.getById(actor, id);
    return verificationResultService.verify(id, input, ctx);
  },

  async approve(actor: AuthenticatedUser, id: string, ctx: RequestContext) {
    return documentService.verify(actor, id, { result: 'APPROVED', mode: 'MANUAL' }, ctx);
  },

  async reject(actor: AuthenticatedUser, id: string, reason: string, ctx: RequestContext) {
    return documentService.verify(actor, id, { result: 'REJECTED', mode: 'MANUAL', rejectionReason: reason }, ctx);
  },
};
