import { env } from '../../../../config/env.js';
import type { FcmPayload, ProviderSendResult, PushProvider } from '../types.js';

async function getAccessToken(): Promise<string | null> {
  if (env.FCM_SERVER_KEY) return env.FCM_SERVER_KEY;
  return null;
}

export const fcmProvider: PushProvider = {
  type: 'FCM',

  async send(payload: FcmPayload): Promise<ProviderSendResult> {
    const serverKey = await getAccessToken();
    if (!serverKey) {
      return { success: false, error: 'FCM not configured' };
    }

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: payload.token,
        notification: { title: payload.title, body: payload.body },
        data: payload.data ?? {},
        priority: 'high',
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `FCM error ${response.status}: ${text}` };
    }

    const data = (await response.json()) as { message_id?: number; success?: number; failure?: number };
    if (data.failure && data.failure > 0) {
      return { success: false, error: 'FCM delivery failed' };
    }

    return {
      success: true,
      providerRef: String(data.message_id ?? `fcm-${Date.now()}`),
      deliveryStatus: 'sent',
    };
  },

  async sendToTopic(payload: Omit<FcmPayload, 'token'> & { topic: string }): Promise<ProviderSendResult> {
    const serverKey = await getAccessToken();
    if (!serverKey) {
      return { success: false, error: 'FCM not configured' };
    }

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: `/topics/${payload.topic}`,
        notification: { title: payload.title, body: payload.body },
        data: payload.data ?? {},
        priority: 'high',
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `FCM topic error ${response.status}: ${text}` };
    }

    const data = (await response.json()) as { message_id?: number };
    return {
      success: true,
      providerRef: String(data.message_id ?? `fcm-topic-${Date.now()}`),
      deliveryStatus: 'sent',
    };
  },
};
