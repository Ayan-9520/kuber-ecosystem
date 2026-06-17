import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services';

export const pushPlatform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

type ExpoNotifications = {
  getPermissionsAsync: () => Promise<{ status: string }>;
  requestPermissionsAsync: () => Promise<{ status: string }>;
  getDevicePushTokenAsync: () => Promise<{ data: unknown }>;
};

async function resolvePushToken(): Promise<string | undefined> {
  try {
    const dynamicImport = new Function('m', 'return import(m)') as (m: string) => Promise<ExpoNotifications>;
    const Notifications = await dynamicImport('expo-notifications');
    const { status: existing } = await Notifications.getPermissionsAsync();
    const status = existing === 'granted' ? existing : (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return undefined;
    const token = await Notifications.getDevicePushTokenAsync();
    return typeof token.data === 'string' ? token.data : undefined;
  } catch {
    return undefined;
  }
}

/** Registers device for push when authenticated. Uses expo-notifications when available in production builds. */
export function usePushRegistration() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    void (async () => {
      const fcmToken = await resolvePushToken();
      await authService.registerDevice(fcmToken);
    })().catch(() => {
      /* push not configured in Expo Go — expected in dev */
    });
  }, [isAuthenticated, user?.id]);
}
