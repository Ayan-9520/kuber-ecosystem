import { env } from '../../../config/env.js';
import { emailService } from '../../notifications/services/email.service.js';

type PartnerNotifyRow = {
  id: string;
  userId: string;
  partnerCode: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string | null;
  status: string;
};

const PARTNER_PORTAL_URL = 'https://partner.kuberone.online/login';
const KUBERFINSERVE_LOGIN_URL = 'https://kuberfinserve.com/partner-login';
const SUPPORT_PHONE = '+91 7982953129';

function partnerEmail(partner: PartnerNotifyRow): string | null {
  const email = partner.email?.trim();
  if (!email) return null;
  return email;
}

export const partnerNotificationService = {
  async notifyStatusChange(params: {
    partner: PartnerNotifyRow;
    previousStatus: string;
    newStatus: string;
  }): Promise<void> {
    const { partner, previousStatus, newStatus } = params;
    if (previousStatus === newStatus) return;

    if (newStatus === 'ACTIVE' && previousStatus !== 'ACTIVE') {
      await partnerNotificationService.sendApproved(partner);
      await partnerNotificationService.syncWebsiteStatus(partner, 'approved');
      return;
    }

    if (newStatus === 'REJECTED' && previousStatus !== 'REJECTED') {
      await partnerNotificationService.sendRejected(partner);
      await partnerNotificationService.syncWebsiteStatus(partner, 'rejected');
    }
  },

  async sendApproved(partner: PartnerNotifyRow): Promise<void> {
    const toEmail = partnerEmail(partner);
    if (!toEmail) {
      console.warn('[partner-notification] No email for approved partner', partner.partnerCode);
      return;
    }

    const name = partner.contactName?.trim() || 'Partner';
    const subject = 'Partner account approved — Kuber Finserve';
    const body = [
      `Dear ${name},`,
      '',
      'Congratulations! Your Kuber Finserve partner application has been approved.',
      '',
      `Partner Code: ${partner.partnerCode}`,
      `Business: ${partner.businessName || '—'}`,
      '',
      'You can sign in using OTP with your registered mobile number or email at:',
      `- ${PARTNER_PORTAL_URL}`,
      `- ${KUBERFINSERVE_LOGIN_URL}`,
      '',
      'An OTP will be sent to your registered mobile (and email when available).',
      '',
      `Need help? Call ${SUPPORT_PHONE}`,
      '',
      'Regards,',
      'Kuber Finserve Team',
    ].join('\n');

    await emailService.send({
      userId: partner.userId,
      toEmail,
      subject,
      body,
      eventType: 'PARTNER_APPROVED',
      category: 'TRANSACTIONAL',
    });
  },

  async sendRejected(partner: PartnerNotifyRow): Promise<void> {
    const toEmail = partnerEmail(partner);
    if (!toEmail) return;

    const name = partner.contactName?.trim() || 'Partner';
    const subject = 'Partner application update — Kuber Finserve';
    const body = [
      `Dear ${name},`,
      '',
      'Thank you for applying to become a Kuber Finserve partner.',
      '',
      'After review, we are unable to approve your application at this time.',
      'If you believe this is an error or would like more information, please contact our support team.',
      '',
      `Support: ${SUPPORT_PHONE} · loanleads@kuberfinserve.com`,
      '',
      'Regards,',
      'Kuber Finserve Team',
    ].join('\n');

    await emailService.send({
      userId: partner.userId,
      toEmail,
      subject,
      body,
      eventType: 'PARTNER_REJECTED',
      category: 'TRANSACTIONAL',
    });
  },

  async syncWebsiteStatus(partner: PartnerNotifyRow, status: 'approved' | 'rejected'): Promise<void> {
    const syncUrl = env.KUBERFINSERVE_PARTNER_SYNC_URL?.trim();
    const apiKey = env.WEBSITE_INTAKE_API_KEY?.trim();
    if (!syncUrl || !apiKey) return;

    try {
      const response = await fetch(syncUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Website-Api-Key': apiKey,
        },
        body: JSON.stringify({
          status,
          partner_code: partner.partnerCode,
          email: partner.email,
          phone: partner.phone,
          notify: false,
        }),
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.warn('[partner-notification] Hostinger sync failed:', response.status, text.slice(0, 200));
      }
    } catch (err) {
      console.warn('[partner-notification] Hostinger sync error:', err instanceof Error ? err.message : err);
    }
  },
};
