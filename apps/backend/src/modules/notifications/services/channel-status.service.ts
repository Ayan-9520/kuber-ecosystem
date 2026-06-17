import type { BackendEnv } from '../../../config/env.js';
import { env as defaultEnv } from '../../../config/env.js';

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push';

export type ChannelOperationalStatus = 'active' | 'disabled' | 'not_configured';

export interface ChannelStatusReport {
  channel: NotificationChannel;
  status: ChannelOperationalStatus;
  configured: boolean;
  enabled: boolean;
  deliverable: boolean;
  provider: string;
  missing: string[];
}

function channelEnabled(env: BackendEnv, channel: NotificationChannel): boolean {
  switch (channel) {
    case 'email':
      return env.NOTIFICATION_EMAIL_ENABLED;
    case 'sms':
      return env.NOTIFICATION_SMS_ENABLED;
    case 'whatsapp':
      return env.NOTIFICATION_WHATSAPP_ENABLED;
    case 'push':
      return env.NOTIFICATION_PUSH_ENABLED;
  }
}

function emailConfigured(env: BackendEnv): { configured: boolean; provider: string; missing: string[] } {
  const missing: string[] = [];
  let configured = false;
  let provider: string = env.EMAIL_PROVIDER;

  if (env.EMAIL_PROVIDER === 'sendgrid') {
    configured = Boolean(env.SENDGRID_API_KEY);
    if (!env.SENDGRID_API_KEY) missing.push('SENDGRID_API_KEY');
  } else if (env.EMAIL_PROVIDER === 'smtp') {
    configured = Boolean(env.SMTP_HOST && (env.SMTP_USER || env.SMTP_PASS || env.SMTP_PASSWORD));
    if (!env.SMTP_HOST) missing.push('SMTP_HOST');
    if (!env.SMTP_USER) missing.push('SMTP_USER');
    if (!env.SMTP_PASS && !env.SMTP_PASSWORD) missing.push('SMTP_PASS');
  } else if (env.EMAIL_PROVIDER === 'aws_ses') {
    configured = Boolean(env.AWS_SES_ACCESS_KEY && env.AWS_SES_SECRET_KEY);
    if (!env.AWS_SES_ACCESS_KEY) missing.push('AWS_SES_ACCESS_KEY');
    if (!env.AWS_SES_SECRET_KEY) missing.push('AWS_SES_SECRET_KEY');
  } else if (env.SENDGRID_API_KEY) {
    provider = 'sendgrid';
    configured = true;
  } else if (env.SMTP_HOST) {
    provider = 'smtp';
    configured = true;
  } else {
    provider = 'none';
    missing.push('EMAIL_PROVIDER credentials (SENDGRID_API_KEY or SMTP_HOST or AWS SES keys)');
  }

  return { configured, provider, missing };
}

function smsConfigured(env: BackendEnv): { configured: boolean; provider: string; missing: string[] } {
  const missing: string[] = [];
  let configured = false;
  let provider: string = env.SMS_PROVIDER;

  if (env.SMS_PROVIDER === 'msg91') {
    configured = Boolean(env.MSG91_AUTH_KEY);
    if (!env.MSG91_AUTH_KEY) missing.push('MSG91_AUTH_KEY');
  } else if (env.SMS_PROVIDER === 'twilio') {
    configured = Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN);
    if (!env.TWILIO_ACCOUNT_SID) missing.push('TWILIO_ACCOUNT_SID');
    if (!env.TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');
  } else if (env.SMS_PROVIDER === 'aws_sns') {
    configured = Boolean(env.AWS_SNS_ACCESS_KEY && env.AWS_SNS_SECRET_KEY);
    if (!env.AWS_SNS_ACCESS_KEY) missing.push('AWS_SNS_ACCESS_KEY');
    if (!env.AWS_SNS_SECRET_KEY) missing.push('AWS_SNS_SECRET_KEY');
  } else if (env.MSG91_AUTH_KEY) {
    provider = 'msg91';
    configured = true;
  } else if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
    provider = 'twilio';
    configured = true;
  } else {
    provider = 'none';
    missing.push('SMS_PROVIDER credentials (MSG91_AUTH_KEY or Twilio or AWS SNS keys)');
  }

  return { configured, provider, missing };
}

function whatsAppConfigured(env: BackendEnv): { configured: boolean; provider: string; missing: string[] } {
  const missing: string[] = [];
  const configured = Boolean(env.WHATSAPP_BUSINESS_API_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID);
  if (!env.WHATSAPP_BUSINESS_API_TOKEN) missing.push('WHATSAPP_BUSINESS_API_TOKEN');
  if (!env.WHATSAPP_PHONE_NUMBER_ID) missing.push('WHATSAPP_PHONE_NUMBER_ID');
  return { configured, provider: configured ? 'meta' : 'none', missing };
}

function pushConfigured(env: BackendEnv): { configured: boolean; provider: string; missing: string[] } {
  const missing: string[] = [];
  const hasFcm =
    Boolean(env.FCM_SERVER_KEY) ||
    Boolean(env.FIREBASE_PROJECT_ID && env.FCM_CLIENT_EMAIL && env.FCM_PRIVATE_KEY);
  if (!hasFcm) {
    missing.push('FCM_SERVER_KEY or FIREBASE_PROJECT_ID + FCM_CLIENT_EMAIL + FCM_PRIVATE_KEY');
  }
  return {
    configured: hasFcm,
    provider: hasFcm ? (env.PUSH_PROVIDER === 'mock' ? 'fcm' : env.PUSH_PROVIDER) : 'none',
    missing,
  };
}

function resolveOperationalStatus(
  enabled: boolean,
  configured: boolean,
): ChannelOperationalStatus {
  if (!enabled) return 'disabled';
  if (!configured) return 'not_configured';
  return 'active';
}

export const channelStatusService = {
  getStatus(channel: NotificationChannel, env: BackendEnv = defaultEnv): ChannelStatusReport {
    const enabled = channelEnabled(env, channel);
    const details =
      channel === 'email'
        ? emailConfigured(env)
        : channel === 'sms'
          ? smsConfigured(env)
          : channel === 'whatsapp'
            ? whatsAppConfigured(env)
            : pushConfigured(env);

    const status = resolveOperationalStatus(enabled, details.configured);

    return {
      channel,
      status,
      configured: details.configured,
      enabled,
      deliverable: status === 'active',
      provider: details.provider,
      missing: details.missing,
    };
  },

  listAll(env: BackendEnv = defaultEnv): ChannelStatusReport[] {
    return (['email', 'sms', 'whatsapp', 'push'] as const).map((channel) =>
      channelStatusService.getStatus(channel, env),
    );
  },

  skipReason(channel: NotificationChannel, env: BackendEnv = defaultEnv): string {
    const report = channelStatusService.getStatus(channel, env);
    if (report.status === 'disabled') return `${report.channel} channel is disabled`;
    return `${report.channel} provider is not configured`;
  },
};
