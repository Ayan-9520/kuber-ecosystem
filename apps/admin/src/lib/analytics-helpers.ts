function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

export function recordToCountMap(value: unknown): Record<string, number> {
  if (!isPlainObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, count]) => [key, toNumber(count)]),
  );
}

export interface LeadSourceRow {
  sourceId: string;
  sourceName: string;
  count: number;
}

export interface LeadPerformanceRow {
  employeeId?: string;
  employeeName?: string;
  branchId?: string;
  branchName?: string;
  totalLeads: number;
  converted: number;
  lost: number;
}

export interface LeadAnalyticsSummary {
  todayLeads: number;
  qualifiedLeads: number;
  hotLeads: number;
  convertedLeads: number;
  lostLeads: number;
  byStatus: Record<string, number>;
  byGrade: Record<string, number>;
  bySource: LeadSourceRow[];
  executivePerformance: LeadPerformanceRow[];
  branchPerformance: LeadPerformanceRow[];
}

export function normalizeSourceRows(value: unknown): LeadSourceRow[] {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      const row = isPlainObject(item) ? item : {};
      const sourceName = String(row.sourceName ?? row.name ?? `Source ${index + 1}`);
      return {
        sourceId: String(row.sourceId ?? sourceName),
        sourceName,
        count: toNumber(row.count ?? row.value ?? row.total),
      };
    });
  }

  if (isPlainObject(value)) {
    return Object.entries(value).map(([name, count]) => ({
      sourceId: name,
      sourceName: name,
      count: toNumber(count),
    }));
  }

  return [];
}

export function normalizePerformanceRows(value: unknown): LeadPerformanceRow[] {
  return ensureArray<Record<string, unknown>>(value).map((row) => ({
    employeeId: row.employeeId != null ? String(row.employeeId) : undefined,
    employeeName: row.employeeName != null ? String(row.employeeName) : undefined,
    branchId: row.branchId != null ? String(row.branchId) : undefined,
    branchName: row.branchName != null ? String(row.branchName) : undefined,
    totalLeads: toNumber(row.totalLeads ?? row.total),
    converted: toNumber(row.converted),
    lost: toNumber(row.lost),
  }));
}

export function normalizeLeadAnalytics(raw: Record<string, unknown>): LeadAnalyticsSummary {
  return {
    todayLeads: toNumber(raw.todayLeads),
    qualifiedLeads: toNumber(raw.qualifiedLeads),
    hotLeads: toNumber(raw.hotLeads),
    convertedLeads: toNumber(raw.convertedLeads),
    lostLeads: toNumber(raw.lostLeads),
    byStatus: recordToCountMap(raw.byStatus),
    byGrade: recordToCountMap(raw.byGrade),
    bySource: normalizeSourceRows(raw.bySource),
    executivePerformance: normalizePerformanceRows(raw.executivePerformance),
    branchPerformance: normalizePerformanceRows(raw.branchPerformance),
  };
}

export interface CommissionPartnerRow {
  partnerName?: string;
  partnerCode?: string;
  status?: string;
  commissionAmount: number;
}

export interface CommissionGroupRow {
  _count?: number;
  _sum?: { commissionAmount?: number };
  branchId?: string;
  branchName?: string;
  productId?: string;
  productName?: string;
  commissionType?: string;
}

export interface CommissionAnalyticsSummary {
  commissionOutstanding: number;
  paidCommissions: number;
  partnerEarnings: CommissionPartnerRow[];
  branchPerformance: CommissionGroupRow[];
  productPerformance: CommissionGroupRow[];
  commissionTypeBreakdown: CommissionGroupRow[];
  recoverySummary: { totalRecovered: number; count?: number };
  totals: { totalCommission: number; entryCount?: number };
}

function normalizeCommissionGroups(value: unknown, nameKey: 'branchName' | 'productName'): CommissionGroupRow[] {
  const fromApi = ensureArray<Record<string, unknown>>(value);
  if (fromApi.length === 0) return [];

  return fromApi.map((row) => {
    if (row._sum != null || row._count != null) {
      return row as CommissionGroupRow;
    }

    const name = String(row[nameKey] ?? row.branchId ?? row.productId ?? '');
    const amount = toNumber(row.total ?? row.amount ?? row.commissionAmount);
    return {
      [nameKey]: name,
      branchId: row.branchId != null ? String(row.branchId) : undefined,
      productId: row.productId != null ? String(row.productId) : undefined,
      _count: toNumber(row.count, 1),
      _sum: { commissionAmount: amount },
    };
  });
}

function normalizePartnerEarnings(value: unknown, legacyBreakdown: unknown): CommissionPartnerRow[] {
  const rows = ensureArray<Record<string, unknown>>(value);
  if (rows.length > 0) {
    return rows.flatMap((row) => {
      if (isPlainObject(row.partner)) {
        const partner = row.partner;
        const partnerName = String(partner.businessName ?? partner.contactName ?? '');
        const partnerCode = partner.partnerCode != null ? String(partner.partnerCode) : undefined;
        const byStatus = recordToCountMap(row.byStatus);

        if (Object.keys(byStatus).length > 0) {
          return Object.entries(byStatus).map(([status, commissionAmount]) => ({
            partnerName,
            partnerCode,
            status,
            commissionAmount,
          }));
        }

        return [{
          partnerName,
          partnerCode,
          status: 'TOTAL',
          commissionAmount: toNumber(row.total),
        }];
      }

      return [{
        partnerName: row.partnerName != null ? String(row.partnerName) : undefined,
        partnerCode: row.partnerCode != null ? String(row.partnerCode) : undefined,
        status: row.status != null ? String(row.status) : 'PAID',
        commissionAmount: toNumber(row.commissionAmount ?? row.paid ?? row.total),
      }];
    });
  }

  return ensureArray<Record<string, unknown>>(legacyBreakdown).map((row) => ({
    partnerName: row.partnerName != null ? String(row.partnerName) : undefined,
    status: 'PAID',
    commissionAmount: toNumber(row.paid ?? row.total),
  }));
}

export function normalizeCommissionAnalytics(raw: Record<string, unknown>): CommissionAnalyticsSummary {
  const totalsRaw = isPlainObject(raw.totals) ? raw.totals : {};
  const recoveryRaw = isPlainObject(raw.recoverySummary) ? raw.recoverySummary : {};

  return {
    commissionOutstanding: toNumber(raw.commissionOutstanding),
    paidCommissions: toNumber(raw.paidCommissions ?? raw.commissionPaid),
    partnerEarnings: normalizePartnerEarnings(raw.partnerEarnings, raw.partnerBreakdown),
    branchPerformance: normalizeCommissionGroups(raw.branchPerformance ?? raw.branchBreakdown, 'branchName'),
    productPerformance: normalizeCommissionGroups(raw.productPerformance, 'productName'),
    commissionTypeBreakdown: ensureArray<CommissionGroupRow>(raw.commissionTypeBreakdown),
    recoverySummary: {
      totalRecovered: toNumber(recoveryRaw.totalRecovered),
      count: recoveryRaw.count != null ? toNumber(recoveryRaw.count) : undefined,
    },
    totals: {
      totalCommission: toNumber(totalsRaw.totalCommission ?? raw.totalCommission),
      entryCount: totalsRaw.entryCount != null ? toNumber(totalsRaw.entryCount) : undefined,
    },
  };
}
