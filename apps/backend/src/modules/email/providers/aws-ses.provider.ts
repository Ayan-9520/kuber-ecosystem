import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { env } from '../../../config/env.js';

import type { EmailPayload, EmailProviderAdapter, ProviderSendResult } from './types.js';

let sesClient: SESClient | null = null;

function getSesClient(): SESClient {
  if (!sesClient) {
    sesClient = new SESClient({
      region: env.AWS_SES_REGION,
      credentials:
        env.AWS_SES_ACCESS_KEY && env.AWS_SES_SECRET_KEY
          ? { accessKeyId: env.AWS_SES_ACCESS_KEY, secretAccessKey: env.AWS_SES_SECRET_KEY }
          : env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
            ? { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY }
            : undefined,
    });
  }
  return sesClient;
}

export const awsSesProvider: EmailProviderAdapter = {
  type: 'AWS_SES',

  async send(payload: EmailPayload): Promise<ProviderSendResult> {
    try {
      const from = payload.from ?? env.EMAIL_FROM;
      const command = new SendEmailCommand({
        Source: payload.fromName ? `${payload.fromName} <${from}>` : from,
        Destination: { ToAddresses: [payload.to] },
        Message: {
          Subject: { Data: payload.subject, Charset: 'UTF-8' },
          Body: {
            Text: { Data: payload.body, Charset: 'UTF-8' },
            ...(payload.html ? { Html: { Data: payload.html, Charset: 'UTF-8' } } : {}),
          },
        },
        ReplyToAddresses: payload.replyTo ? [payload.replyTo] : undefined,
      });

      const result = await getSesClient().send(command);
      return {
        success: true,
        providerRef: result.MessageId ?? `ses-${Date.now()}`,
        deliveryStatus: 'sent',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AWS SES send failed';
      return { success: false, error: message };
    }
  },
};
