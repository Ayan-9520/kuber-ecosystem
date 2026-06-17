import { env } from '../../../../config/env.js';
import { rejectMockProviderInProduction } from '../provider-guard.js';
import type { SmsProvider } from '../types.js';

import { mockSmsProvider } from './mock.provider.js';
import { msg91Provider } from './msg91.provider.js';
import { twilioProvider } from './twilio.provider.js';

export function resolveSmsProvider(): SmsProvider {
  let resolved = 'mock';
  if (env.SMS_PROVIDER === 'msg91' && env.MSG91_AUTH_KEY) {
    resolved = 'msg91';
    return msg91Provider;
  }
  if (env.SMS_PROVIDER === 'twilio' && env.TWILIO_ACCOUNT_SID) {
    resolved = 'twilio';
    return twilioProvider;
  }
  if (env.MSG91_AUTH_KEY) {
    resolved = 'msg91';
    return msg91Provider;
  }
  if (env.TWILIO_ACCOUNT_SID) {
    resolved = 'twilio';
    return twilioProvider;
  }
  rejectMockProviderInProduction(env, 'SMS', resolved);
  return mockSmsProvider;
}
