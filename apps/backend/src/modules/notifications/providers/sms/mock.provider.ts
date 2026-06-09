import type { ProviderSendResult, SmsPayload, SmsProvider } from '../types.js';

export const mockSmsProvider: SmsProvider = {
  type: 'MOCK',
  async send(_payload: SmsPayload): Promise<ProviderSendResult> {
    return { success: true, providerRef: `sms-mock-${Date.now()}`, deliveryStatus: 'accepted' };
  },
};
