import type { ListDocumentVersionsQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { documentVersionRepository } from '../repositories/document-version.repository.js';
import { documentRepository } from '../repositories/document.repository.js';
import { buildPaginationMeta } from '../utils/documents.utils.js';

export const documentVersionService = {
  async list(query: ListDocumentVersionsQuery) {
    const document = await documentRepository.findById(query.documentId);
    if (!document) throw new NotFoundError('Document', query.documentId);

    const where = { documentId: query.documentId };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      documentVersionRepository.list(where, skip, query.limit, orderBy),
      documentVersionRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await documentVersionRepository.findById(id);
    if (!item) throw new NotFoundError('DocumentVersion', id);
    return item;
  },
};
