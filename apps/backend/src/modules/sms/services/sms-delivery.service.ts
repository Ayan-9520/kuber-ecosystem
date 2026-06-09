import type { Prisma } from '@kuberone/database';
import type { ListSmsLogsQuery } from '@kuberone/shared-validation';

import { NotFoundError } from '../../../shared/errors/app-error.js';
import { smsDeliveryRepository } from '../repositories/sms.repository.js';
import { buildPaginationMeta } from '../utils/sms.utils.js';

export const smsDeliveryService = {
  async list(query: ListSmsLogsQuery) {
    const where: Prisma.SmsDeliveryWhereInput = {
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.isOtp !== undefined ? { isOtp: query.isOtp } : {}),
      ...(query.fromDate || query.toDate
        ? { createdAt: { ...(query.fromDate ? { gte: query.fromDate } : {}), ...(query.toDate ? { lte: query.toDate } : {}) } }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const sortField = query.sortBy === 'sentAt' ? 'sentAt' : 'createdAt';
    const orderBy = { [sortField]: query.sortOrder } as Prisma.SmsDeliveryOrderByWithRelationInput;
    const [items, total] = await Promise.all([
      smsDeliveryRepository.list(where, skip, query.limit, orderBy),
      smsDeliveryRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const items = await smsDeliveryRepository.list({ id }, 0, 1);
    const item = items[0];
    if (!item) throw new NotFoundError('SmsDelivery', id);
    return item;
  },
};
