import type { Prisma } from '@kuberone/database';
import type {
  CreateDocumentRequestInput,
  ListDocumentRequestsQuery,
  UpdateDocumentRequestInput,
} from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { documentRequestRepository } from '../repositories/document-request.repository.js';
import { documentTypeRepository } from '../repositories/document-type.repository.js';
import type { RequestContext } from '../types/documents.types.js';
import { auditDocumentMutation, buildPaginationMeta } from '../utils/documents.utils.js';

export const documentRequestService = {
  async list(query: ListDocumentRequestsQuery) {
    const where: Prisma.DocumentRequestWhereInput = {
      ...(query.applicationId ? { applicationId: query.applicationId } : {}),
      ...(query.leadId ? { leadId: query.leadId } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.status ? { status: query.status as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      documentRequestRepository.list(where, skip, query.limit, orderBy),
      documentRequestRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await documentRequestRepository.findById(id);
    if (!item) throw new NotFoundError('DocumentRequest', id);
    return item;
  },

  async create(input: CreateDocumentRequestInput, ctx: RequestContext) {
    const docType = await documentTypeRepository.findById(input.documentTypeId);
    if (!docType) throw new NotFoundError('DocumentType', input.documentTypeId);

    const item = await documentRequestRepository.create({
      applicationId: input.applicationId,
      leadId: input.leadId,
      customerId: input.customerId,
      documentTypeId: input.documentTypeId,
      requestedById: ctx.actorId,
      dueDate: input.dueDate,
      notes: input.notes,
      status: 'PENDING',
    });

    await auditDocumentMutation(authAuditRepository.log, ctx, 'DOCUMENT_REQUEST_CREATED', 'document_request', item.id, input);
    return item;
  },

  async update(id: string, input: UpdateDocumentRequestInput, ctx: RequestContext) {
    await documentRequestService.getById(id);
    const item = await documentRequestRepository.update(id, {
      ...input,
      status: input.status as never,
      fulfilledAt: input.status === 'FULFILLED' ? new Date() : undefined,
    });
    await auditDocumentMutation(authAuditRepository.log, ctx, 'DOCUMENT_REQUEST_UPDATED', 'document_request', id, input);
    return item;
  },
};
