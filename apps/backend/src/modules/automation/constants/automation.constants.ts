export const AUTOMATION_EVENT_PREFIX = 'AUTOMATION_';

export const CHANNEL_MAP: Record<string, string> = {
  SEND_EMAIL: 'EMAIL',
  SEND_SMS: 'SMS',
  SEND_WHATSAPP: 'WHATSAPP',
  SEND_PUSH: 'PUSH',
};

export const TRIGGER_TO_SUBJECT: Record<string, string> = {
  LEAD_CREATED: 'lead',
  LEAD_ASSIGNED: 'lead',
  LEAD_SCORE_CHANGED: 'lead',
  APPLICATION_CREATED: 'application',
  APPLICATION_APPROVED: 'application',
  APPLICATION_REJECTED: 'application',
  APPLICATION_SANCTIONED: 'application',
  APPLICATION_DISBURSED: 'application',
  DOCUMENT_UPLOADED: 'document',
  DOCUMENT_REJECTED: 'document',
  REFERRAL_CREATED: 'referral',
  REFERRAL_CONVERTED: 'referral',
  COMMISSION_APPROVED: 'commission',
  SUPPORT_TICKET_CREATED: 'ticket',
  SUPPORT_TICKET_CLOSED: 'ticket',
  CUSTOMER_REGISTERED: 'customer',
  CUSTOMER_LOGIN: 'customer',
  CUSTOMER_INACTIVE: 'customer',
};
