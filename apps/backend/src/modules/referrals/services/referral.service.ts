import type { Prisma } from '@kuberone/database';
import type {
  ConvertReferralInput,
  CreateReferralInput,
  ListReferralsQuery,
  UpdateReferralInput,
} from '@kuberone/shared-validation';

import { AppError, ConflictError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import { referralRepository } from '../repositories/referral.repository.js';
import type { RequestContext } from '../types/referrals.types.js';
import {
  auditReferralMutation,
  buildPaginationMeta,
  defaultExpiryDate,
  generateReferralCode,
  generateReferralNumber,
  isReferralExpired,
} from '../utils/referrals.utils.js';

import { referralTypeService } from './referral-type.service.js';

function buildListWhere(query: ListReferralsQuery): Prisma.ReferralWhereInput {
  return {
    ...(query.includeDeleted ? {} : { deletedAt: null }),
    ...(query.referralTypeId ? { referralTypeId: query.referralTypeId } : {}),
    ...(query.referralTypeCode ? { referralType: { code: query.referralTypeCode as never } } : {}),
    ...(query.status ? { status: query.status as never } : {}),
    ...(query.rewardStatus ? { rewardStatus: query.rewardStatus as never } : {}),
    ...(query.referrerCustomerId ? { referrerCustomerId: query.referrerCustomerId } : {}),
    ...(query.referrerPartnerId ? { referrerPartnerId: query.referrerPartnerId } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.leadId ? { leadId: query.leadId } : {}),
    ...(query.applicationId ? { applicationId: query.applicationId } : {}),
    ...(query.partnerId ? { partnerId: query.partnerId } : {}),
    ...(query.branchId ? { branchId: query.branchId } : {}),
    ...(query.search
      ? {
          OR: [
            { referralNumber: { contains: query.search } },
            { referralCode: { contains: query.search } },
            { referrerName: { contains: query.search } },
            { refereeName: { contains: query.search } },
            { refereePhone: { contains: query.search } },
          ],
        }
      : {}),
    ...(query.fromDate || query.toDate
      ? {
          createdAt: {
            ...(query.fromDate ? { gte: query.fromDate } : {}),
            ...(query.toDate ? { lte: query.toDate } : {}),
          },
        }
      : {}),
  };
}

async function resolveReferralType(input: CreateReferralInput) {
  if (input.referralTypeId) {
    return referralTypeService.getById(input.referralTypeId);
  }
  return referralTypeService.getByCode(input.referralTypeCode!);
}

export const referralService = {
  async list(query: ListReferralsQuery) {
    const where = buildListWhere(query);
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      referralRepository.list(where, skip, query.limit, orderBy),
      referralRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await referralRepository.findById(id);
    if (!item || item.deletedAt) throw new NotFoundError('Referral', id);
    return item;
  },

  async validateCode(referralCode: string) {
    const referral = await referralRepository.findByCode(referralCode.toUpperCase());
    if (!referral) {
      return { valid: false, reason: 'Referral code not found' };
    }
    if (referral.status === 'CANCELLED' || referral.status === 'REJECTED') {
      return { valid: false, reason: `Referral is ${referral.status.toLowerCase()}` };
    }
    if (referral.status === 'CONVERTED') {
      return { valid: false, reason: 'Referral already converted' };
    }
    if (isReferralExpired(referral.expiresAt)) {
      return { valid: false, reason: 'Referral code expired' };
    }

    return {
      valid: true,
      referral: {
        id: referral.id,
        referralCode: referral.referralCode,
        referralType: referral.referralType,
        referrerName: referral.referrerName,
        status: referral.status,
        expiresAt: referral.expiresAt,
      },
    };
  },

  async create(input: CreateReferralInput, ctx: RequestContext) {
    const referralType = await resolveReferralType(input);
    if (!referralType.isActive) {
      throw new AppError(400, 'REFERRAL_TYPE_INACTIVE', 'Referral type is not active');
    }

    const duplicate = await referralRepository.list(
      {
        deletedAt: null,
        refereePhone: input.refereePhone,
        status: { in: ['PENDING', 'ACTIVE'] },
        referralTypeId: referralType.id,
      },
      0,
      1,
      { createdAt: 'desc' },
    );
    if (duplicate.length > 0) {
      throw new ConflictError('An active referral already exists for this referee phone and type');
    }

    const last = await referralRepository.getLastReferralNumber();
    let referralCode = generateReferralCode(input.referrerPhone);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await referralRepository.findByCode(referralCode);
      if (!existing) break;
      referralCode = generateReferralCode(input.referrerPhone);
      attempts++;
    }

    const item = await referralRepository.create({
      referralNumber: generateReferralNumber(last?.referralNumber),
      referralCode,
      referralType: { connect: { id: referralType.id } },
      status: 'ACTIVE',
      referrerName: input.referrerName,
      referrerPhone: input.referrerPhone,
      referrerEmail: input.referrerEmail,
      refereeName: input.refereeName,
      refereePhone: input.refereePhone,
      refereeEmail: input.refereeEmail,
      requestedAmount: input.requestedAmount,
      notes: input.notes,
      metadata: input.metadata as Prisma.InputJsonValue,
      expiresAt: input.expiresAt ?? defaultExpiryDate(),
      rewardStatus: referralType.defaultRewardPct ? 'PENDING' : 'NOT_APPLICABLE',
      referrerCustomer: input.referrerCustomerId ? { connect: { id: input.referrerCustomerId } } : undefined,
      referrerPartner: input.referrerPartnerId ? { connect: { id: input.referrerPartnerId } } : undefined,
      referrerEmployee: input.referrerEmployeeId ? { connect: { id: input.referrerEmployeeId } } : undefined,
      product: input.productId ? { connect: { id: input.productId } } : undefined,
      partner: input.partnerId ? { connect: { id: input.partnerId } } : undefined,
      branch: input.branchId ? { connect: { id: input.branchId } } : undefined,
      createdBy: { connect: { id: ctx.actorId } },
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditReferralMutation(authAuditRepository.log, ctx, 'REFERRAL_CREATED', item.id, {
      referralType: referralType.code,
      referralCode: item.referralCode,
    });

    return item;
  },

  async update(id: string, input: UpdateReferralInput, ctx: RequestContext) {
    const existing = await referralService.getById(id);
    if (existing.status === 'CONVERTED') {
      throw new AppError(400, 'REFERRAL_CONVERTED', 'Converted referrals cannot be updated');
    }

    const item = await referralRepository.update(id, {
      ...input,
      status: input.status as never,
      rewardStatus: input.rewardStatus as never,
      metadata: input.metadata as Prisma.InputJsonValue,
      product: input.productId ? { connect: { id: input.productId } } : undefined,
      partner: input.partnerId ? { connect: { id: input.partnerId } } : undefined,
      branch: input.branchId ? { connect: { id: input.branchId } } : undefined,
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditReferralMutation(authAuditRepository.log, ctx, 'REFERRAL_UPDATED', id, input);
    return item;
  },

  async convert(id: string, input: ConvertReferralInput, ctx: RequestContext) {
    const existing = await referralService.getById(id);
    if (existing.status === 'CONVERTED') {
      throw new AppError(400, 'ALREADY_CONVERTED', 'Referral is already converted');
    }
    if (isReferralExpired(existing.expiresAt)) {
      throw new AppError(400, 'REFERRAL_EXPIRED', 'Referral has expired');
    }

    const rewardAmount =
      input.rewardAmount ??
      (existing.requestedAmount && existing.referralType.defaultRewardPct
        ? Number(existing.requestedAmount) * (Number(existing.referralType.defaultRewardPct) / 100)
        : existing.rewardAmount);

    const item = await referralRepository.update(id, {
      status: 'CONVERTED',
      convertedAt: new Date(),
      rewardAmount,
      rewardStatus: rewardAmount ? 'PENDING' : 'NOT_APPLICABLE',
      customer: input.customerId ? { connect: { id: input.customerId } } : undefined,
      lead: input.leadId ? { connect: { id: input.leadId } } : undefined,
      application: input.applicationId ? { connect: { id: input.applicationId } } : undefined,
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditReferralMutation(authAuditRepository.log, ctx, 'REFERRAL_CONVERTED', id, input);
    return item;
  },

  async approveReward(id: string, ctx: RequestContext) {
    const existing = await referralService.getById(id);
    if (existing.status !== 'CONVERTED') {
      throw new AppError(400, 'NOT_CONVERTED', 'Only converted referrals can have rewards approved');
    }

    const item = await referralRepository.update(id, {
      rewardStatus: 'APPROVED',
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditReferralMutation(authAuditRepository.log, ctx, 'REFERRAL_REWARD_APPROVED', id);
    return item;
  },

  async markRewardPaid(id: string, ctx: RequestContext) {
    const existing = await referralService.getById(id);
    if (existing.rewardStatus !== 'APPROVED') {
      throw new AppError(400, 'REWARD_NOT_APPROVED', 'Reward must be approved before marking paid');
    }

    const item = await referralRepository.update(id, {
      rewardStatus: 'PAID',
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditReferralMutation(authAuditRepository.log, ctx, 'REFERRAL_REWARD_PAID', id);
    return item;
  },

  async reject(id: string, reason: string, ctx: RequestContext) {
    await referralService.getById(id);
    const item = await referralRepository.update(id, {
      status: 'REJECTED',
      rejectionReason: reason,
      rewardStatus: 'REJECTED',
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditReferralMutation(authAuditRepository.log, ctx, 'REFERRAL_REJECTED', id, { reason });
    return item;
  },

  async cancel(id: string, ctx: RequestContext) {
    const existing = await referralService.getById(id);
    if (existing.status === 'CONVERTED') {
      throw new AppError(400, 'REFERRAL_CONVERTED', 'Converted referrals cannot be cancelled');
    }

    const item = await referralRepository.update(id, {
      status: 'CANCELLED',
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditReferralMutation(authAuditRepository.log, ctx, 'REFERRAL_CANCELLED', id);
    return item;
  },

  async remove(id: string, ctx: RequestContext) {
    await referralService.getById(id);
    const item = await referralRepository.softDelete(id, ctx.actorId);
    await auditReferralMutation(authAuditRepository.log, ctx, 'REFERRAL_DELETED', id);
    return { id: item.id, deleted: true };
  },
};
