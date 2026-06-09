import type { PrismaClient } from '@prisma/client';
import { SmsCategory } from '@prisma/client';

type TemplateSeed = {
  code: string;
  name: string;
  category: SmsCategory;
  eventType?: string;
  body: string;
  variables: string[];
};

const TEMPLATES: TemplateSeed[] = [
  // Authentication / OTP
  { code: 'LOGIN_OTP', name: 'Login OTP', category: SmsCategory.OTP, eventType: 'LOGIN_OTP', body: 'Your KuberOne OTP is {{otp}}. Valid for {{expiryMinutes}} min. Do not share.', variables: ['otp', 'expiryMinutes'] },
  { code: 'REGISTRATION_OTP', name: 'Registration OTP', category: SmsCategory.OTP, eventType: 'REGISTER_OTP', body: 'Welcome to Kuber Finserve. Your registration OTP is {{otp}}. Valid {{expiryMinutes}} min.', variables: ['otp', 'expiryMinutes'] },
  { code: 'MOBILE_VERIFICATION_OTP', name: 'Mobile Verification OTP', category: SmsCategory.OTP, eventType: 'VERIFY_MOBILE', body: 'Verify your mobile: OTP {{otp}}. Valid {{expiryMinutes}} min. - KuberOne', variables: ['otp', 'expiryMinutes'] },
  { code: 'PASSWORD_RESET_OTP', name: 'Password Reset OTP', category: SmsCategory.OTP, eventType: 'PASSWORD_RESET', body: 'Password reset OTP: {{otp}}. Valid {{expiryMinutes}} min. Ignore if not requested.', variables: ['otp', 'expiryMinutes'] },
  // KYC
  { code: 'AADHAAR_OTP', name: 'Aadhaar OTP', category: SmsCategory.OTP, eventType: 'KYC_AADHAAR', body: 'Aadhaar verification OTP: {{otp}}. Valid {{expiryMinutes}} min. - Kuber Finserve', variables: ['otp', 'expiryMinutes'] },
  { code: 'KYC_STATUS_UPDATE', name: 'KYC Status Update', category: SmsCategory.COMPLIANCE, eventType: 'KYC_STATUS_CHANGED', body: 'Dear {{customerName}}, your KYC status is now {{status}}. - KuberOne', variables: ['customerName', 'status'] },
  // Application
  { code: 'APPLICATION_SUBMITTED', name: 'Application Submitted', category: SmsCategory.TRANSACTIONAL, eventType: 'APPLICATION_SUBMITTED', body: 'Application {{applicationNumber}} submitted successfully. We will update you on progress. - Kuber Finserve', variables: ['applicationNumber'] },
  { code: 'APPLICATION_APPROVED', name: 'Application Approved', category: SmsCategory.TRANSACTIONAL, eventType: 'APPLICATION_APPROVED', body: 'Congratulations! Application {{applicationNumber}} approved. - KuberOne', variables: ['applicationNumber'] },
  { code: 'APPLICATION_REJECTED', name: 'Application Rejected', category: SmsCategory.TRANSACTIONAL, eventType: 'APPLICATION_REJECTED', body: 'Application {{applicationNumber}} could not be approved. Reason: {{reason}}. Contact support.', variables: ['applicationNumber', 'reason'] },
  { code: 'APPLICATION_SANCTIONED', name: 'Application Sanctioned', category: SmsCategory.TRANSACTIONAL, eventType: 'SANCTION_ISSUED', body: 'Sanction of Rs.{{sanctionAmount}} issued for {{applicationNumber}}. - Kuber Finserve', variables: ['applicationNumber', 'sanctionAmount'] },
  { code: 'APPLICATION_DISBURSED', name: 'Application Disbursed', category: SmsCategory.TRANSACTIONAL, eventType: 'DISBURSEMENT_COMPLETED', body: 'Rs.{{disbursementAmount}} disbursed for application {{applicationNumber}}. - KuberOne', variables: ['applicationNumber', 'disbursementAmount'] },
  // Documents
  { code: 'DOCUMENT_REQUIRED', name: 'Document Required', category: SmsCategory.TRANSACTIONAL, eventType: 'DOCUMENT_REQUESTED', body: 'Please upload {{documentType}} for application {{applicationNumber}}. - KuberOne', variables: ['documentType', 'applicationNumber'] },
  { code: 'DOCUMENT_VERIFIED', name: 'Document Verified', category: SmsCategory.TRANSACTIONAL, eventType: 'DOCUMENT_VERIFIED', body: 'Your {{documentType}} has been verified. - Kuber Finserve', variables: ['documentType'] },
  { code: 'DOCUMENT_REJECTED', name: 'Document Rejected', category: SmsCategory.TRANSACTIONAL, eventType: 'DOCUMENT_REJECTED', body: '{{documentType}} rejected. Reason: {{reason}}. Please re-upload via app.', variables: ['documentType', 'reason'] },
  { code: 'DOCUMENT_DEFICIENCY', name: 'Document Deficiency', category: SmsCategory.TRANSACTIONAL, eventType: 'DOCUMENT_DEFICIENCY', body: 'Document deficiency for {{applicationNumber}}: {{deficiencyNote}}. Action required.', variables: ['applicationNumber', 'deficiencyNote'] },
  // Referrals
  { code: 'REFERRAL_INVITATION', name: 'Referral Invitation', category: SmsCategory.MARKETING, eventType: 'REFERRAL_CREATED', body: '{{referrerName}} referred you to Kuber Finserve. Use code {{referralCode}} when applying.', variables: ['referrerName', 'referralCode'] },
  { code: 'REFERRAL_REWARD', name: 'Referral Reward', category: SmsCategory.MARKETING, eventType: 'REFERRAL_REWARD', body: 'You earned Rs.{{rewardAmount}} referral reward for code {{referralCode}}. - KuberOne', variables: ['rewardAmount', 'referralCode'] },
  { code: 'REFERRAL_CONVERSION', name: 'Referral Conversion', category: SmsCategory.TRANSACTIONAL, eventType: 'REFERRAL_CONVERTED', body: 'Referral {{referralCode}} converted successfully. Reward will be credited shortly.', variables: ['referralCode'] },
  // Commissions
  { code: 'COMMISSION_APPROVED', name: 'Commission Approved', category: SmsCategory.TRANSACTIONAL, eventType: 'COMMISSION_APPROVED', body: 'Commission of Rs.{{amount}} for {{period}} approved. - Kuber Finserve', variables: ['amount', 'period'] },
  { code: 'COMMISSION_PAID', name: 'Commission Paid', category: SmsCategory.TRANSACTIONAL, eventType: 'COMMISSION_PAID', body: 'Rs.{{amount}} commission credited for {{period}}. - KuberOne', variables: ['amount', 'period'] },
  // Support
  { code: 'TICKET_CREATED', name: 'Ticket Created', category: SmsCategory.SUPPORT, eventType: 'SUPPORT_TICKET_CREATED', body: 'Support ticket #{{ticketNumber}} created: {{subject}}. We will respond shortly.', variables: ['ticketNumber', 'subject'] },
  { code: 'TICKET_ASSIGNED', name: 'Ticket Assigned', category: SmsCategory.SUPPORT, eventType: 'SUPPORT_TICKET_ASSIGNED', body: 'Ticket #{{ticketNumber}} assigned to {{assigneeName}}. - Kuber Finserve', variables: ['ticketNumber', 'assigneeName'] },
  { code: 'TICKET_ESCALATED', name: 'Ticket Escalated', category: SmsCategory.SUPPORT, eventType: 'SUPPORT_TICKET_ESCALATED', body: 'Ticket #{{ticketNumber}} escalated to {{escalationLevel}}. Reason: {{reason}}', variables: ['ticketNumber', 'escalationLevel', 'reason'] },
  { code: 'TICKET_RESOLVED', name: 'Ticket Resolved', category: SmsCategory.SUPPORT, eventType: 'SUPPORT_TICKET_CLOSED', body: 'Ticket #{{ticketNumber}} resolved. {{resolution}} - KuberOne', variables: ['ticketNumber', 'resolution'] },
  // Reminders
  { code: 'FOLLOW_UP_REMINDER', name: 'Follow-Up Reminder', category: SmsCategory.TRANSACTIONAL, eventType: 'FOLLOW_UP_REMINDER', body: 'Reminder: Follow up on {{referenceType}} {{referenceNumber}} scheduled for {{dueDate}}.', variables: ['referenceType', 'referenceNumber', 'dueDate'] },
  { code: 'DOCUMENT_REMINDER', name: 'Document Reminder', category: SmsCategory.TRANSACTIONAL, eventType: 'DOCUMENT_REMINDER', body: 'Reminder: Upload pending {{documentType}} for application {{applicationNumber}}.', variables: ['documentType', 'applicationNumber'] },
  { code: 'EMI_REMINDER', name: 'EMI Reminder', category: SmsCategory.TRANSACTIONAL, eventType: 'EMI_REMINDER', body: 'EMI of Rs.{{emiAmount}} due on {{dueDate}} for loan {{loanNumber}}. Pay on time to avoid penalties.', variables: ['emiAmount', 'dueDate', 'loanNumber'] },
  { code: 'APPLICATION_REMINDER', name: 'Application Reminder', category: SmsCategory.TRANSACTIONAL, eventType: 'APPLICATION_REMINDER', body: 'Complete your application {{applicationNumber}}. Pending step: {{pendingStep}}.', variables: ['applicationNumber', 'pendingStep'] },
];

