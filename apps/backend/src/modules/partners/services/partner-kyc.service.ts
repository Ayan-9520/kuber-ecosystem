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
  const verifiedTypeCodes = new Set(
    docs
      .filter((d) => d.status === 'VERIFIED')
      .map((d) => d.documentType.code.toUpperCase()),
  );
  const missingRequired = PARTNER_KYC_REQUIRED_TYPE_CODES.filter(
    (code) => !uploadedTypeCodes.has(code),
  );
  const missingVerified = PARTNER_KYC_REQUIRED_TYPE_CODES.filter(
    (code) => !verifiedTypeCodes.has(code),
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
    missingRequired,
    missingVerified,
    canVerify: missingRequired.length === 0 && docs.length > 0,
    allRequiredVerified: missingVerified.length === 0 && docs.length > 0,
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

/**
 * When PAN + Aadhaar + cheque are all document-status VERIFIED, promote partner.kycStatus.
 * Keeps Documents "Verify" and Partners "Verify KYC" in sync (admin often only does the former).
 */
export async function maybeMarkPartnerKycVerifiedFromDocuments(
  partnerId: string,
): Promise<boolean> {
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (!partner || partner.deletedAt) return false;
  if (partner.kycStatus === 'VERIFIED' || partner.kycStatus === 'REJECTED') return false;

  const summary = await getPartnerKycDocumentSummary(partnerId);
  if (!summary.allRequiredVerified) return false;

  await prisma.partner.update({
    where: { id: partnerId },
    data: { kycStatus: 'VERIFIED' },
  });

  try {
    const { partnerBrandService } = await import(
      '../../partner-branding/services/partner-brand.service.js'
    );
    const baseUrl =
      process.env.PUBLIC_PROFILE_BASE_URL?.replace(/\/$/, '') || 'https://pro.kuberone.online';
    await partnerBrandService.ensurePublishedAfterKyc(partnerId, baseUrl);
  } catch {
    /* branding is best-effort */
  }

  return true;
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
