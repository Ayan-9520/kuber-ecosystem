import type { Prisma } from '@kuberone/database';

import { prisma } from '../../../config/database.js';
import { ledgerInclude, paymentInclude } from '../types/commissions.types.js';

export const commissionRuleRepository = {
  list(where: Prisma.CommissionRuleWhereInput, skip: number, take: number, orderBy: Prisma.CommissionRuleOrderByWithRelationInput) {
    return prisma.commissionRule.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { product: { select: { id: true, code: true, name: true } }, lender: { select: { id: true, code: true, name: true } } },
    });
  },
  count(where: Prisma.CommissionRuleWhereInput) {
    return prisma.commissionRule.count({ where });
  },
  findById(id: string) {
    return prisma.commissionRule.findUnique({
      where: { id },
      include: { product: true, lender: true },
    });
  },
  findByCode(ruleCode: string) {
    return prisma.commissionRule.findUnique({ where: { ruleCode } });
  },
  listActive(filters: {
    commissionType: string;
    partnerType?: string | null;
    productId?: string | null;
    lenderId?: string | null;
    campaignId?: string | null;
    asOf?: Date;
  }) {
    const asOf = filters.asOf ?? new Date();
    return prisma.commissionRule.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        commissionType: filters.commissionType as never,
        effectiveFrom: { lte: asOf },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
        ...(filters.partnerType ? { OR: [{ partnerType: filters.partnerType as never }, { partnerType: null }] } : {}),
        ...(filters.productId ? { OR: [{ productId: filters.productId }, { productId: null }] } : {}),
        ...(filters.lenderId ? { OR: [{ lenderId: filters.lenderId }, { lenderId: null }] } : {}),
        ...(filters.campaignId ? { OR: [{ campaignId: filters.campaignId }, { campaignId: null }] } : {}),
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  },
  create(data: Prisma.CommissionRuleCreateInput) {
    return prisma.commissionRule.create({ data });
  },
  update(id: string, data: Prisma.CommissionRuleUpdateInput) {
    return prisma.commissionRule.update({ where: { id }, data });
  },
  softDelete(id: string, deletedById: string) {
    return prisma.commissionRule.update({ where: { id }, data: { deletedAt: new Date(), deletedById } });
  },
};

export const commissionLedgerRepository = {
  list(where: Prisma.CommissionLedgerWhereInput, skip: number, take: number, orderBy: Prisma.CommissionLedgerOrderByWithRelationInput) {
    return prisma.commissionLedger.findMany({ where, skip, take, orderBy, include: ledgerInclude });
  },
  count(where: Prisma.CommissionLedgerWhereInput) {
    return prisma.commissionLedger.count({ where });
  },
  findById(id: string) {
    return prisma.commissionLedger.findUnique({ where: { id }, include: ledgerInclude });
  },
  getLastLedgerNumber() {
    return prisma.commissionLedger.findFirst({ orderBy: { ledgerNumber: 'desc' }, select: { ledgerNumber: true } });
  },
  create(data: Prisma.CommissionLedgerCreateInput) {
    return prisma.commissionLedger.create({ data, include: ledgerInclude });
  },
  update(id: string, data: Prisma.CommissionLedgerUpdateInput) {
    return prisma.commissionLedger.update({ where: { id }, data, include: ledgerInclude });
  },
  softDelete(id: string, deletedById: string) {
    return prisma.commissionLedger.update({ where: { id }, data: { deletedAt: new Date(), deletedById }, include: ledgerInclude });
  },
  aggregate(where: Prisma.CommissionLedgerWhereInput) {
    return prisma.commissionLedger.aggregate({ where, _sum: { commissionAmount: true }, _count: true });
  },
  groupByPartner(where: Prisma.CommissionLedgerWhereInput) {
    return prisma.commissionLedger.groupBy({
      by: ['partnerId', 'status'],
      where,
      _sum: { commissionAmount: true },
      _count: true,
    });
  },
  groupByBranch(where: Prisma.CommissionLedgerWhereInput) {
    return prisma.commissionLedger.groupBy({
      by: ['branchId', 'status'],
      where,
      _sum: { commissionAmount: true },
      _count: true,
    });
  },
  groupByProduct(where: Prisma.CommissionLedgerWhereInput) {
    return prisma.commissionLedger.groupBy({
      by: ['productId', 'status'],
      where,
      _sum: { commissionAmount: true },
      _count: true,
    });
  },
  groupByType(where: Prisma.CommissionLedgerWhereInput) {
    return prisma.commissionLedger.groupBy({
      by: ['commissionType', 'status'],
      where,
      _sum: { commissionAmount: true },
      _count: true,
    });
  },
};

