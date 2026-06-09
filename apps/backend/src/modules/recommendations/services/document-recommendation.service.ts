import { prisma } from '../../../config/database.js';
import type { CustomerProfile, DocumentRecResult } from '../types/recommendations.types.js';

const BASE_DOCS = ['PAN Card', 'Aadhaar', 'Bank Statement (6 months)', 'Salary Slips (3 months)'];
const BUSINESS_DOCS = ['ITR (2 years)', 'GST Returns', 'Business Proof'];
const PROPERTY_DOCS = ['Property Papers', 'NOC', 'Chain of Title'];

export const documentRecommendationService = {
  async analyze(profile: CustomerProfile, leadId?: string, applicationId?: string): Promise<DocumentRecResult> {
    const where = {
      ...(leadId ? { leadId } : {}),
      ...(applicationId ? { applicationId } : {}),
      ...(profile.customerId && !leadId && !applicationId ? { customerId: profile.customerId } : {}),
    };

    const [docs, deficiencies, requests] = await Promise.all([
      prisma.document.findMany({ where: { ...where, deletedAt: null }, take: 50 }),
      prisma.documentDeficiency.findMany({ where: { ...where, status: 'OPEN' }, take: 20 }),
      prisma.documentRequest.findMany({ where: { ...where, status: 'PENDING' }, take: 20 }),
    ]);

    const missing = requests.map((r) => r.documentTypeId).length > 0
      ? [`${requests.length} pending document request(s)`]
      : deficiencies.map((d) => d.description);

    const weak = docs.filter((d) => d.status === 'DEFICIENT').map((d) => `Document ${d.id.slice(0, 8)} deficient`);
    const expired = docs.filter((d) => d.status === 'EXPIRED').map((d) => `Document ${d.id.slice(0, 8)} expired`);

    const required = [...BASE_DOCS];
    if (profile.productType?.toUpperCase().includes('BUSINESS')) required.push(...BUSINESS_DOCS);
    if (profile.productType?.toUpperCase().includes('HOME') || profile.productType?.toUpperCase().includes('LAP')) {
      required.push(...PROPERTY_DOCS);
    }

    const additional: string[] = [];
    if ((profile.creditScore ?? 750) < 700) additional.push('Credit Bureau Report', 'Explanation Letter');
    if ((profile.foir ?? 0) > 50) additional.push('Additional Income Proof');

    const risk: string[] = [];
    if (missing.length > 2) risk.push('High document gap risk');
    if (weak.length > 0) risk.push('Weak document quality');
    if (expired.length > 0) risk.push('Expired documents on file');

    return { required, additional, risk, missing, weak, expired };
  },
};
