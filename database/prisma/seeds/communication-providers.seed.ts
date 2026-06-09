import type { PrismaClient } from '@prisma/client';
import { CommunicationProviderType, NotificationChannel } from '@prisma/client';

const PROVIDERS = [
  { code: 'EMAIL_SENDGRID', name: 'SendGrid Email', channel: NotificationChannel.EMAIL, providerType: CommunicationProviderType.SENDGRID, isDefault: true, rateLimit: 100 },
  { code: 'EMAIL_SMTP', name: 'SMTP Email', channel: NotificationChannel.EMAIL, providerType: CommunicationProviderType.SMTP, isDefault: false, rateLimit: 50 },
  { code: 'SMS_MSG91', name: 'MSG91 SMS', channel: NotificationChannel.SMS, providerType: CommunicationProviderType.MSG91, isDefault: true, rateLimit: 200 },
  { code: 'SMS_TWILIO', name: 'Twilio SMS', channel: NotificationChannel.SMS, providerType: CommunicationProviderType.TWILIO, isDefault: false, rateLimit: 100 },
  { code: 'WA_META', name: 'Meta WhatsApp Business', channel: NotificationChannel.WHATSAPP, providerType: CommunicationProviderType.META_WHATSAPP, isDefault: true, rateLimit: 80 },
  { code: 'PUSH_FCM', name: 'Firebase Cloud Messaging', channel: NotificationChannel.PUSH, providerType: CommunicationProviderType.FCM, isDefault: true, rateLimit: 500 },
];

const WHATSAPP_TEMPLATES = [
  { code: 'OTP_LOGIN', metaName: 'login_otp', eventType: 'LOGIN_OTP' as const, variables: ['otp', 'expiryMinutes'], category: 'AUTHENTICATION' },
  { code: 'APP_STATUS', metaName: 'application_status', eventType: 'APPLICATION_SUBMITTED' as const, variables: ['applicationNumber', 'status'], category: 'UTILITY' },
  { code: 'DOC_REMINDER', metaName: 'document_reminder', eventType: 'DOCUMENT_REQUESTED' as const, variables: ['documentType', 'applicationNumber'], category: 'UTILITY' },
  { code: 'REFERRAL_UPDATE', metaName: 'referral_update', eventType: 'REFERRAL_CONVERTED' as const, variables: ['referralCode', 'rewardAmount'], category: 'MARKETING' },
  { code: 'COMMISSION_PAID', metaName: 'commission_paid', eventType: 'COMMISSION_PAID' as const, variables: ['amount', 'period'], category: 'UTILITY' },
  { code: 'SUPPORT_TICKET', metaName: 'support_ticket', eventType: 'SUPPORT_TICKET_CREATED' as const, variables: ['ticketNumber', 'subject'], category: 'UTILITY' },
];

const PUSH_TOPICS = [
  { code: 'customer_promotions', name: 'Customer Promotions', appTarget: 'CUSTOMER', description: 'Promotional offers for customer app' },
  { code: 'customer_application_updates', name: 'Application Updates', appTarget: 'CUSTOMER', description: 'Loan application status updates' },
  { code: 'dsa_leads', name: 'DSA Lead Alerts', appTarget: 'DSA', description: 'New lead and assignment alerts for DSA app' },
  { code: 'dsa_commission', name: 'DSA Commission Alerts', appTarget: 'DSA', description: 'Commission approval and payment alerts' },
];

export async function seedCommunicationProviders(prisma: PrismaClient): Promise<void> {
  for (const provider of PROVIDERS) {
    await prisma.communicationProvider.upsert({
      where: { code: provider.code },
      update: { name: provider.name, rateLimit: provider.rateLimit },
      create: { ...provider, isActive: true },
    });
  }

  for (const tpl of WHATSAPP_TEMPLATES) {
    await prisma.whatsAppTemplateRegistry.upsert({
      where: { code: tpl.code },
      update: { metaName: tpl.metaName, variables: tpl.variables },
      create: { ...tpl, variables: tpl.variables, isActive: true },
    });
  }

  for (const topic of PUSH_TOPICS) {
    await prisma.pushTopic.upsert({
      where: { code: topic.code },
      update: { name: topic.name, description: topic.description },
      create: { ...topic, isActive: true },
    });
  }
}
