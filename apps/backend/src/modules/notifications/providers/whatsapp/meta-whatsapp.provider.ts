import { env } from '../../../../config/env.js';
import type { ProviderSendResult, WhatsAppPayload, WhatsAppProvider } from '../types.js';

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('91') ? digits : `91${digits}`;
}

function buildTemplateComponents(variables?: Record<string, unknown>) {
  if (!variables || Object.keys(variables).length === 0) return undefined;
  const parameters = Object.values(variables).map((value) => ({
    type: 'text',
    text: String(value),
  }));
  return [{ type: 'body', parameters }];
}

export const metaWhatsAppProvider: WhatsAppProvider = {
  type: 'META_WHATSAPP',

  async send(payload: WhatsAppPayload): Promise<ProviderSendResult> {
    const token = env.WHATSAPP_BUSINESS_API_TOKEN;
    const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) {
      return { success: false, error: 'WhatsApp Business API not configured' };
    }

    const url = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
    const useTemplate = payload.templateName && payload.templateName !== 'generic';

    const body = useTemplate
      ? {
          messaging_product: 'whatsapp',
          to: normalizePhone(payload.to),
          type: 'template',
          template: {
            name: payload.templateName,
            language: { code: payload.language ?? 'en' },
            components: buildTemplateComponents(payload.variables),
          },
        }
      : {
          messaging_product: 'whatsapp',
          to: normalizePhone(payload.to),
          type: 'text',
          text: { body: payload.body },
        };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `WhatsApp API error ${response.status}: ${text}` };
    }

    const data = (await response.json()) as { messages?: Array<{ id: string }> };
    const messageId = data.messages?.[0]?.id ?? `wa-${Date.now()}`;
    return { success: true, providerRef: messageId, deliveryStatus: 'accepted' };
  },
};
