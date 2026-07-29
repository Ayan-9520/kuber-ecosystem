import type { EsignProvider, EsignResponse, EsignStatus } from './esign.interface.js';
import { MockEsignProvider } from './mock-esign.provider.js';
import { DigioEsignProvider } from './digio-esign.provider.js';
import { LeegalityEsignProvider } from './leegality-esign.provider.js';

type ProviderKey = 'digio' | 'leegality' | 'mock';

const signingStatusByPartner = new Map<string, { requestId: string; status: EsignStatus }>();

function initializeProvider(): EsignProvider {
  const key = (process.env.ESIGN_PROVIDER ?? 'mock').toLowerCase() as ProviderKey;
  switch (key) {
    case 'digio':
      return new DigioEsignProvider();
    case 'leegality':
      return new LeegalityEsignProvider();
    default:
      return new MockEsignProvider();
  }
}

let provider: EsignProvider | null = null;

function getProvider(): EsignProvider {
  if (!provider) provider = initializeProvider();
  return provider;
}

export const esignService = {
  async requestPartnerAgreementSign(
    partnerId: string,
    partnerName: string,
    email: string,
    phone: string,
  ): Promise<EsignResponse> {
    const callbackUrl =
      process.env.ESIGN_CALLBACK_URL ?? 'https://api.kuberfinserve.com/webhooks/esign';

    const response = await getProvider().createSignRequest({
      documentName: `Channel Partner Agreement — ${partnerName}`,
      signerName: partnerName,
      signerEmail: email,
      signerPhone: phone,
      callbackUrl,
      metadata: { partnerId, type: 'partner_agreement' },
    });

    signingStatusByPartner.set(partnerId, {
      requestId: response.requestId,
      status: response.status,
    });

    return response;
  },

  async handleCallback(
    requestId: string,
    status: EsignStatus,
  ): Promise<{ acknowledged: boolean }> {
    for (const [partnerId, record] of signingStatusByPartner) {
      if (record.requestId === requestId) {
        record.status = status;
        console.log(`[EsignService] callback: partner=${partnerId} status=${status}`);
        // TODO: Update partner record in DB when status is SIGNED
        break;
      }
    }
    return { acknowledged: true };
  },

  async getSigningStatus(
    partnerId: string,
  ): Promise<{ requestId: string; status: EsignStatus } | null> {
    const record = signingStatusByPartner.get(partnerId);
    if (!record) return null;

    const fresh = await getProvider().getStatus(record.requestId);
    record.status = fresh.status;
    return { requestId: record.requestId, status: fresh.status };
  },

  /** Exposed for testing — resets the cached provider instance. */
  _resetProvider(): void {
    provider = null;
  },
};
