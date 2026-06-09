export type ProviderSendResult = {
  success: boolean;
  providerRef?: string;
  deliveryStatus?: string;
  error?: string;
};

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
  html?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
};

export interface EmailProviderAdapter {
  readonly type: string;
  send(payload: EmailPayload): Promise<ProviderSendResult>;
}
