import type { Prisma } from '@kuberone/database';
import type { ListEmailLogsQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { emailAttachmentRepository, emailDeliveryRepository } from '../repositories/email.repository.js';
import { buildPaginationMeta } from '../utils/email.utils.js';

export const emailDeliveryService = {
  async list(query: ListEmailLogsQuery) {
    const where: Prisma.EmailDeliveryWhereInput = {
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.fromDate || query.toDate
        ? { createdAt: { ...(query.fromDate ? { gte: query.fromDate } : {}), ...(query.toDate ? { lte: query.toDate } : {}) } }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const sortField = query.sortBy === 'sentAt' ? 'sentAt' : 'createdAt';
    const orderBy = { [sortField]: query.sortOrder } as Prisma.EmailDeliveryOrderByWithRelationInput;
    const [items, total] = await Promise.all([
      emailDeliveryRepository.list(where, skip, query.limit, orderBy),
      emailDeliveryRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const items = await emailDeliveryRepository.list({ id }, 0, 1);
    const item = items[0];
    if (!item) throw new NotFoundError('EmailDelivery', id);
    const attachments = await emailAttachmentRepository.listByDelivery(item.id);
    return { ...item, attachments };
  },

  async getByEmailLogId(emailLogId: string) {
    const item = await emailDeliveryRepository.findByEmailLogId(emailLogId);
    if (!item) throw new NotFoundError('EmailDelivery', emailLogId);
    return item;
  },
};