const PROVIDERS = [
  { code: 'SMS_MSG91', name: 'MSG91', providerType: 'MSG91' as const, isDefault: true, rateLimit: 200 },
  { code: 'SMS_TWILIO', name: 'Twilio', providerType: 'TWILIO' as const, isDefault: false, rateLimit: 100 },
  { code: 'SMS_AWS_SNS', name: 'AWS SNS', providerType: 'AWS_SNS' as const, isDefault: false, rateLimit: 500 },
  { code: 'SMS_MOCK', name: 'Mock SMS', providerType: 'MOCK' as const, isDefault: false, rateLimit: 1000 },
];

export async function seedSmsTemplates(prisma: PrismaClient): Promise<void> {
  for (const tpl of TEMPLATES) {
    await prisma.smsTemplate.upsert({
      where: { code: tpl.code },
      update: { body: tpl.body, variables: tpl.variables },
      create: { ...tpl, variables: tpl.variables },
    });
    const template = await prisma.smsTemplate.findUnique({ where: { code: tpl.code } });
    if (template) {
      await prisma.smsTemplateVersion.upsert({
        where: { templateId_version: { templateId: template.id, version: 1 } },
        update: { body: tpl.body },
        create: {
          templateId: template.id,
          version: 1,
          body: tpl.body,
          variables: tpl.variables,
        },
      });
    }
  }

  for (const p of PROVIDERS) {
    await prisma.smsProvider.upsert({
      where: { code: p.code },
      update: { name: p.name, rateLimit: p.rateLimit },
      create: { ...p, isActive: true },
    });
  }
}
