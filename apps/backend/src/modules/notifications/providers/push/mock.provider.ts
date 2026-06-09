import type { FcmPayload, ProviderSendResult, PushProvider } from '../types.js';

export const mockPushProvider: PushProvider = {
  type: 'MOCK',
  async send(_payload: FcmPayload): Promise<ProviderSendResult> {
    return { success: true, providerRef: `fcm-mock-${Date.now()}`, deliveryStatus: 'sent' };
  },
  async sendToTopic() {
    return { success: true, providerRef: `fcm-topic-mock-${Date.now()}`, deliveryStatus: 'sent' };
  },
};
