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
};

export type SmsPayload = {
  to: string;
  body: string;
};

export type WhatsAppPayload = {
  to: string;
  templateName: string;
  body: string;
  variables?: Record<string, unknown>;
  language?: string;
};

export type FcmPayload = {
  token: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  topic?: string;
};

export interface EmailProvider {
  readonly type: string;
  send(payload: EmailPayload): Promise<ProviderSendResult>;
}

export interface SmsProvider {
  readonly type: string;
  send(payload: SmsPayload): Promise<ProviderSendResult>;
}

export interface WhatsAppProvider {
  readonly type: string;
  send(payload: WhatsAppPayload): Promise<ProviderSendResult>;
}

export interface PushProvider {
  readonly type: string;
  send(payload: FcmPayload): Promise<ProviderSendResult>;
  sendToTopic?(payload: Omit<FcmPayload, 'token'> & { topic: string }): Promise<ProviderSendResult>;
}
