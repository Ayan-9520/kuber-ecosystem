import { createMockFn } from './prisma.mock.js';

const sent: Array<Record<string, unknown>> = [];

export function createNotificationMock() {
  return {
    sent,
    sendEmail: createMockFn(async (payload: Record<string, unknown>) => {
      sent.push({ channel: 'email', ...payload });
      return { messageId: `email-${sent.length}` };
    }),
    sendSms: createMockFn(async (payload: Record<string, unknown>) => {
      sent.push({ channel: 'sms', ...payload });
      return { messageId: `sms-${sent.length}` };
    }),
    sendPush: createMockFn(async (payload: Record<string, unknown>) => {
      sent.push({ channel: 'push', ...payload });
      return { messageId: `push-${sent.length}` };
    }),
    sendWhatsApp: createMockFn(async (payload: Record<string, unknown>) => {
      sent.push({ channel: 'whatsapp', ...payload });
      return { messageId: `wa-${sent.length}` };
    }),
    reset() {
      sent.length = 0;
    },
  };
}
