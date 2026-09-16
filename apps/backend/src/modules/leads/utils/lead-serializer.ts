import type { Prisma } from '@kuberone/database';

type LeadRecord = Prisma.LeadGetPayload<{
  include: {
    source: true;
    product: { include: { family: true } };
    variant: true;
    customer: { include: { user: { select: { id: true; phone: true; email: true } } } };
    partner: true;
    branch: true;
    region: true;
    assignedTo: true;
    createdBy: { select: { id: true; email: true; phone: true } };
  };
}>;

function normalizePhone(value: unknown): string | null {
  const digits = String(value ?? '').replace(/\D/g, '').slice(-10);
  return digits.length >= 10 ? digits : null;
}

function readWizardPersonal(metadata: unknown): Record<string, unknown> | undefined {
  if (!metadata || typeof metadata !== 'object') return undefined;
  const meta = metadata as Record<string, unknown>;
  const wizard = meta.applicationWizard ?? meta.wizard;
  if (!wizard || typeof wizard !== 'object') return undefined;
  const personal = (wizard as Record<string, unknown>).personal;
  return personal && typeof personal === 'object' ? (personal as Record<string, unknown>) : undefined;
}

function decimalToNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const CONVERTED_STATUSES = new Set(['APPLICATION_CREATED', 'SANCTIONED', 'DISBURSED']);

export function serializeLead<T extends LeadRecord>(lead: T) {
  const wizardPersonal = readWizardPersonal(lead.metadata);
  const meta =
    lead.metadata && typeof lead.metadata === 'object' && !Array.isArray(lead.metadata)
      ? (lead.metadata as Record<string, unknown>)
      : {};
  const loanAmount =
    decimalToNumber(lead.requestedAmount) ??
    decimalToNumber(wizardPersonal?.requestedLoanAmount) ??
    decimalToNumber(wizardPersonal?.loanAmount);
  const score = decimalToNumber(lead.score);

  const prospectPhone = lead.prospectPhone || normalizePhone(wizardPersonal?.phone);
  const prospectEmail =
    lead.prospectEmail ??
    (wizardPersonal?.email ? String(wizardPersonal.email) : null) ??
    lead.customer?.user?.email ??
    null;
  const phone =
    normalizePhone(prospectPhone) ??
    normalizePhone(lead.customer?.user?.phone) ??
    null;
  const prospectName =
    lead.prospectName?.trim() ||
    [wizardPersonal?.firstName, wizardPersonal?.lastName].filter(Boolean).join(' ').trim() ||
    lead.customer?.fullName?.trim() ||
    null;

  const city = meta.city != null && String(meta.city).trim() ? String(meta.city) : null;
  const employmentType =
    meta.employmentType != null && String(meta.employmentType).trim()
      ? String(meta.employmentType)
      : null;
  const companyName =
    meta.companyName != null && String(meta.companyName).trim() ? String(meta.companyName) : null;
  const monthlyIncome = decimalToNumber(meta.monthlyIncome);
  const tenureMonths = decimalToNumber(meta.tenureMonths);
  const loanType =
    meta.loanType != null && String(meta.loanType).trim() ? String(meta.loanType) : null;

  return {
    ...lead,
    prospectName: prospectName ?? lead.prospectName,
    prospectPhone: phone ?? prospectPhone,
    prospectEmail: prospectEmail ?? lead.prospectEmail,
    score,
    requestedAmount: loanAmount,
    productName: lead.product?.name ?? null,
    productCode: lead.product?.code ?? null,
    productFamilyCode: lead.product?.family?.code ?? null,
    variantName: lead.variant?.name ?? null,
    sourceName: lead.source?.name ?? null,
    sourceCode: lead.source?.code ?? null,
    partnerName: lead.partner?.businessName ?? lead.partner?.contactName ?? null,
    partnerCode: lead.partner?.partnerCode ?? null,
    customerName: lead.customer?.fullName ?? null,
    branchName: lead.branch?.name ?? null,
    regionName: lead.region?.name ?? null,
    assignedToName: lead.assignedTo
      ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`.trim()
      : null,
    // Flat aliases used by Admin UI, exports, and legacy integrations
    fullName: prospectName ?? lead.prospectName,
    name: prospectName ?? lead.prospectName,
    phone,
    email: prospectEmail,
    loanAmount,
    city,
    employmentType,
    companyName,
    monthlyIncome,
    tenureMonths,
    loanType,
    age: meta.age != null && String(meta.age).trim() ? String(meta.age) : null,
    workExperience:
      meta.workExperience != null && String(meta.workExperience).trim()
        ? String(meta.workExperience)
        : null,
    existingEmi: decimalToNumber(meta.existingEmi),
    purpose: meta.purpose != null && String(meta.purpose).trim() ? String(meta.purpose) : null,
    pan: meta.pan != null && String(meta.pan).trim() ? String(meta.pan) : null,
    message: meta.message != null && String(meta.message).trim() ? String(meta.message) : null,
    formType: meta.formType != null ? String(meta.formType) : null,
    formVariant: meta.formVariant != null ? String(meta.formVariant) : null,
    pageUrl: meta.pageUrl != null ? String(meta.pageUrl) : null,
    websiteSource: meta.source != null ? String(meta.source) : null,
    isConverted: Boolean(lead.convertedAt) || CONVERTED_STATUSES.has(lead.status),
  };
}
