import { prisma } from '../../../config/database.js';
import { NotFoundError } from '../../../shared/errors/app-error.js';
import type { CustomerProfile } from '../types/recommendations.types.js';

export const profileBuilderService = {
  async fromCustomer(customerId: string): Promise<CustomerProfile> {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
      include: {
        incomes: { where: { deletedAt: null }, take: 1, orderBy: { declaredAt: 'desc' } },
        employments: { where: { isCurrent: true }, take: 1 },
        applications: { take: 1, orderBy: { updatedAt: 'desc' } },
        leads: { take: 1, orderBy: { updatedAt: 'desc' } },
      },
    });
    if (!customer) throw new NotFoundError('Customer', customerId);

    const metadata = (customer.metadata ?? {}) as Record<string, unknown>;
    const lead = customer.leads[0];
    const app = customer.applications[0];

    const totalDocs = await prisma.document.count({ where: { customerId, deletedAt: null } });
    const verifiedDocs = await prisma.document.count({ where: { customerId, deletedAt: null, status: 'VERIFIED' } });

    const monthlyIncome = Number(customer.incomes[0]?.grossAmount ?? metadata.monthlyIncome ?? 0) || undefined;
    const loanAmount = Number(lead?.requestedAmount ?? app?.requestedAmount ?? metadata.loanAmount ?? 0) || undefined;

    return {
      customerId,
      monthlyIncome,
      creditScore: Number(metadata.creditScore ?? metadata.cibil ?? 0) || undefined,
      age: customer.dateOfBirth ? Math.floor((Date.now() - new Date(customer.dateOfBirth).getTime()) / 31557600000) : undefined,
      occupation: String(customer.employments[0]?.designation ?? metadata.occupation ?? ''),
      employmentType: String(customer.employments[0]?.employmentType ?? metadata.employmentType ?? ''),
      businessVintageYears: Number(metadata.businessVintageYears ?? 0) || undefined,
      businessTurnover: Number(metadata.businessTurnover ?? 0) || undefined,
      location: String(metadata.city ?? metadata.location ?? ''),
      propertyValue: Number(metadata.propertyValue ?? 0) || undefined,
      vehicleValue: Number(metadata.vehicleValue ?? 0) || undefined,
      loanAmount,
      existingObligations: Number(metadata.existingObligations ?? 0) || undefined,
      leadScore: lead?.score ? Number(lead.score) : undefined,
      leadGrade: lead?.grade ?? undefined,
      applicationStatus: app?.status,
      productId: lead?.productId ?? app?.productId,
      documentCompletenessPct: totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 50,
    };
  },

  async fromLead(leadId: string): Promise<CustomerProfile> {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
      include: { product: { include: { family: true } } },
    });
    if (!lead) throw new NotFoundError('Lead', leadId);

    const base = lead.customerId
      ? await this.fromCustomer(lead.customerId)
      : { customerId: leadId, documentCompletenessPct: 50 } as CustomerProfile;

    const metadata = (lead.metadata ?? {}) as Record<string, unknown>;

    return {
      ...base,
      customerId: lead.customerId ?? leadId,
      loanAmount: Number(lead.requestedAmount ?? base.loanAmount ?? 0) || undefined,
      leadScore: lead.score ? Number(lead.score) : base.leadScore,
      leadGrade: lead.grade ?? base.leadGrade,
      productId: lead.productId,
      productType: String(lead.product?.code ?? lead.product?.family?.code ?? ''),
      location: String(metadata.city ?? metadata.location ?? base.location ?? ''),
      propertyValue: Number(metadata.propertyValue ?? base.propertyValue ?? 0) || undefined,
      vehicleValue: Number(metadata.vehicleValue ?? base.vehicleValue ?? 0) || undefined,
      creditScore: Number(metadata.creditScore ?? base.creditScore ?? 0) || undefined,
    };
  },

  async fromApplication(applicationId: string): Promise<CustomerProfile> {
    const app = await prisma.application.findFirst({
      where: { id: applicationId, deletedAt: null },
      include: { product: { include: { family: true } } },
    });
    if (!app) throw new NotFoundError('Application', applicationId);

    const base = await this.fromCustomer(app.customerId);

    return {
      ...base,
      loanAmount: Number(app.requestedAmount ?? base.loanAmount ?? 0) || undefined,
      applicationStatus: app.status,
      productId: app.productId,
      productType: String(app.product?.code ?? app.product?.family?.code ?? ''),
    };
  },
};
