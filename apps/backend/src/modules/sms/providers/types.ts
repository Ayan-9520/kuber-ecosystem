export type ProviderSendResult = {
  success: boolean;
  providerRef?: string;
  deliveryStatus?: string;
  error?: string;
};

export type SmsPayload = {
  to: string;
  body: string;
  dltTemplateId?: string;
};

export interface SmsProviderAdapter {
  readonly type: string;
  send(payload: SmsPayload): Promise<ProviderSendResult>;
}
