import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrerUrl?: string;
  landingPage?: string;
}

/**
 * UTM attribution data is stored in the lead's `metadata` JSON field
 * under the key `attribution`.
 */
export const leadAttributionService = {
  async trackAttribution(leadId: string, utmParams: UtmParams): Promise<void> {
    const lead = await prisma.lead.findFirst({ where: { id: leadId, deletedAt: null } });
    if (!lead) throw new NotFoundError('Lead', leadId);

    const existing = (lead.metadata as Record<string, unknown>) ?? {};
    const attribution: UtmParams = {
      ...(existing.attribution as UtmParams | undefined),
      ...stripUndefined(utmParams),
    };

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        metadata: { ...existing, attribution, attributionUpdatedAt: new Date().toISOString() },
      },
    });
  },

  async getAttribution(leadId: string): Promise<UtmParams | null> {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
      select: { metadata: true },
    });
    if (!lead) throw new NotFoundError('Lead', leadId);

    const meta = lead.metadata as Record<string, unknown> | null;
    return (meta?.attribution as UtmParams) ?? null;
  },

  async getAttributionReport(
    fromDate: Date,
    toDate: Date,
  ): Promise<{
    bySource: Record<string, number>;
    byMedium: Record<string, number>;
    byCampaign: Record<string, number>;
    total: number;
  }> {
    const leads = await prisma.lead.findMany({
      where: { deletedAt: null, createdAt: { gte: fromDate, lte: toDate } },
      select: { metadata: true },
    });

    const bySource: Record<string, number> = {};
    const byMedium: Record<string, number> = {};
    const byCampaign: Record<string, number> = {};
    let attributed = 0;

    for (const lead of leads) {
      const meta = lead.metadata as Record<string, unknown> | null;
      const attr = meta?.attribution as UtmParams | undefined;
      if (!attr) continue;

      attributed++;
      if (attr.utmSource) bySource[attr.utmSource] = (bySource[attr.utmSource] ?? 0) + 1;
      if (attr.utmMedium) byMedium[attr.utmMedium] = (byMedium[attr.utmMedium] ?? 0) + 1;
      if (attr.utmCampaign) byCampaign[attr.utmCampaign] = (byCampaign[attr.utmCampaign] ?? 0) + 1;
    }

    return { bySource, byMedium, byCampaign, total: attributed };
  },
};

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) result[k] = v;
  }
  return result as Partial<T>;
}
