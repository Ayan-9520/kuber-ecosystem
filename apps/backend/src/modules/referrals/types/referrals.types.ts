import type { Prisma } from '@kuberone/database';

export interface RequestContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export const referralInclude = {
  referralType: true,
  referrerCustomer: { select: { id: true, customerCode: true, fullName: true } },
  referrerPartner: { select: { id: true, partnerCode: true, businessName: true, contactName: true } },
  referrerEmployee: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
  customer: { select: { id: true, customerCode: true, fullName: true } },
  lead: { select: { id: true, leadNumber: true, status: true } },
  application: { select: { id: true, applicationNumber: true, status: true } },
  product: { select: { id: true, code: true, name: true } },
  partner: { select: { id: true, partnerCode: true, businessName: true } },
  branch: { select: { id: true, code: true, name: true } },
  createdBy: { select: { id: true, email: true } },
} satisfies Prisma.ReferralInclude;

export type ReferralWithRelations = Prisma.ReferralGetPayload<{ include: typeof referralInclude }>;
