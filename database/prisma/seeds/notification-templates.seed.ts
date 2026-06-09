import type { PrismaClient } from '@prisma/client';
import { NotificationChannel, NotificationEventType } from '@prisma/client';

type TemplateSeed = {
  code: string;
  name: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  subject?: string;
  body: string;
  variables: string[];
};

const TEMPLATES: TemplateSeed[] = [
  {
    code: 'LEAD_CREATED_INAPP',
    name: 'Lead Created In-App',
    channel: NotificationChannel.IN_APP,
    eventType: NotificationEventType.LEAD_CREATED,
    body: 'New lead {{leadNumber}} created for {{prospectName}}.',
    variables: ['leadNumber', 'prospectName'],
  },
  {
    code: 'LEAD_ASSIGNED_INAPP',
    name: 'Lead Assigned In-App',
    channel: NotificationChannel.IN_APP,
    eventType: NotificationEventType.LEAD_ASSIGNED,
    body: 'Lead {{leadNumber}} has been assigned to you.',
    variables: ['leadNumber'],
  },
  {
    code: 'APPLICATION_SUBMITTED_EMAIL',
    name: 'Application Submitted Email',
    channel: NotificationChannel.EMAIL,
    eventType: NotificationEventType.APPLICATION_SUBMITTED,
    subject: 'Application {{applicationNumber}} Submitted',
    body: 'Dear {{customerName}}, your loan application {{applicationNumber}} has been submitted successfully.',
    variables: ['applicationNumber', 'customerName'],
  },
  {
    code: 'DOCUMENT_REQUESTED_SMS',
    name: 'Document Requested SMS',
    channel: NotificationChannel.SMS,
    eventType: NotificationEventType.DOCUMENT_REQUESTED,
    body: 'Kuber Finserve: Please upload {{documentType}} for application {{applicationNumber}}.',
    variables: ['documentType', 'applicationNumber'],
  },
  {
    code: 'DOCUMENT_VERIFIED_WHATSAPP',
    name: 'Document Verified WhatsApp',
    channel: NotificationChannel.WHATSAPP,
    eventType: NotificationEventType.DOCUMENT_VERIFIED,
    body: 'Your document {{documentType}} has been verified successfully.',
    variables: ['documentType'],
  },
  {
    code: 'SANCTION_ISSUED_PUSH',
    name: 'Sanction Issued Push',
    channel: NotificationChannel.PUSH,
    eventType: NotificationEventType.SANCTION_ISSUED,
    subject: 'Loan Sanctioned',
    body: 'Congratulations! Your loan of Rs.{{amount}} has been sanctioned.',
    variables: ['amount'],
  },
  {
    code: 'DISBURSEMENT_COMPLETED_EMAIL',
    name: 'Disbursement Completed Email',
    channel: NotificationChannel.EMAIL,
    eventType: NotificationEventType.DISBURSEMENT_COMPLETED,
    subject: 'Disbursement Completed',
    body: 'Dear {{customerName}}, disbursement of Rs.{{amount}} is completed for application {{applicationNumber}}.',
    variables: ['customerName', 'amount', 'applicationNumber'],
  },
  {
    code: 'REFERRAL_CONVERTED_INAPP',
    name: 'Referral Converted In-App',
    channel: NotificationChannel.IN_APP,
    eventType: NotificationEventType.REFERRAL_CONVERTED,
    body: 'Referral {{referralCode}} converted successfully.',
    variables: ['referralCode'],
  },
  {
    code: 'COMMISSION_PAID_INAPP',
    name: 'Commission Paid In-App',
    channel: NotificationChannel.IN_APP,
    eventType: NotificationEventType.COMMISSION_PAID,
    body: 'Commission payout of Rs.{{amount}} has been released.',
    variables: ['amount'],
  },
  {
    code: 'LOGIN_OTP_SMS',
    name: 'Login OTP SMS',
    channel: NotificationChannel.SMS,
    eventType: NotificationEventType.LOGIN_OTP,
    body: 'Your KuberOne OTP is {{otp}}. Valid for 10 minutes. Do not share.',
    variables: ['otp'],
  },
  {
    code: 'PASSWORD_RESET_EMAIL',
    name: 'Password Reset Email',
    channel: NotificationChannel.EMAIL,
    eventType: NotificationEventType.PASSWORD_RESET,
    subject: 'Reset Your Password',
    body: 'Click the link to reset your password: {{resetLink}}',
    variables: ['resetLink'],
  },
  {
    code: 'SUPPORT_TICKET_CREATED_INAPP',
    name: 'Support Ticket Created In-App',
    channel: NotificationChannel.IN_APP,
    eventType: NotificationEventType.SUPPORT_TICKET_CREATED,
    body: 'Support ticket {{ticketNumber}} has been created: {{subject}}',
    variables: ['ticketNumber', 'subject'],
  },
  {
    code: 'SUPPORT_TICKET_CREATED_EMAIL',
    name: 'Support Ticket Created Email',
    channel: NotificationChannel.EMAIL,
    eventType: NotificationEventType.SUPPORT_TICKET_CREATED,
    subject: 'Support Ticket {{ticketNumber}} Created',
    body: 'Dear customer, your support ticket {{ticketNumber}} regarding "{{subject}}" has been registered.',
    variables: ['ticketNumber', 'subject'],
  },
  {
    code: 'SUPPORT_TICKET_CLOSED_INAPP',
    name: 'Support Ticket Closed In-App',
    channel: NotificationChannel.IN_APP,
    eventType: NotificationEventType.SUPPORT_TICKET_CLOSED,
    body: 'Support ticket {{ticketNumber}} has been closed.',
    variables: ['ticketNumber', 'reason'],
  },
  {
    code: 'SUPPORT_TICKET_CLOSED_EMAIL',
    name: 'Support Ticket Closed Email',
    channel: NotificationChannel.EMAIL,
    eventType: NotificationEventType.SUPPORT_TICKET_CLOSED,
    subject: 'Support Ticket {{ticketNumber}} Closed',
    body: 'Your support ticket {{ticketNumber}} has been closed. {{reason}}',
    variables: ['ticketNumber', 'reason'],
  },
];

export async function seedNotificationTemplates(prisma: PrismaClient): Promise<void> {
  for (const template of TEMPLATES) {
    await prisma.notificationTemplate.upsert({
      where: { code_version: { code: template.code, version: 1 } },
      update: {
        name: template.name,
        channel: template.channel,
        eventType: template.eventType,
        subject: template.subject,
        body: template.body,
        variables: template.variables,
        isActive: true,
      },
      create: { ...template, version: 1, isActive: true },
    });
  }

  console.log('  → notification_templates seeded');
}
