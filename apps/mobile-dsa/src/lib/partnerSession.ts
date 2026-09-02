import { partnersService } from '@/services';

/** True when partner must complete KYC before full dashboard access. */
export async function partnerNeedsKyc(partnerId: string | null | undefined): Promise<boolean> {
  if (!partnerId) return false;
  try {
    const partner = await partnersService.getById(partnerId);
    return String(partner.kycStatus) !== 'VERIFIED';
  } catch {
    return false;
  }
}
