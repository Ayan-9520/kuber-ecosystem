export type ProviderSendResult = {
  success: boolean;
  providerRef?: string;
  error?: string;
  deliveryStatus?: string;
};

export type FcmPayload = {
  token: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
};

export type PushProviderAdapter = {
  type: string;
  send(payload: FcmPayload): Promise<ProviderSendResult>;
  sendToTopic?: (payload: Omit<FcmPayload, 'token'> & { topic: string }) => Promise<ProviderSendResult>;
  subscribeToTopic?: (token: string, topic: string) => Promise<ProviderSendResult>;
  unsubscribeFromTopic?: (token: string, topic: string) => Promise<ProviderSendResult>;
};
