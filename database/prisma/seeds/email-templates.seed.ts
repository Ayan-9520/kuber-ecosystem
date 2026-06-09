import type { PrismaClient } from '@prisma/client';
import { EmailCategory } from '@prisma/client';

type TemplateSeed = {
  code: string;
  name: string;
  category: EmailCategory;
  eventType?: string;
  subject: string;
  htmlBody: string;
  variables: string[];
};

const BODY = (title: string, lines: string[]) =>
  `<h2 style="color:#22D3A6;margin:0 0 16px;">${title}</h2>${lines.map((l) => `<p style="margin:0 0 12px;">${l}</p>`).join('')}`;

const TEMPLATES: TemplateSeed[] = [
  { code: 'LOGIN_OTP', name: 'Login OTP', category: EmailCategory.TRANSACTIONAL, eventType: 'LOGIN_OTP', subject: 'Your KuberOne OTP: {{otp}}', htmlBody: BODY('Verification Code', ['Your one-time password is <strong>{{otp}}</strong>.', 'Valid for {{expiryMinutes}} minutes. Do not share this code.']), variables: ['otp', 'expiryMinutes'] },
  { code: 'PASSWORD_RESET', name: 'Password Reset', category: EmailCategory.TRANSACTIONAL, eventType: 'PASSWORD_RESET', subject: 'Reset your KuberOne password', htmlBody: BODY('Password Reset', ['Click the link below to reset your password:', '<a href="{{resetUrl}}">Reset Password</a>', 'Link expires in {{expiryMinutes}} minutes.']), variables: ['resetUrl', 'expiryMinutes'] },
  { code: 'EMAIL_VERIFICATION', name: 'Email Verification', category: EmailCategory.TRANSACTIONAL, subject: 'Verify your email address', htmlBody: BODY('Verify Email', ['Please verify your email by clicking:', '<a href="{{verifyUrl}}">Verify Email</a>']), variables: ['verifyUrl'] },
  { code: 'APPLICATION_SUBMITTED', name: 'Application Submitted', category: EmailCategory.TRANSACTIONAL, eventType: 'APPLICATION_SUBMITTED', subject: 'Application {{applicationNumber}} Submitted', htmlBody: BODY('Application Submitted', ['Dear {{customerName}},', 'Your loan application <strong>{{applicationNumber}}</strong> has been submitted successfully.', 'We will notify you on status updates.']), variables: ['applicationNumber', 'customerName'] },
  { code: 'APPLICATION_APPROVED', name: 'Application Approved', category: EmailCategory.TRANSACTIONAL, subject: 'Application {{applicationNumber}} Approved', htmlBody: BODY('Application Approved', ['Congratulations {{customerName}}!', 'Application <strong>{{applicationNumber}}</strong> has been approved.']), variables: ['applicationNumber', 'customerName'] },
  { code: 'APPLICATION_REJECTED', name: 'Application Rejected', category: EmailCategory.TRANSACTIONAL, subject: 'Application {{applicationNumber}} Update', htmlBody: BODY('Application Update', ['Dear {{customerName}},', 'Application <strong>{{applicationNumber}}</strong> could not be approved at this time.', 'Reason: {{reason}}']), variables: ['applicationNumber', 'customerName', 'reason'] },
  { code: 'APPLICATION_SANCTIONED', name: 'Sanction Issued', category: EmailCategory.TRANSACTIONAL, eventType: 'SANCTION_ISSUED', subject: 'Sanction Letter — {{applicationNumber}}', htmlBody: BODY('Sanction Issued', ['Dear {{customerName}},', 'Sanction of <strong>₹{{sanctionAmount}}</strong> issued for application {{applicationNumber}}.']), variables: ['applicationNumber', 'customerName', 'sanctionAmount'] },
  { code: 'APPLICATION_DISBURSED', name: 'Disbursement Completed', category: EmailCategory.TRANSACTIONAL, eventType: 'DISBURSEMENT_COMPLETED', subject: 'Disbursement — {{applicationNumber}}', htmlBody: BODY('Disbursement Completed', ['Dear {{customerName}},', '₹{{disbursementAmount}} disbursed for application {{applicationNumber}}.']), variables: ['applicationNumber', 'customerName', 'disbursementAmount'] },
  { code: 'DOCUMENT_REQUIRED', name: 'Document Required', category: EmailCategory.TRANSACTIONAL, eventType: 'DOCUMENT_REQUESTED', subject: 'Document Required — {{documentType}}', htmlBody: BODY('Document Required', ['Please upload <strong>{{documentType}}</strong> for application {{applicationNumber}}.', '<a href="{{uploadUrl}}">Upload Document</a>']), variables: ['documentType', 'applicationNumber', 'uploadUrl'] },
  { code: 'DOCUMENT_VERIFIED', name: 'Document Verified', category: EmailCategory.TRANSACTIONAL, eventType: 'DOCUMENT_VERIFIED', subject: 'Document Verified — {{documentType}}', htmlBody: BODY('Document Verified', ['Your document <strong>{{documentType}}</strong> has been verified.']), variables: ['documentType'] },
  { code: 'DOCUMENT_REJECTED', name: 'Document Rejected', category: EmailCategory.TRANSACTIONAL, eventType: 'DOCUMENT_REJECTED', subject: 'Document Rejected — {{documentType}}', htmlBody: BODY('Document Rejected', ['Document <strong>{{documentType}}</strong> was rejected.', 'Reason: {{reason}}', 'Please re-upload via the app.']), variables: ['documentType', 'reason'] },
  { code: 'REFERRAL_INVITATION', name: 'Referral Invitation', category: EmailCategory.MARKETING, eventType: 'REFERRAL_CREATED', subject: 'You have been referred to Kuber Finserve', htmlBody: BODY('Referral Invitation', ['{{referrerName}} has referred you to Kuber Finserve.', 'Use code <strong>{{referralCode}}</strong> when applying.']), variables: ['referrerName', 'referralCode'] },
  { code: 'REFERRAL_REWARD', name: 'Referral Reward', category: EmailCategory.MARKETING, eventType: 'REFERRAL_CONVERTED', subject: 'Referral Reward Earned', htmlBody: BODY('Referral Reward', ['Congratulations! You earned <strong>₹{{rewardAmount}}</strong> for referral {{referralCode}}.']), variables: ['rewardAmount', 'referralCode'] },
  { code: 'REFERRAL_STATUS', name: 'Referral Status', category: EmailCategory.TRANSACTIONAL, subject: 'Referral {{referralCode}} — {{status}}', htmlBody: BODY('Referral Update', ['Referral <strong>{{referralCode}}</strong> status: {{status}}.']), variables: ['referralCode', 'status'] },
  { code: 'COMMISSION_APPROVED', name: 'Commission Approved', category: EmailCategory.TRANSACTIONAL, eventType: 'COMMISSION_APPROVED', subject: 'Commission Approved — ₹{{amount}}', htmlBody: BODY('Commission Approved', ['Your commission of <strong>₹{{amount}}</strong> for {{period}} has been approved.']), variables: ['amount', 'period'] },
  { code: 'COMMISSION_PAID', name: 'Commission Paid', category: EmailCategory.TRANSACTIONAL, eventType: 'COMMISSION_PAID', subject: 'Commission Paid — ₹{{amount}}', htmlBody: BODY('Commission Paid', ['₹{{amount}} commission has been credited for {{period}}.']), variables: ['amount', 'period'] },
  { code: 'COMMISSION_RECOVERY', name: 'Commission Recovery', category: EmailCategory.COMPLIANCE, subject: 'Commission Recovery Notice', htmlBody: BODY('Commission Recovery', ['A recovery of <strong>₹{{amount}}</strong> applies to commission {{reference}}.', 'Reason: {{reason}}']), variables: ['amount', 'reference', 'reason'] },
  { code: 'TICKET_CREATED', name: 'Ticket Created', category: EmailCategory.SUPPORT, eventType: 'SUPPORT_TICKET_CREATED', subject: 'Support Ticket #{{ticketNumber}} Created', htmlBody: BODY('Support Ticket Created', ['Ticket <strong>#{{ticketNumber}}</strong>: {{subject}}', 'We will respond shortly.']), variables: ['ticketNumber', 'subject'] },
  { code: 'TICKET_ASSIGNED', name: 'Ticket Assigned', category: EmailCategory.SUPPORT, subject: 'Ticket #{{ticketNumber}} Assigned', htmlBody: BODY('Ticket Assigned', ['Ticket #{{ticketNumber}} assigned to {{assigneeName}}.']), variables: ['ticketNumber', 'assigneeName'] },
  { code: 'TICKET_RESOLVED', name: 'Ticket Resolved', category: EmailCategory.SUPPORT, eventType: 'SUPPORT_TICKET_CLOSED', subject: 'Ticket #{{ticketNumber}} Resolved', htmlBody: BODY('Ticket Resolved', ['Ticket #{{ticketNumber}} has been resolved.', '{{resolution}}']), variables: ['ticketNumber', 'resolution'] },
  { code: 'TICKET_ESCALATED', name: 'Ticket Escalated', category: EmailCategory.SUPPORT, subject: 'Ticket #{{ticketNumber}} Escalated', htmlBody: BODY('Ticket Escalated', ['Ticket #{{ticketNumber}} escalated to {{escalationLevel}}.', 'Reason: {{reason}}']), variables: ['ticketNumber', 'escalationLevel', 'reason'] },
  { code: 'CAMPAIGN_EMAIL', name: 'Campaign Email', category: EmailCategory.MARKETING, subject: '{{campaignTitle}}', htmlBody: BODY('{{campaignTitle}}', ['{{campaignBody}}', '<a href="{{ctaUrl}}">{{ctaLabel}}</a>']), variables: ['campaignTitle', 'campaignBody', 'ctaUrl', 'ctaLabel'] },
  { code: 'PROMOTIONAL_EMAIL', name: 'Promotional Email', category: EmailCategory.MARKETING, subject: '{{offerTitle}}', htmlBody: BODY('{{offerTitle}}', ['{{offerDescription}}', 'Valid until {{expiryDate}}.']), variables: ['offerTitle', 'offerDescription', 'expiryDate'] },
  { code: 'NEWSLETTER_EMAIL', name: 'Newsletter', category: EmailCategory.MARKETING, subject: 'Kuber Finserve Newsletter — {{edition}}', htmlBody: BODY('Newsletter', ['{{newsletterContent}}']), variables: ['edition', 'newsletterContent'] },
];

