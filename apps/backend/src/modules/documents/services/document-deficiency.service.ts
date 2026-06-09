import type { Prisma } from '@kuberone/database';
import type {
  CreateDocumentDeficiencyInput,
  ListDocumentDeficienciesQuery,
  ScanDeficienciesInput,
  UpdateDocumentDeficiencyInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { documentDeficiencyRepository } from '../repositories/document-deficiency.repository.js';
import type { RequestContext } from '../types/documents.types.js';
import { auditDocumentMutation, buildPaginationMeta } from '../utils/documents.utils.js';

import { deficiencyEngineService } from './deficiency-engine.service.js';

export const documentDeficiencyService = {
  async list(query: ListDocumentDeficienciesQuery) {
    const where: Prisma.DocumentDeficiencyWhereInput = {
      ...(query.applicationId ? { applicationId: query.applicationId } : {}),
      ...(query.leadId ? { leadId: query.leadId } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.deficiencyType ? { deficiencyType: query.deficiencyType as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      documentDeficiencyRepository.list(where, skip, query.limit, orderBy),
      documentDeficiencyRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await documentDeficiencyRepository.findById(id);
    if (!item) throw new NotFoundError('DocumentDeficiency', id);
    return item;
  },

  async create(input: CreateDocumentDeficiencyInput, ctx: RequestContext) {
    const item = await documentDeficiencyRepository.create({
      ...input,
      deficiencyType: input.deficiencyType as never,
      raisedById: ctx.actorId,
    });

    await auditDocumentMutation(
      authAuditRepository.log,
      ctx,
      'DOCUMENT_DEFICIENCY_CREATED',
      'document_deficiency',
      item.id,
      input,
    );
    return item;
  },

  async update(id: string, input: UpdateDocumentDeficiencyInput, ctx: RequestContext) {
    await documentDeficiencyService.getById(id);
    const item = await documentDeficiencyRepository.update(id, {
      ...input,
      status: input.status as never,
      resolvedAt: input.status === 'RESOLVED' ? new Date() : undefined,
    });
    await auditDocumentMutation(
      authAuditRepository.log,
      ctx,
      'DOCUMENT_DEFICIENCY_UPDATED',
      'document_deficiency',
      id,
      input,
    );
    return item;
  },

  async scan(input: ScanDeficienciesInput, ctx: RequestContext) {
    const findings = await deficiencyEngineService.scan(input);
    const created = [];

    for (const finding of findings) {
      const existing = await documentDeficiencyRepository.list(
        {
          applicationId: input.applicationId,
          customerId: input.customerId,
          deficiencyType: finding.deficiencyType as never,
          status: 'OPEN',
          ...(finding.documentId ? { documentId: finding.documentId } : {}),
        },
        0,
        1,
        { createdAt: 'desc' },
      );

      if (existing.length > 0) continue;

      const record = await documentDeficiencyRepository.create({
        applicationId: input.applicationId,
        customerId: input.customerId,
        documentId: finding.documentId,
        documentRequestId: finding.documentRequestId,
        deficiencyType: finding.deficiencyType as never,
        description: finding.description,
        raisedById: ctx.actorId,
      });
      created.push(record);
    }

    await auditDocumentMutation(authAuditRepository.log, ctx, 'DOCUMENT_DEFICIENCY_SCAN', 'document_deficiency', 'scan', {
      findings: findings.length,
      created: created.length,
    });

    return { findings, created };
  },
};
