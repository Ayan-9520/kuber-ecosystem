import jwt from 'jsonwebtoken';

import { env } from '../../../config/env.js';

import type { FcmPayload, ProviderSendResult, PushProviderAdapter } from './types.js';

let cachedToken: { value: string; expiresAt: number } | null = null;

function projectId(): string | undefined {
  return env.FCM_PROJECT_ID ?? env.FIREBASE_PROJECT_ID;
}

async function getAccessToken(): Promise<string | null> {
  if (env.FCM_SERVER_KEY) return env.FCM_SERVER_KEY;

  const clientEmail = env.FCM_CLIENT_EMAIL;
  const privateKey = env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: clientEmail,
      sub: clientEmail,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    },
    privateKey,
    { algorithm: 'RS256' },
  );

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

async function sendV1(
  body: Record<string, unknown>,
): Promise<ProviderSendResult> {
  const pid = projectId();
  const token = await getAccessToken();
  if (!pid || !token) {
    return { success: false, error: 'FCM v1 not configured (FCM_PROJECT_ID, FCM_CLIENT_EMAIL, FCM_PRIVATE_KEY)' };
  }

  const isLegacyKey = Boolean(env.FCM_SERVER_KEY && !env.FCM_CLIENT_EMAIL);
  if (isLegacyKey) {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `FCM legacy error ${response.status}: ${text}` };
    }
    const data = (await response.json()) as { message_id?: number; failure?: number };
    if (data.failure && data.failure > 0) return { success: false, error: 'FCM delivery failed' };
    return { success: true, providerRef: String(data.message_id ?? `fcm-${Date.now()}`), deliveryStatus: 'sent' };
  }

  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${pid}/messages:send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: body }),
  });

  if (!response.ok) {
    const text = await response.text();
    return { success: false, error: `FCM v1 error ${response.status}: ${text}` };
  }

  const data = (await response.json()) as { name?: string };
  return {
    success: true,
    providerRef: data.name ?? `fcm-v1-${Date.now()}`,
    deliveryStatus: 'sent',
  };
}

function stringifyData(data?: Record<string, unknown>): Record<string, string> {
  if (!data) return {};
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]),
  );
}

export const fcmV1Provider: PushProviderAdapter = {
  type: 'FCM',

  async send(payload: FcmPayload): Promise<ProviderSendResult> {
    if (env.FCM_SERVER_KEY && !env.FCM_CLIENT_EMAIL) {
      return sendV1({
        to: payload.token,
        notification: { title: payload.title, body: payload.body },
        data: stringifyData(payload.data),
        priority: 'high',
      });
    }

    return sendV1({
      token: payload.token,
      notification: { title: payload.title, body: payload.body },
      data: stringifyData(payload.data),
      android: { priority: 'HIGH' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
  },

  async sendToTopic(payload: Omit<FcmPayload, 'token'> & { topic: string }): Promise<ProviderSendResult> {
    if (env.FCM_SERVER_KEY && !env.FCM_CLIENT_EMAIL) {
      return sendV1({
        to: `/topics/${payload.topic}`,
        notification: { title: payload.title, body: payload.body },
        data: stringifyData(payload.data),
        priority: 'high',
      });
    }

    return sendV1({
      topic: payload.topic,
      notification: { title: payload.title, body: payload.body },
      data: stringifyData(payload.data),
    });
  },

  async subscribeToTopic(token: string, topic: string): Promise<ProviderSendResult> {
    const accessToken = await getAccessToken();
    if (!accessToken || env.FCM_SERVER_KEY) {
      return { success: true, providerRef: `topic-sub-${topic}` };
    }
    const response = await fetch(
      `https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`,
      { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `FCM topic subscribe failed: ${text}` };
    }
    return { success: true, providerRef: `sub-${topic}` };
  },

  async unsubscribeFromTopic(token: string, topic: string): Promise<ProviderSendResult> {
    const accessToken = await getAccessToken();
    if (!accessToken || env.FCM_SERVER_KEY) {
      return { success: true, providerRef: `topic-unsub-${topic}` };
    }
    const response = await fetch(
      `https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `FCM topic unsubscribe failed: ${text}` };
    }
    return { success: true, providerRef: `unsub-${topic}` };
  },
};
