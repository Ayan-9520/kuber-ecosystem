import type { Prisma } from '@kuberone/database';
import type { ListVerificationResultsQuery, VerifyDocumentInput } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { documentRepository } from '../repositories/document.repository.js';
import { ocrResultRepository } from '../repositories/ocr-result.repository.js';
import { verificationResultRepository } from '../repositories/verification-result.repository.js';
import type { RequestContext } from '../types/documents.types.js';
import { auditDocumentMutation, buildPaginationMeta } from '../utils/documents.utils.js';

import { verificationEngineService } from './verification-engine.service.js';

export const verificationResultService = {
  async list(query: ListVerificationResultsQuery) {
    const where: Prisma.VerificationResultWhereInput = {
      ...(query.documentId ? { documentId: query.documentId } : {}),
      ...(query.result ? { result: query.result as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      verificationResultRepository.list(where, skip, query.limit, orderBy),
      verificationResultRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const result = await verificationResultRepository.findById(id);
    if (!result) throw new NotFoundError('VerificationResult', id);
    return result;
  },

  async verify(documentId: string, input: VerifyDocumentInput, ctx: RequestContext) {
    const document = await documentRepository.findById(documentId);
    if (!document) throw new NotFoundError('Document', documentId);

    const output = verificationEngineService.manualVerify({
      result: input.result,
      notes: input.notes,
      rejectionReason: input.rejectionReason,
    });

    return verificationResultService.persist(documentId, output, ctx, input.mode ?? 'MANUAL');
  },

  async autoVerify(documentId: string, ctx: RequestContext) {
    const document = await documentRepository.findById(documentId);
    if (!document) throw new NotFoundError('Document', documentId);

    const ocr = await ocrResultRepository.findLatestByDocumentId(documentId);
    const output = await verificationEngineService.autoVerify(
      documentId,
      {
        confidenceScore: ocr ? Number(ocr.confidenceScore) : 0,
        extractedFields: (ocr?.extractedFields as Record<string, unknown>) ?? {},
        panNumber: undefined,
        aadhaarNumber: undefined,
      },
      document.customerId,
    );

    return verificationResultService.persist(documentId, output, ctx, 'AUTO');
  },

  async persist(
    documentId: string,
    output: {
      result: 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
      mode: 'AUTO' | 'MANUAL';
      riskFlags: string[];
      mismatches: string[];
      notes?: string;
    },
    ctx: RequestContext,
    mode: 'AUTO' | 'MANUAL',
  ) {
    const now = new Date();
    const record = await verificationResultRepository.create({
      documentId,
      verifiedById: mode === 'MANUAL' ? ctx.actorId : undefined,
      mode: output.mode as never,
      result: output.result as never,
      rejectionReason: output.result === 'REJECTED' ? output.notes : undefined,
      notes: output.notes,
      riskFlags: output.riskFlags as Prisma.InputJsonValue,
      mismatches: output.mismatches as Prisma.InputJsonValue,
      verifiedAt: now,
    });

    let status: 'VERIFIED' | 'REJECTED' | 'DEFICIENT' | 'PENDING_VERIFICATION' = 'PENDING_VERIFICATION';
    if (output.result === 'APPROVED') status = 'VERIFIED';
    if (output.result === 'REJECTED') status = 'REJECTED';
    if (output.result === 'NEEDS_REVIEW') status = 'DEFICIENT';

    await documentRepository.update(documentId, {
      status,
      verifiedById: ctx.actorId,
      verifiedAt: now,
    });

    await auditDocumentMutation(authAuditRepository.log, ctx, 'DOCUMENT_VERIFIED', 'verification_result', record.id, {
      result: output.result,
      mode: output.mode,
    });

    return record;
  },
};
