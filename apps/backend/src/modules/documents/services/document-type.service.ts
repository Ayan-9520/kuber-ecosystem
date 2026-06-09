import type {
  CreateDocumentTypeInput,
  ListDocumentTypesQuery,
  UpdateDocumentTypeInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { documentTypeRepository } from '../repositories/document-type.repository.js';
import type { RequestContext } from '../types/documents.types.js';
import { auditDocumentMutation, buildPaginationMeta } from '../utils/documents.utils.js';

export const documentTypeService = {
  async list(query: ListDocumentTypesQuery) {
    const where = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.category ? { category: query.category as never } : {}),
      ...(query.search
        ? { OR: [{ name: { contains: query.search } }, { code: { contains: query.search } }] }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      documentTypeRepository.list(where, skip, query.limit, orderBy),
      documentTypeRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await documentTypeRepository.findById(id);
    if (!item) throw new NotFoundError('DocumentType', id);
    return item;
  },

  async create(input: CreateDocumentTypeInput, ctx: RequestContext) {
    const existing = await documentTypeRepository.findByCode(input.code);
    if (existing) throw new ConflictError('Document type code already exists');

    const item = await documentTypeRepository.create({
      ...input,
      category: input.category as never,
      allowedMimeTypes: input.allowedMimeTypes,
    });

    await auditDocumentMutation(authAuditRepository.log, ctx, 'DOCUMENT_TYPE_CREATED', 'document_type', item.id, input);
    return item;
  },

  async update(id: string, input: UpdateDocumentTypeInput, ctx: RequestContext) {
    await documentTypeService.getById(id);
    const item = await documentTypeRepository.update(id, {
      ...input,
      category: input.category as never,
    });
    await auditDocumentMutation(authAuditRepository.log, ctx, 'DOCUMENT_TYPE_UPDATED', 'document_type', id, input);
    return item;
  },

  async deactivate(id: string, ctx: RequestContext) {
    await documentTypeService.getById(id);
    const item = await documentTypeRepository.update(id, { isActive: false });
    await auditDocumentMutation(authAuditRepository.log, ctx, 'DOCUMENT_TYPE_DEACTIVATED', 'document_type', id);
    return item;
  },
};
