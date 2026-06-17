import { env } from '../../../../config/env.js';
import { rejectMockProviderInProduction } from '../provider-guard.js';
import type { EmailProvider } from '../types.js';

import { mockEmailProvider } from './mock.provider.js';
import { sendgridProvider } from './sendgrid.provider.js';
import { smtpProvider } from './smtp.provider.js';

export function resolveEmailProvider(): EmailProvider {
  let resolved = 'mock';
  if (env.EMAIL_PROVIDER === 'sendgrid' && env.SENDGRID_API_KEY) {
    resolved = 'sendgrid';
    return sendgridProvider;
  }
  if (env.EMAIL_PROVIDER === 'smtp' && env.SMTP_HOST) {
    resolved = 'smtp';
    return smtpProvider;
  }
  if (env.SENDGRID_API_KEY) {
    resolved = 'sendgrid';
    return sendgridProvider;
  }
  if (env.SMTP_HOST) {
    resolved = 'smtp';
    return smtpProvider;
  }
  rejectMockProviderInProduction(env, 'Email', resolved);
  return mockEmailProvider;
}
