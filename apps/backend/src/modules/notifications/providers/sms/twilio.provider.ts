import { env } from '../../../../config/env.js';
import type { ProviderSendResult, SmsPayload, SmsProvider } from '../types.js';

export const twilioProvider: SmsProvider = {
  type: 'TWILIO',

  async send(payload: SmsPayload): Promise<ProviderSendResult> {
    const accountSid = env.TWILIO_ACCOUNT_SID;
    const authToken = env.TWILIO_AUTH_TOKEN;
    const from = env.TWILIO_FROM_NUMBER;
    if (!accountSid || !authToken || !from) {
      return { success: false, error: 'Twilio credentials not configured' };
    }

    const body = new URLSearchParams({
      To: payload.to.startsWith('+') ? payload.to : `+91${payload.to}`,
      From: from,
      Body: payload.body,
    });

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Twilio error ${response.status}: ${text}` };
    }

    const data = (await response.json()) as { sid?: string; status?: string };
    return {
      success: true,
      providerRef: data.sid ?? `twilio-${Date.now()}`,
      deliveryStatus: data.status ?? 'queued',
    };
  },
};
