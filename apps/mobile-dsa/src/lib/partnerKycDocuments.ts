/** Document type codes partners must upload for KYC (matches admin review checklist). */
export const PARTNER_KYC_TYPE_CODES = ['PAN', 'AADHAAR', 'CHEQUE', 'PARTNER_AGREEMENT'] as const;

export type PartnerKycTypeCode = (typeof PARTNER_KYC_TYPE_CODES)[number];

export function isPartnerKycTypeCode(code: string | null | undefined): code is PartnerKycTypeCode {
  return PARTNER_KYC_TYPE_CODES.includes(code as PartnerKycTypeCode);
}

export function filterPartnerKycTypes(items: Record<string, unknown>[]): Record<string, unknown>[] {
  const kyc = items.filter((t) => isPartnerKycTypeCode(String(t.code ?? '')));
  if (kyc.length > 0) return kyc;
  return items.filter((t) => String(t.category ?? '') === 'KYC');
}
