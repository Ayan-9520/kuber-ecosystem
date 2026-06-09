import type { EmailPayload, EmailProvider, ProviderSendResult } from '../types.js';

export const mockEmailProvider: EmailProvider = {
  type: 'MOCK',
  async send(_payload: EmailPayload): Promise<ProviderSendResult> {
    return { success: true, providerRef: `email-mock-${Date.now()}`, deliveryStatus: 'accepted' };
  },
};