const PROVIDERS = [
  { code: 'EMAIL_SENDGRID', name: 'SendGrid', providerType: 'SENDGRID' as const, isDefault: true, rateLimit: 200 },
  { code: 'EMAIL_SMTP', name: 'SMTP Relay', providerType: 'SMTP' as const, isDefault: false, rateLimit: 100 },
  { code: 'EMAIL_AWS_SES', name: 'AWS SES', providerType: 'AWS_SES' as const, isDefault: false, rateLimit: 500 },
];

export async function seedEmailTemplates(prisma: PrismaClient): Promise<void> {
  for (const tpl of TEMPLATES) {
    await prisma.emailTemplate.upsert({
      where: { code: tpl.code },
      update: { subject: tpl.subject, htmlBody: tpl.htmlBody, variables: tpl.variables },
      create: { ...tpl, variables: tpl.variables, textBody: tpl.htmlBody.replace(/<[^>]+>/g, ' ') },
    });
    const template = await prisma.emailTemplate.findUnique({ where: { code: tpl.code } });
    if (template) {
      await prisma.emailTemplateVersion.upsert({
        where: { templateId_version: { templateId: template.id, version: 1 } },
        update: { subject: tpl.subject, htmlBody: tpl.htmlBody },
        create: {
          templateId: template.id,
          version: 1,
          subject: tpl.subject,
          htmlBody: tpl.htmlBody,
          textBody: tpl.htmlBody.replace(/<[^>]+>/g, ' '),
          variables: tpl.variables,
        },
      });
    }
  }

  for (const p of PROVIDERS) {
    await prisma.emailProvider.upsert({
      where: { code: p.code },
      update: { name: p.name, rateLimit: p.rateLimit },
      create: { ...p, isActive: true },
    });
  }
}
