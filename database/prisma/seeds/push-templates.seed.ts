import type { PrismaClient } from '@prisma/client';
import { PushCategory } from '@prisma/client';

type TemplateSeed = {
  code: string;
  name: string;
  category: PushCategory;
  eventType?: string;
  title: string;
  body: string;
  variables: string[];
};

const TEMPLATES: TemplateSeed[] = [
  { code: 'LOGIN_ALERT', name: 'Login Alert', category: PushCategory.AUTH, eventType: 'LOGIN_ALERT', title: 'New login detected', body: 'A login to your KuberOne account was detected.', variables: [] },
  { code: 'NEW_DEVICE_LOGIN', name: 'New Device Login', category: PushCategory.AUTH, eventType: 'NEW_DEVICE_LOGIN', title: 'New device sign-in', body: 'Your account was accessed from a new device.', variables: [] },
  { code: 'PASSWORD_RESET_PUSH', name: 'Password Reset', category: PushCategory.AUTH, eventType: 'PASSWORD_RESET', title: 'Password reset', body: 'A password reset was requested for your account.', variables: [] },
  { code: 'OTP_VERIFICATION_PUSH', name: 'OTP Verification', category: PushCategory.AUTH, eventType: 'OTP_VERIFICATION', title: 'Verify OTP', body: 'Your verification code is {{otp}}.', variables: ['otp'] },
  { code: 'APPLICATION_SUBMITTED_PUSH', name: 'Application Submitted', category: PushCategory.TRANSACTIONAL, eventType: 'APPLICATION_SUBMITTED', title: 'Application submitted', body: 'Application {{applicationNumber}} has been submitted.', variables: ['applicationNumber'] },
  { code: 'APPLICATION_ASSIGNED_PUSH', name: 'Application Assigned', category: PushCategory.TRANSACTIONAL, eventType: 'APPLICATION_ASSIGNED', title: 'Application assigned', body: 'Application {{applicationNumber}} assigned to {{assigneeName}}.', variables: ['applicationNumber', 'assigneeName'] },
  { code: 'APPLICATION_APPROVED_PUSH', name: 'Application Approved', category: PushCategory.TRANSACTIONAL, eventType: 'APPLICATION_APPROVED', title: 'Application approved', body: 'Application {{applicationNumber}} approved!', variables: ['applicationNumber'] },
  { code: 'APPLICATION_REJECTED_PUSH', name: 'Application Rejected', category: PushCategory.TRANSACTIONAL, eventType: 'APPLICATION_REJECTED', title: 'Application update', body: 'Application {{applicationNumber}} could not be approved.', variables: ['applicationNumber'] },
  { code: 'APPLICATION_SANCTIONED_PUSH', name: 'Sanction Issued', category: PushCategory.TRANSACTIONAL, eventType: 'SANCTION_ISSUED', title: 'Sanction issued', body: 'Sanction of Rs.{{sanctionAmount}} for {{applicationNumber}}.', variables: ['applicationNumber', 'sanctionAmount'] },
  { code: 'APPLICATION_DISBURSED_PUSH', name: 'Disbursement', category: PushCategory.TRANSACTIONAL, eventType: 'DISBURSEMENT_COMPLETED', title: 'Disbursement completed', body: 'Rs.{{disbursementAmount}} disbursed for {{applicationNumber}}.', variables: ['applicationNumber', 'disbursementAmount'] },
  { code: 'DOCUMENT_REQUIRED_PUSH', name: 'Document Required', category: PushCategory.TRANSACTIONAL, eventType: 'DOCUMENT_REQUESTED', title: 'Document required', body: 'Please upload {{documentType}} for {{applicationNumber}}.', variables: ['documentType', 'applicationNumber'] },
  { code: 'DOCUMENT_VERIFIED_PUSH', name: 'Document Verified', category: PushCategory.TRANSACTIONAL, eventType: 'DOCUMENT_VERIFIED', title: 'Document verified', body: '{{documentType}} verified successfully.', variables: ['documentType'] },
  { code: 'DOCUMENT_REJECTED_PUSH', name: 'Document Rejected', category: PushCategory.TRANSACTIONAL, eventType: 'DOCUMENT_REJECTED', title: 'Document rejected', body: '{{documentType}} rejected. Please re-upload.', variables: ['documentType'] },
  { code: 'DOCUMENT_DEFICIENCY_PUSH', name: 'Document Deficiency', category: PushCategory.TRANSACTIONAL, eventType: 'DOCUMENT_DEFICIENCY', title: 'Document deficiency', body: 'Action required for {{applicationNumber}}: {{deficiencyNote}}', variables: ['applicationNumber', 'deficiencyNote'] },
  { code: 'LEAD_ASSIGNED_PUSH', name: 'Lead Assigned', category: PushCategory.TRANSACTIONAL, eventType: 'LEAD_ASSIGNED', title: 'New lead assigned', body: 'Lead {{leadNumber}} assigned to you.', variables: ['leadNumber'] },
  { code: 'LEAD_ESCALATED_PUSH', name: 'Lead Escalated', category: PushCategory.TRANSACTIONAL, eventType: 'LEAD_ESCALATED', title: 'Lead escalated', body: 'Lead {{leadNumber}} escalated: {{reason}}', variables: ['leadNumber', 'reason'] },
  { code: 'LEAD_CONVERTED_PUSH', name: 'Lead Converted', category: PushCategory.TRANSACTIONAL, eventType: 'LEAD_CONVERTED', title: 'Lead converted', body: 'Lead {{leadNumber}} converted to application.', variables: ['leadNumber'] },
  { code: 'LEAD_FOLLOWUP_PUSH', name: 'Follow-up Reminder', category: PushCategory.REMINDER, eventType: 'FOLLOW_UP_REMINDER', title: 'Follow-up reminder', body: 'Follow up on {{referenceNumber}} due {{dueDate}}.', variables: ['referenceNumber', 'dueDate'] },
  { code: 'REFERRAL_CREATED_PUSH', name: 'Referral Created', category: PushCategory.MARKETING, eventType: 'REFERRAL_CREATED', title: 'New referral', body: 'Referral {{referralCode}} created.', variables: ['referralCode'] },
  { code: 'REFERRAL_CONVERTED_PUSH', name: 'Referral Converted', category: PushCategory.TRANSACTIONAL, eventType: 'REFERRAL_CONVERTED', title: 'Referral converted', body: 'Referral {{referralCode}} converted!', variables: ['referralCode'] },
  { code: 'REFERRAL_REWARD_PUSH', name: 'Referral Reward', category: PushCategory.MARKETING, eventType: 'REFERRAL_REWARD', title: 'Referral reward', body: 'You earned Rs.{{rewardAmount}} referral reward.', variables: ['rewardAmount'] },
  { code: 'COMMISSION_APPROVED_PUSH', name: 'Commission Approved', category: PushCategory.TRANSACTIONAL, eventType: 'COMMISSION_APPROVED', title: 'Commission approved', body: 'Rs.{{amount}} commission approved for {{period}}.', variables: ['amount', 'period'] },
  { code: 'COMMISSION_PAID_PUSH', name: 'Commission Paid', category: PushCategory.TRANSACTIONAL, eventType: 'COMMISSION_PAID', title: 'Commission paid', body: 'Rs.{{amount}} commission credited.', variables: ['amount', 'period'] },
  { code: 'COMMISSION_RECOVERY_PUSH', name: 'Commission Recovery', category: PushCategory.TRANSACTIONAL, eventType: 'COMMISSION_RECOVERY', title: 'Commission recovery', body: 'Recovery of Rs.{{amount}} on commission {{reference}}.', variables: ['amount', 'reference'] },
  { code: 'TICKET_CREATED_PUSH', name: 'Ticket Created', category: PushCategory.SUPPORT, eventType: 'SUPPORT_TICKET_CREATED', title: 'Support ticket #{{ticketNumber}}', body: '{{subject}}', variables: ['ticketNumber', 'subject'] },
  { code: 'TICKET_ASSIGNED_PUSH', name: 'Ticket Assigned', category: PushCategory.SUPPORT, eventType: 'SUPPORT_TICKET_ASSIGNED', title: 'Ticket assigned', body: 'Ticket #{{ticketNumber}} assigned to you.', variables: ['ticketNumber'] },
  { code: 'TICKET_ESCALATED_PUSH', name: 'Ticket Escalated', category: PushCategory.SUPPORT, eventType: 'SUPPORT_TICKET_ESCALATED', title: 'Ticket escalated', body: 'Ticket #{{ticketNumber}} escalated.', variables: ['ticketNumber'] },
  { code: 'TICKET_RESOLVED_PUSH', name: 'Ticket Resolved', category: PushCategory.SUPPORT, eventType: 'SUPPORT_TICKET_CLOSED', title: 'Ticket resolved', body: 'Ticket #{{ticketNumber}} resolved.', variables: ['ticketNumber'] },
  { code: 'AI_RECOMMENDATION_PUSH', name: 'AI Recommendation', category: PushCategory.AI, eventType: 'AI_RECOMMENDATION', title: 'AI recommendation', body: '{{recommendationTitle}}: {{summary}}', variables: ['recommendationTitle', 'summary'] },
  { code: 'AI_ALERT_PUSH', name: 'AI Alert', category: PushCategory.AI, eventType: 'AI_ALERT', title: 'AI alert', body: '{{alertMessage}}', variables: ['alertMessage'] },
  { code: 'AI_FOLLOWUP_PUSH', name: 'AI Follow-up', category: PushCategory.AI, eventType: 'AI_FOLLOWUP', title: 'AI follow-up suggestion', body: '{{suggestion}}', variables: ['suggestion'] },
  { code: 'VOICE_AI_REMINDER_PUSH', name: 'Voice AI Reminder', category: PushCategory.AI, eventType: 'VOICE_AI_REMINDER', title: 'Voice AI reminder', body: '{{reminderText}}', variables: ['reminderText'] },
];

