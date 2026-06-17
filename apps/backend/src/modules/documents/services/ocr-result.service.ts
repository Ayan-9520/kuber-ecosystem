import type { Prisma } from '@kuberone/database';
import type { ListOcrResultsQuery, RunOcrInput } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { encryptField, maskAadhaar, maskPan } from '../../../shared/utils/field-encryption.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { documentRepository } from '../repositories/document.repository.js';
import { ocrResultRepository } from '../repositories/ocr-result.repository.js';
import type { RequestContext } from '../types/documents.types.js';
import { auditDocumentMutation, buildPaginationMeta } from '../utils/documents.utils.js';

import { ocrEngineService } from './ocr-engine.service.js';

export const ocrResultService = {
  async list(query: ListOcrResultsQuery) {
    const where: Prisma.OcrResultWhereInput = {
      ...(query.documentId ? { documentId: query.documentId } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      ocrResultRepository.list(where, skip, query.limit, orderBy),
      ocrResultRepository.count(where),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        panNumber: undefined,
        aadhaarNumber: undefined,
        panNumberEnc: undefined,
        aadhaarNumberEnc: undefined,
        panNumberMasked: item.panNumberMasked,
        aadhaarNumberMasked: item.aadhaarNumberMasked,
      })),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },

  async getById(id: string) {
    const result = await ocrResultRepository.findById(id);
    if (!result) throw new NotFoundError('OcrResult', id);
    return {
      ...result,
      panNumberEnc: undefined,
      aadhaarNumberEnc: undefined,
    };
  },

  async run(input: RunOcrInput, ctx: RequestContext, buffer?: Buffer, documentTypeCode?: string) {
    const document = await documentRepository.findById(input.documentId);
    if (!document) throw new NotFoundError('Document', input.documentId);

    const code = documentTypeCode ?? document.documentType.code;
    const extraction = buffer
      ? await ocrEngineService.extractFromBuffer(code, buffer)
      : ocrEngineService.process(code, '');

    const now = new Date();
    const record = await ocrResultRepository.create({
      documentId: input.documentId,
      documentVersionId: input.documentVersionId,
      extractedName: extraction.extractedName,
      panNumberEnc: extraction.panNumber ? encryptField(extraction.panNumber) : undefined,
      panNumberMasked: extraction.panNumber ? maskPan(extraction.panNumber) : undefined,
      aadhaarNumberEnc: extraction.aadhaarNumber ? encryptField(extraction.aadhaarNumber) : undefined,
      aadhaarNumberMasked: extraction.aadhaarNumber ? maskAadhaar(extraction.aadhaarNumber) : undefined,
      dateOfBirth: extraction.dateOfBirth,
      address: extraction.address,
      gstNumber: extraction.gstNumber,
      vehicleNumber: extraction.vehicleNumber,
      propertyDetails: extraction.propertyDetails as Prisma.InputJsonValue,
      extractedFields: extraction.extractedFields as Prisma.InputJsonValue,
      confidenceScore: extraction.confidenceScore,
      provider: (input.provider ?? 'INTERNAL') as never,
      processedAt: now,
    });

    await auditDocumentMutation(authAuditRepository.log, ctx, 'OCR_PROCESSED', 'ocr_result', record.id, {
      documentId: input.documentId,
      confidence: extraction.confidenceScore,
    });

    return record;
  },
};
