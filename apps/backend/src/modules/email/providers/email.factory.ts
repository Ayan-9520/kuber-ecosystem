import { env } from '../../../config/env.js';
import { mockEmailProvider } from '../../notifications/providers/email/mock.provider.js';
import { sendgridProvider } from '../../notifications/providers/email/sendgrid.provider.js';
import { smtpProvider } from '../../notifications/providers/email/smtp.provider.js';

import { awsSesProvider } from './aws-ses.provider.js';
import type { EmailProviderAdapter } from './types.js';

const smtpPass = () => env.SMTP_PASS ?? env.SMTP_PASSWORD;

export function resolveEnterpriseEmailProvider(dbType?: string): EmailProviderAdapter {
  const type = (dbType ?? env.EMAIL_PROVIDER).toUpperCase();

  if (type === 'SENDGRID' && env.SENDGRID_API_KEY) return sendgridProvider as EmailProviderAdapter;
  if (type === 'AWS_SES' && (env.AWS_SES_ACCESS_KEY || env.AWS_ACCESS_KEY_ID)) return awsSesProvider;
  if (type === 'SMTP' && env.SMTP_HOST) return smtpProvider as EmailProviderAdapter;

  if (env.EMAIL_PROVIDER === 'sendgrid' && env.SENDGRID_API_KEY) return sendgridProvider as EmailProviderAdapter;
  if (env.EMAIL_PROVIDER === 'aws_ses' && (env.AWS_SES_ACCESS_KEY || env.AWS_ACCESS_KEY_ID)) return awsSesProvider;
  if (env.EMAIL_PROVIDER === 'smtp' && env.SMTP_HOST) return smtpProvider as EmailProviderAdapter;
  if (env.SENDGRID_API_KEY) return sendgridProvider as EmailProviderAdapter;
  if (env.SMTP_HOST && smtpPass()) return smtpProvider as EmailProviderAdapter;

  return mockEmailProvider as EmailProviderAdapter;
}
