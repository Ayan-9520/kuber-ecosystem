import type {
  CreateCommissionApprovalInput,
  ListCommissionApprovalsQuery,
} from '@kuberone/shared-validation';

import { AppError, NotFoundError } from '../../../shared/errors/app-error.js';
import { authAuditRepository } from '../../auth/repositories/audit.repository.js';
import {
  commissionApprovalRepository,
  commissionLedgerRepository,
} from '../repositories/commission.repository.js';
import type { RequestContext } from '../types/commissions.types.js';
import { auditCommissionMutation, buildPaginationMeta, generateApprovalNumber } from '../utils/commissions.utils.js';

import { commissionLedgerService } from './commission-ledger.service.js';

export const commissionApprovalService = {
  async list(query: ListCommissionApprovalsQuery) {
    const where = {
      ...(query.ledgerId ? { ledgerId: query.ledgerId } : {}),
      ...(query.status ? { status: query.status as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder };

    const [items, total] = await Promise.all([
      commissionApprovalRepository.list(where, skip, query.limit, orderBy),
      commissionApprovalRepository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async getById(id: string) {
    const item = await commissionApprovalRepository.findById(id);
    if (!item) throw new NotFoundError('CommissionApproval', id);
    return item;
  },

  async request(input: CreateCommissionApprovalInput, ctx: RequestContext) {
    const ledger = await commissionLedgerService.getById(input.ledgerId);
    if (ledger.status !== 'CALCULATED' && ledger.status !== 'PENDING') {
      throw new AppError(400, 'INVALID_LEDGER_STATUS', 'Only calculated commissions can be submitted for approval');
    }

    const last = await commissionApprovalRepository.getLastApprovalNumber();
    const item = await commissionApprovalRepository.create({
      approvalNumber: generateApprovalNumber(last?.approvalNumber),
      ledger: { connect: { id: input.ledgerId } },
      status: 'PENDING',
      requestedAmount: ledger.commissionAmount,
      notes: input.notes,
      requestedBy: { connect: { id: ctx.actorId } },
    });

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_APPROVAL_REQUESTED', item.id, input);
    return item;
  },

  async approve(id: string, approvedAmount: number | undefined, notes: string | undefined, ctx: RequestContext) {
    const approval = await commissionApprovalService.getById(id);
    if (approval.status !== 'PENDING') {
      throw new AppError(400, 'APPROVAL_NOT_PENDING', 'Approval is not pending');
    }

    const amount = approvedAmount ?? Number(approval.requestedAmount);
    const item = await commissionApprovalRepository.update(id, {
      status: 'APPROVED',
      approvedAmount: amount,
      notes,
      approvedAt: new Date(),
      approvedBy: { connect: { id: ctx.actorId } },
    });

    await commissionLedgerRepository.update(approval.ledgerId, {
      status: 'APPROVED',
      commissionAmount: amount,
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_APPROVED', id, { approvedAmount: amount });
    return item;
  },

  async reject(id: string, reason: string, ctx: RequestContext) {
    const approval = await commissionApprovalService.getById(id);
    if (approval.status !== 'PENDING') {
      throw new AppError(400, 'APPROVAL_NOT_PENDING', 'Approval is not pending');
    }

    const item = await commissionApprovalRepository.update(id, {
      status: 'REJECTED',
      rejectionReason: reason,
      approvedBy: { connect: { id: ctx.actorId } },
    });

    await commissionLedgerRepository.update(approval.ledgerId, {
      status: 'REJECTED',
      updatedBy: { connect: { id: ctx.actorId } },
    });

    await auditCommissionMutation(authAuditRepository.log, ctx, 'COMMISSION_REJECTED', id, { reason });
    return item;
  },
};