const PROVIDERS = [
  { code: 'PUSH_FCM', name: 'Firebase Cloud Messaging', providerType: 'FCM' as const, isDefault: true, rateLimit: 500 },
  { code: 'PUSH_MOCK', name: 'Mock Push', providerType: 'MOCK' as const, isDefault: false, rateLimit: 1000 },
];

export async function seedPushTemplates(prisma: PrismaClient): Promise<void> {
  for (const tpl of TEMPLATES) {
    await prisma.pushTemplate.upsert({
      where: { code: tpl.code },
      update: { title: tpl.title, body: tpl.body, variables: tpl.variables },
      create: { ...tpl, variables: tpl.variables },
    });
    const template = await prisma.pushTemplate.findUnique({ where: { code: tpl.code } });
    if (template) {
      await prisma.pushTemplateVersion.upsert({
        where: { templateId_version: { templateId: template.id, version: 1 } },
        update: { title: tpl.title, body: tpl.body },
        create: {
          templateId: template.id,
          version: 1,
          title: tpl.title,
          body: tpl.body,
          variables: tpl.variables,
        },
      });
    }
  }

  for (const p of PROVIDERS) {
    await prisma.pushProvider.upsert({
      where: { code: p.code },
      update: { name: p.name, rateLimit: p.rateLimit },
      create: { ...p, isActive: true },
    });
  }
}
