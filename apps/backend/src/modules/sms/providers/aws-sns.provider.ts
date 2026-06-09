import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

import { env } from '../../../config/env.js';
import { normalizePhone } from '../utils/sms.utils.js';

import type { ProviderSendResult, SmsPayload, SmsProviderAdapter } from './types.js';

let snsClient: SNSClient | null = null;

function getSnsClient(): SNSClient {
  if (!snsClient) {
    snsClient = new SNSClient({
      region: env.AWS_SNS_REGION,
      credentials:
        env.AWS_SNS_ACCESS_KEY && env.AWS_SNS_SECRET_KEY
          ? { accessKeyId: env.AWS_SNS_ACCESS_KEY, secretAccessKey: env.AWS_SNS_SECRET_KEY }
          : env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
            ? { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY }
            : undefined,
    });
  }
  return snsClient;
}

export const awsSnsProvider: SmsProviderAdapter = {
  type: 'AWS_SNS',

  async send(payload: SmsPayload): Promise<ProviderSendResult> {
    try {
      const phone = `+${normalizePhone(payload.to)}`;
      const result = await getSnsClient().send(
        new PublishCommand({
          PhoneNumber: phone,
          Message: payload.body,
          MessageAttributes: payload.dltTemplateId
            ? { 'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' } }
            : undefined,
        }),
      );
      return {
        success: true,
        providerRef: result.MessageId ?? `sns-${Date.now()}`,
        deliveryStatus: 'sent',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AWS SNS send failed';
      return { success: false, error: message };
    }
  },
};
