import type { Prisma } from '@kuberone/database';

type ApplicationRecord = Prisma.ApplicationGetPayload<{
  include: {
    customer: { select: { id: true; customerCode: true; fullName: true } };
    product: { include: { family: true } };
    variant: true;
    lead: { select: { id: true; leadNumber: true; deletedAt: true } };
    partner: { select: { id: true; partnerCode: true; businessName: true } };
    branch: true;
    region: true;
    assignedSales: { select: { id: true; employeeCode: true; firstName: true; lastName: true } };
    assignedCredit: { select: { id: true; employeeCode: true; firstName: true; lastName: true } };
    assignedOps: { select: { id: true; employeeCode: true; firstName: true; lastName: true } };
    selectedLender: { select: { id: true; code: true; name: true } };
    sanction: true;
    closure: true;
  };
}>;

export function serializeApplication<T extends ApplicationRecord>(application: T) {
  const metadata = application.metadata as Record<string, unknown> | null;
  const wizard = metadata?.wizard as Record<string, unknown> | undefined;
  const wizardPersonal = wizard?.personal as Record<string, unknown> | undefined;
  const wizardName = [wizardPersonal?.firstName, wizardPersonal?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    ...application,
    customerName: application.customer?.fullName ?? (wizardName || null),
    productName: application.product?.name ?? null,
    productFamilyName: application.product?.family?.name ?? null,
    productFamilyCode: application.product?.family?.code ?? null,
    variantName: application.variant?.name ?? null,
    partnerName: application.partner?.businessName ?? null,
    leadNumber: application.lead?.deletedAt ? null : application.lead?.leadNumber ?? null,
    leadIsDeleted: Boolean(application.lead?.deletedAt),
    loanAmount: application.requestedAmount,
    tenureMonths: application.requestedTenureMonths,
    lenderName: application.selectedLender?.name ?? null,
    branchName: application.branch?.name ?? null,
    regionName: application.region?.name ?? null,
    wizardMetadata: wizard ?? null,
    leadId: application.leadId,
    currentStage: application.status,
    eligibilityStatus:
      application.status === 'DRAFT' || application.status === 'SUBMITTED'
        ? 'PENDING'
        : ['REJECTED', 'CLOSED'].includes(application.status)
          ? 'N/A'
          : 'CHECKED',
    creditReviewStatus:
      ['CREDIT_REVIEW', 'SANCTIONED', 'DISBURSED', 'CLOSED'].includes(application.status)
        ? 'COMPLETED'
        : application.status === 'REJECTED'
          ? 'REJECTED'
          : 'PENDING',
    sanctionStatus: application.sanction
      ? String(application.sanction.status ?? 'ISSUED')
      : ['SANCTIONED', 'DISBURSED', 'CLOSED'].includes(application.status)
        ? 'ISSUED'
        : 'PENDING',
    disbursementStatus: ['DISBURSED', 'CLOSED'].includes(application.status)
      ? 'COMPLETED'
      : application.status === 'SANCTIONED'
        ? 'PENDING'
        : 'N/A',
  };
}
