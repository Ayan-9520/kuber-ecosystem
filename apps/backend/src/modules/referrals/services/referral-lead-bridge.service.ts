import type { CreateReferralInput } from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import { leadSourceRepository } from '../../leads/repositories/lead-source.repository.js';
import { leadStatusHistoryRepository } from '../../leads/repositories/lead-status-history.repository.js';
import { leadRepository } from '../../leads/repositories/lead.repository.js';
import { leadScoreService } from '../../leads/services/lead-score.service.js';
import { TERMINAL_STATUSES } from '../../leads/constants/leads.constants.js';
import type { RequestContext } from '../../leads/types/leads.types.js';
import { generateLeadNumber } from '../../leads/utils/leads.utils.js';
import { productRepository } from '../../product/repositories/product.repository.js';

/** Creates or reuses a CRM lead when a partner submits a referral. */
export const referralLeadBridgeService = {
  async ensureLeadForReferral(
    input: CreateReferralInput,
    ctx: RequestContext,
  ): Promise<string | undefined> {
    if (!input.partnerId) return undefined;

    const prospectPhone = String(input.refereePhone).replace(/\D/g, '').slice(-10);
    if (prospectPhone.length < 10) return undefined;

    const existing = await prisma.lead.findFirst({
      where: {
        partnerId: input.partnerId,
        deletedAt: null,
        prospectPhone: { contains: prospectPhone },
        status: { notIn: [...TERMINAL_STATUSES] },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (existing) return existing.id;

    const productCandidate = input.productId
      ? await productRepository.findById(input.productId)
      : await productRepository.findByCode('PL-01').then((row) =>
          row ? productRepository.findById(row.id) : null,
        );
    const source = await leadSourceRepository.findByCode('DSA');
    if (!source || !productCandidate) return undefined;
    const product = productCandidate;

    const last = await leadRepository.getLastLeadNumber();
    const leadNumber = generateLeadNumber(last?.leadNumber);

    const lead = await leadRepository.create({
      leadNumber,
      prospectName: input.refereeName.trim(),
      prospectPhone,
      prospectEmail: input.refereeEmail,
      productId: product.id,
      sourceId: source.id,
      partnerId: input.partnerId,
      branchId: input.branchId,
      requestedAmount: input.requestedAmount,
      priority: 'MEDIUM',
      status: 'NEW',
      metadata: {
        channel: 'PARTNER_REFERRAL',
        referralNotes: input.notes,
      },
      createdById: ctx.actorId,
      updatedById: ctx.actorId,
    });

    await leadStatusHistoryRepository.create({
      leadId: lead.id,
      fromStatus: null,
      toStatus: 'NEW',
      changedById: ctx.actorId,
      reason: 'Lead created from partner referral',
    });

    await leadScoreService.scoreLead(
      {
        leadId: lead.id,
        scoringProfile: {
          loanAmount: input.requestedAmount,
          productType: product.family?.code,
        },
      },
      ctx,
      {
        loanAmount: input.requestedAmount,
        productType: product.family?.code,
      },
    );

    return lead.id;
  },
};
