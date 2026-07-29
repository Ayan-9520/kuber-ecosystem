import { prisma } from '../../../config/database.js';
import { centralAuditService } from '../../governance/services/central-audit.service.js';
import { commissionLedgerRepository } from '../../commissions/repositories/commission.repository.js';
import { partnerRepository } from '../repositories/partner.repository.js';

export const PARTNER_TIERS = ['SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] as const;
export type PartnerTier = (typeof PARTNER_TIERS)[number];

interface TierThreshold {
  tier: PartnerTier;
  lifetimeCommission: number;
  disbursedLeads: number;
}

const TIER_THRESHOLDS: TierThreshold[] = [
  { tier: 'DIAMOND', lifetimeCommission: 25_00_000, disbursedLeads: 1000 },
  { tier: 'PLATINUM', lifetimeCommission: 5_00_000, disbursedLeads: 200 },
  { tier: 'GOLD', lifetimeCommission: 1_00_000, disbursedLeads: 50 },
  { tier: 'SILVER', lifetimeCommission: 0, disbursedLeads: 0 },
];

const TIER_RANK: Record<PartnerTier, number> = {
  SILVER: 0,
  GOLD: 1,
  PLATINUM: 2,
  DIAMOND: 3,
};

function determineTier(lifetimeCommission: number, disbursedLeads: number): PartnerTier {
  for (const threshold of TIER_THRESHOLDS) {
    if (
      lifetimeCommission >= threshold.lifetimeCommission ||
      disbursedLeads >= threshold.disbursedLeads
    ) {
      return threshold.tier;
    }
  }
  return 'SILVER';
}

export const partnerTierService = {
  async evaluateTier(partnerId: string) {
    const partner = await partnerRepository.findById(partnerId);
    if (!partner) throw new Error(`Partner not found: ${partnerId}`);

    const [commissionAgg, disbursedCount] = await Promise.all([
      commissionLedgerRepository.aggregate({
        partnerId,
        deletedAt: null,
      }),
      prisma.lead.count({
        where: { partnerId, status: 'DISBURSED', deletedAt: null },
      }),
    ]);

    const lifetimeCommission = Number(commissionAgg._sum.commissionAmount ?? 0);
    const currentTier = (partner.commissionTier ?? 'SILVER') as PartnerTier;
    const qualifiedTier = determineTier(lifetimeCommission, disbursedCount);
    const shouldUpgrade = TIER_RANK[qualifiedTier] > TIER_RANK[currentTier];

    return {
      currentTier,
      qualifiedTier,
      shouldUpgrade,
      metrics: {
        lifetimeCommission,
        disbursedLeads: disbursedCount,
      },
    };
  },

  async upgradeTier(partnerId: string, newTier: PartnerTier, actorId: string) {
    const partner = await partnerRepository.findById(partnerId);
    if (!partner) throw new Error(`Partner not found: ${partnerId}`);

    const previousTier = partner.commissionTier ?? 'SILVER';

    const updated = await partnerRepository.update(partnerId, {
      commissionTier: newTier,
    });

    try {
      await centralAuditService.log({
        userId: actorId,
        action: 'UPDATE',
        entityType: 'Partner',
        entityId: partnerId,
        source: 'PARTNER_TIER_ENGINE',
        description: `Auto-upgraded tier from ${previousTier} to ${newTier}`,
        metadata: { previousTier, newTier, partnerId },
      });
    } catch {
      /* audit is best-effort */
    }

    return {
      id: updated.id,
      partnerCode: updated.partnerCode,
      businessName: updated.businessName,
      previousTier,
      newTier,
      updatedAt: updated.updatedAt.toISOString(),
    };
  },

  async checkAndUpgradeAll() {
    const activePartners = await prisma.partner.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { id: true, userId: true },
    });

    const upgrades: Array<{
      partnerId: string;
      from: PartnerTier;
      to: PartnerTier;
    }> = [];
    const errors: Array<{ partnerId: string; error: string }> = [];

    for (const partner of activePartners) {
      try {
        const evaluation = await this.evaluateTier(partner.id);
        if (evaluation.shouldUpgrade) {
          await this.upgradeTier(partner.id, evaluation.qualifiedTier, 'SYSTEM');
          upgrades.push({
            partnerId: partner.id,
            from: evaluation.currentTier,
            to: evaluation.qualifiedTier,
          });
        }
      } catch (err) {
        errors.push({
          partnerId: partner.id,
          error: (err as Error).message,
        });
      }
    }

    return {
      totalChecked: activePartners.length,
      upgraded: upgrades.length,
      upgrades,
      errors,
    };
  },
};
