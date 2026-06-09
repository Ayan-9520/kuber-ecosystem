import type {
  CreateReferralTypeInput,
  ListReferralTypesQuery,
  UpdateReferralTypeInput,
} from '@kuberone/shared-validation';

import { ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { referralTypeRepository } from '../repositories/referral.repository.js';
import type { RequestContext } from '../types/referrals.types.js';
import { auditReferralMutation, buildPaginationMeta } from '../utils/referrals.utils.js';

export const referralTypeService = {
  async list(query: ListReferralTypesQuery) {
    const where = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search ? { name: { contains: query.search } } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      referralTypeRepository.list(where, skip, query.limit, orderBy),
      referralTypeRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await referralTypeRepository.findById(id);
    if (!item) throw new NotFoundError('ReferralType', id);
    return item;
  },

  async getByCode(code: string) {
    const item = await referralTypeRepository.findByCode(code);
    if (!item) throw new NotFoundError('ReferralType', code);
    return item;
  },

  async create(input: CreateReferralTypeInput, ctx: RequestContext) {
    const existing = await referralTypeRepository.findByCode(input.code);
    if (existing) throw new ConflictError('Referral type code already exists');

    const item = await referralTypeRepository.create({
      code: input.code as never,
      name: input.name,
      description: input.description,
      defaultRewardPct: input.defaultRewardPct,
      displayOrder: input.displayOrder,
    });

    await auditReferralMutation(authAuditRepository.log, ctx, 'REFERRAL_TYPE_CREATED', item.id, input);
    return item;
  },

  async update(id: string, input: UpdateReferralTypeInput, ctx: RequestContext) {
    await referralTypeService.getById(id);
    const item = await referralTypeRepository.update(id, {
      ...input,
      code: input.code as never,
    });
    await auditReferralMutation(authAuditRepository.log, ctx, 'REFERRAL_TYPE_UPDATED', id, input);
    return item;
  },

  async deactivate(id: string, ctx: RequestContext) {
    await referralTypeService.getById(id);
    const item = await referralTypeRepository.update(id, { isActive: false });
    await auditReferralMutation(authAuditRepository.log, ctx, 'REFERRAL_TYPE_DEACTIVATED', id);
    return item;
  },
};
