import { env } from '../../../../config/env.js';
import type { EmailPayload, EmailProvider, ProviderSendResult } from '../types.js';

export const sendgridProvider: EmailProvider = {
  type: 'SENDGRID',

  async send(payload: EmailPayload): Promise<ProviderSendResult> {
    const apiKey = env.SENDGRID_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'SENDGRID_API_KEY not configured' };
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: payload.to }] }],
        from: { email: payload.from ?? env.EMAIL_FROM, name: 'Kuber Finserve' },
        subject: payload.subject,
        content: [
          { type: 'text/plain', value: payload.body },
          ...(payload.html ? [{ type: 'text/html', value: payload.html }] : []),
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `SendGrid error ${response.status}: ${text}` };
    }

    const messageId = response.headers.get('x-message-id') ?? `sg-${Date.now()}`;
    return { success: true, providerRef: messageId, deliveryStatus: 'accepted' };
  },
};
