import { prisma } from '@kuberone/database';

import { AppError } from '../../../shared/errors/app-error.js';

/** Minimum uploads before admin can mark partner KYC verified (real CRM flow). */
export const PARTNER_KYC_REQUIRED_TYPE_CODES = ['PAN', 'AADHAAR', 'CHEQUE'] as const;

export async function countPartnerKycDocuments(partnerId: string): Promise<number> {
  return prisma.document.count({
    where: { partnerId, ownerType: 'PARTNER', deletedAt: null },
  });
}

export async function getPartnerKycDocumentSummary(partnerId: string) {
  const docs = await prisma.document.findMany({
    where: { partnerId, ownerType: 'PARTNER', deletedAt: null },
    include: { documentType: { select: { code: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const uploadedTypeCodes = new Set(
    docs.map((d) => d.documentType.code.toUpperCase()),
  );

  return {
    total: docs.length,
    items: docs.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      status: d.status,
      documentTypeCode: d.documentType.code,
      documentTypeName: d.documentType.name,
      createdAt: d.createdAt.toISOString(),
    })),
    missingRequired: PARTNER_KYC_REQUIRED_TYPE_CODES.filter((code) => !uploadedTypeCodes.has(code)),
    canVerify: docs.length > 0 && PARTNER_KYC_REQUIRED_TYPE_CODES.every((code) => uploadedTypeCodes.has(code)),
  };
}

export async function markPartnerKycSubmitted(partnerId: string): Promise<void> {
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (!partner || partner.kycStatus === 'VERIFIED' || partner.kycStatus === 'SUBMITTED') return;

  await prisma.partner.update({
    where: { id: partnerId },
    data: { kycStatus: 'SUBMITTED' },
  });
}

export async function assertPartnerCanVerifyKyc(partnerId: string): Promise<void> {
  const summary = await getPartnerKycDocumentSummary(partnerId);

  if (summary.total === 0) {
    throw new AppError(
      400,
      'KYC_DOCUMENTS_REQUIRED',
      'Partner has not uploaded any KYC documents. They must upload files in the Partner App before you verify KYC.',
    );
  }

  if (summary.missingRequired.length > 0) {
    throw new AppError(
      400,
      'KYC_DOCUMENTS_INCOMPLETE',
      `Missing required documents: ${summary.missingRequired.join(', ')}. Partner must upload these before KYC verification.`,
    );
  }
}
