import { env } from '../../../config/env.js';
import { rejectMockProviderInProduction } from '../../notifications/providers/provider-guard.js';
import { mockSmsProvider } from '../../notifications/providers/sms/mock.provider.js';
import { msg91Provider } from '../../notifications/providers/sms/msg91.provider.js';
import { twilioProvider } from '../../notifications/providers/sms/twilio.provider.js';

import { awsSnsProvider } from './aws-sns.provider.js';
import type { SmsProviderAdapter } from './types.js';

const twilioFrom = () => env.TWILIO_FROM_NUMBER ?? env.TWILIO_PHONE_NUMBER;

export function resolveEnterpriseSmsProvider(dbType?: string): SmsProviderAdapter {
  const type = (dbType ?? env.SMS_PROVIDER).toUpperCase();

  if (type === 'MSG91' && env.MSG91_AUTH_KEY) return msg91Provider as SmsProviderAdapter;
  if (type === 'TWILIO' && env.TWILIO_ACCOUNT_SID && twilioFrom()) return twilioProvider as SmsProviderAdapter;
  if (type === 'AWS_SNS' && (env.AWS_SNS_ACCESS_KEY || env.AWS_ACCESS_KEY_ID)) return awsSnsProvider;

  if (env.SMS_PROVIDER === 'msg91' && env.MSG91_AUTH_KEY) return msg91Provider as SmsProviderAdapter;
  if (env.SMS_PROVIDER === 'twilio' && env.TWILIO_ACCOUNT_SID) return twilioProvider as SmsProviderAdapter;
  if (env.SMS_PROVIDER === 'aws_sns' && (env.AWS_SNS_ACCESS_KEY || env.AWS_ACCESS_KEY_ID)) return awsSnsProvider;
  if (env.MSG91_AUTH_KEY) return msg91Provider as SmsProviderAdapter;
  if (env.TWILIO_ACCOUNT_SID) return twilioProvider as SmsProviderAdapter;

  rejectMockProviderInProduction(env, 'SMS', 'mock');
  return mockSmsProvider as SmsProviderAdapter;
}