export const commissionApprovalRepository = {
  list(where: Prisma.CommissionApprovalWhereInput, skip: number, take: number, orderBy: Prisma.CommissionApprovalOrderByWithRelationInput) {
    return prisma.commissionApproval.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { ledger: { include: ledgerInclude }, requestedBy: { select: { id: true, email: true } }, approvedBy: { select: { id: true, email: true } } },
    });
  },
  count(where: Prisma.CommissionApprovalWhereInput) {
    return prisma.commissionApproval.count({ where });
  },
  findById(id: string) {
    return prisma.commissionApproval.findUnique({
      where: { id },
      include: { ledger: { include: ledgerInclude }, requestedBy: true, approvedBy: true },
    });
  },
  getLastApprovalNumber() {
    return prisma.commissionApproval.findFirst({ orderBy: { approvalNumber: 'desc' }, select: { approvalNumber: true } });
  },
  create(data: Prisma.CommissionApprovalCreateInput) {
    return prisma.commissionApproval.create({
      data,
      include: { ledger: { include: ledgerInclude } },
    });
  },
  update(id: string, data: Prisma.CommissionApprovalUpdateInput) {
    return prisma.commissionApproval.update({
      where: { id },
      data,
      include: { ledger: { include: ledgerInclude } },
    });
  },
};

export const commissionPaymentRepository = {
  list(where: Prisma.CommissionPaymentWhereInput, skip: number, take: number, orderBy: Prisma.CommissionPaymentOrderByWithRelationInput) {
    return prisma.commissionPayment.findMany({ where, skip, take, orderBy, include: paymentInclude });
  },
  count(where: Prisma.CommissionPaymentWhereInput) {
    return prisma.commissionPayment.count({ where });
  },
  findById(id: string) {
    return prisma.commissionPayment.findUnique({ where: { id }, include: paymentInclude });
  },
  getLastPaymentNumber() {
    return prisma.commissionPayment.findFirst({ orderBy: { paymentNumber: 'desc' }, select: { paymentNumber: true } });
  },
  create(data: Prisma.CommissionPaymentCreateInput) {
    return prisma.commissionPayment.create({ data, include: paymentInclude });
  },
  update(id: string, data: Prisma.CommissionPaymentUpdateInput) {
    return prisma.commissionPayment.update({ where: { id }, data, include: paymentInclude });
  },
  softDelete(id: string, deletedById: string) {
    return prisma.commissionPayment.update({ where: { id }, data: { deletedAt: new Date(), deletedById }, include: paymentInclude });
  },
};

export const commissionAdjustmentRepository = {
  list(where: Prisma.CommissionAdjustmentWhereInput, skip: number, take: number, orderBy: Prisma.CommissionAdjustmentOrderByWithRelationInput) {
    return prisma.commissionAdjustment.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { partner: { select: { id: true, partnerCode: true, businessName: true } }, ledger: { select: { id: true, ledgerNumber: true } } },
    });
  },
  count(where: Prisma.CommissionAdjustmentWhereInput) {
    return prisma.commissionAdjustment.count({ where });
  },
  findById(id: string) {
    return prisma.commissionAdjustment.findUnique({
      where: { id },
      include: { partner: true, ledger: true },
    });
  },
  getLastAdjustmentNumber() {
    return prisma.commissionAdjustment.findFirst({ orderBy: { adjustmentNumber: 'desc' }, select: { adjustmentNumber: true } });
  },
  create(data: Prisma.CommissionAdjustmentCreateInput) {
    return prisma.commissionAdjustment.create({ data });
  },
  update(id: string, data: Prisma.CommissionAdjustmentUpdateInput) {
    return prisma.commissionAdjustment.update({ where: { id }, data });
  },
  softDelete(id: string, deletedById: string) {
    return prisma.commissionAdjustment.update({ where: { id }, data: { deletedAt: new Date(), deletedById } });
  },
};

export const commissionRecoveryRepository = {
  list(where: Prisma.CommissionRecoveryWhereInput, skip: number, take: number, orderBy: Prisma.CommissionRecoveryOrderByWithRelationInput) {
    return prisma.commissionRecovery.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { partner: { select: { id: true, partnerCode: true } }, ledger: { select: { id: true, ledgerNumber: true } } },
    });
  },
  count(where: Prisma.CommissionRecoveryWhereInput) {
    return prisma.commissionRecovery.count({ where });
  },
  findById(id: string) {
    return prisma.commissionRecovery.findUnique({
      where: { id },
      include: { partner: true, ledger: true },
    });
  },
  getLastRecoveryNumber() {
    return prisma.commissionRecovery.findFirst({ orderBy: { recoveryNumber: 'desc' }, select: { recoveryNumber: true } });
  },
  create(data: Prisma.CommissionRecoveryCreateInput) {
    return prisma.commissionRecovery.create({ data });
  },
  update(id: string, data: Prisma.CommissionRecoveryUpdateInput) {
    return prisma.commissionRecovery.update({ where: { id }, data });
  },
  softDelete(id: string, deletedById: string) {
    return prisma.commissionRecovery.update({ where: { id }, data: { deletedAt: new Date(), deletedById } });
  },
};
