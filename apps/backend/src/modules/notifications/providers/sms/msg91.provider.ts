import { env } from '../../../../config/env.js';
import type { ProviderSendResult, SmsPayload, SmsProvider } from '../types.js';

export const msg91Provider: SmsProvider = {
  type: 'MSG91',

  async send(payload: SmsPayload): Promise<ProviderSendResult> {
    const authKey = env.MSG91_AUTH_KEY;
    if (!authKey) {
      return { success: false, error: 'MSG91_AUTH_KEY not configured' };
    }

    const phone = payload.to.replace(/\D/g, '');
    const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        authkey: authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: env.MSG91_TEMPLATE_ID ?? 'kuberone_transactional',
        short_url: '0',
        recipients: [{ mobiles: phone, var: payload.body }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `MSG91 error ${response.status}: ${text}` };
    }

    const data = (await response.json()) as { type?: string; request_id?: string };
    return {
      success: true,
      providerRef: data.request_id ?? `msg91-${Date.now()}`,
      deliveryStatus: data.type ?? 'submitted',
    };
  },
};
