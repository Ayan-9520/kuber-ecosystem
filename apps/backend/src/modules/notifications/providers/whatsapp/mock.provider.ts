import type { ProviderSendResult, WhatsAppPayload, WhatsAppProvider } from '../types.js';

export const mockWhatsAppProvider: WhatsAppProvider = {
  type: 'MOCK',
  async send(_payload: WhatsAppPayload): Promise<ProviderSendResult> {
    return { success: true, providerRef: `wa-mock-${Date.now()}`, deliveryStatus: 'accepted' };
  },
};
