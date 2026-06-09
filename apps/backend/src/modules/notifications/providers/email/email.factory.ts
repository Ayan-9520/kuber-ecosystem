import { env } from '../../../../config/env.js';
import type { EmailProvider } from '../types.js';

import { mockEmailProvider } from './mock.provider.js';
import { sendgridProvider } from './sendgrid.provider.js';
import { smtpProvider } from './smtp.provider.js';

export function resolveEmailProvider(): EmailProvider {
  if (env.EMAIL_PROVIDER === 'sendgrid' && env.SENDGRID_API_KEY) return sendgridProvider;
  if (env.EMAIL_PROVIDER === 'smtp' && env.SMTP_HOST) return smtpProvider;
  if (env.SENDGRID_API_KEY) return sendgridProvider;
  if (env.SMTP_HOST) return smtpProvider;
  return mockEmailProvider;
}
