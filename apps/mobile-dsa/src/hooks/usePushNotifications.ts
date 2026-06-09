import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/hooks';
import { pushService } from '@/services/push.service';

type NotificationPayload = {
  deliveryId?: string;
  screen?: string;
  entityId?: string;
};

type NotificationRequest = {
  request: { content: { data?: NotificationPayload } };
};

type NotificationResponse = {
  notification: NotificationRequest;
};

type ExpoNotifications = {
  setNotificationHandler: (handler: { handleNotification: () => Promise<{ shouldShowAlert: boolean; shouldPlaySound: boolean; shouldSetBadge: boolean }> }) => void;
  addNotificationReceivedListener: (cb: (n: NotificationRequest) => void) => { remove: () => void };
  addNotificationResponseReceivedListener: (cb: (r: NotificationResponse) => void) => { remove: () => void };
  getPermissionsAsync: () => Promise<{ status: string }>;
  requestPermissionsAsync: () => Promise<{ status: string }>;
  getDevicePushTokenAsync: () => Promise<{ data: unknown }>;
};

async function loadNotifications(): Promise<ExpoNotifications | null> {
  try {
    const dynamicImport = new Function('m', 'return import(m)') as (m: string) => Promise<ExpoNotifications>;
    return await dynamicImport('expo-notifications');
  } catch {
    return null;
  }
}

export function usePushNotifications(onNavigate?: (screen: string, entityId?: string) => void) {
  const { isAuthenticated, user } = useAuth();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let receivedSub: { remove: () => void } | undefined;
    let responseSub: { remove: () => void } | undefined;

    void (async () => {
      const Notifications = await loadNotifications();
      if (!Notifications) return;

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: Platform.OS === 'ios',
        }),
      });

      const { status: existing } = await Notifications.getPermissionsAsync();
      const status = existing === 'granted' ? existing : (await Notifications.requestPermissionsAsync()).status;
      if (status !== 'granted') return;

      const tokenResult = await Notifications.getDevicePushTokenAsync();
      const fcmToken = typeof tokenResult.data === 'string' ? tokenResult.data : undefined;

      if (!registeredRef.current) {
        await pushService.registerDevice(fcmToken);
        await pushService.subscribeDsaTopics();
        registeredRef.current = true;
      } else if (fcmToken) {
        await pushService.refreshToken(fcmToken);
      }

      receivedSub = Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data;
        if (data?.deliveryId) void pushService.trackOpen(data.deliveryId);
      });

      responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.screen && onNavigate) onNavigate(data.screen, data.entityId);
      });
    })().catch(() => {});

    return () => {
      receivedSub?.remove();
      responseSub?.remove();
    };
  }, [isAuthenticated, user?.id, onNavigate]);
}
