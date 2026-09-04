import { env } from '../../../../config/env.js';
import type { ProviderSendResult, SmsPayload, SmsProvider } from '../types.js';

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function extractOtp(payload: SmsPayload): string | undefined {
  const fromVars = payload.variables?.otp ?? payload.variables?.OTP ?? payload.variables?.VAR1;
  if (fromVars != null && String(fromVars).trim()) return String(fromVars).trim();
  const match = payload.body.match(/\b(\d{4,8})\b/);
  return match?.[1];
}

/**
 * MSG91 Flow API — template vars must match DLT-approved Flow placeholders
 * (commonly `otp`, `VAR1`, `expiry`, etc.). Sender ID is registered with MSG91.
 */
export const msg91Provider: SmsProvider = {
  type: 'MSG91',

  async send(payload: SmsPayload): Promise<ProviderSendResult> {
    const authKey = env.MSG91_AUTH_KEY;
    if (!authKey) {
      return { success: false, error: 'MSG91_AUTH_KEY not configured' };
    }

    const templateId = env.MSG91_TEMPLATE_ID?.trim();
    if (!templateId) {
      return { success: false, error: 'MSG91_TEMPLATE_ID not configured' };
    }

    const phone = digitsOnly(payload.to);
    if (phone.length < 10) {
      return { success: false, error: 'Invalid mobile number for MSG91' };
    }

    const otp = extractOtp(payload);
    const expiry =
      payload.variables?.expiryMinutes ??
      payload.variables?.expiry ??
      payload.variables?.VAR2;

    const recipient: Record<string, string> = {
      mobiles: phone.startsWith('91') && phone.length >= 12 ? phone : `91${phone.slice(-10)}`,
    };

    if (otp) {
      recipient.otp = otp;
      recipient.VAR1 = otp;
    }
    if (expiry != null && String(expiry).trim()) {
      recipient.expiry = String(expiry);
      recipient.VAR2 = String(expiry);
    }

    if (payload.variables) {
      for (const [key, value] of Object.entries(payload.variables)) {
        if (value == null) continue;
        if (key === 'mobiles') continue;
        recipient[key] = String(value);
      }
    }

    const body: Record<string, unknown> = {
      template_id: templateId,
      short_url: '0',
      recipients: [recipient],
    };

    const sender = env.MSG91_SENDER_ID?.trim();
    if (sender) body.sender = sender;
    if (payload.dltTemplateId) body.dlt_template_id = payload.dltTemplateId;

    const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        authkey: authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `MSG91 error ${response.status}: ${text}` };
    }

    const data = (await response.json()) as { type?: string; request_id?: string; message?: string };
    if (data.type && data.type !== 'success') {
      return {
        success: false,
        error: `MSG91 rejected: ${data.message ?? data.type}`,
        providerRef: data.request_id,
      };
    }

    return {
      success: true,
      providerRef: data.request_id ?? `msg91-${Date.now()}`,
      deliveryStatus: data.type ?? 'submitted',
    };
  },
};
