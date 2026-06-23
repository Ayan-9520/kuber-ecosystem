import { notificationsService } from '@/services';

export const notificationQueryKeys = {
  inbox: (userId?: string) => ['notifications', 'inbox', userId] as const,
  unreadSummary: (userId?: string) => ['notifications', 'unread-summary', userId] as const,
  communicationLogs: (userId?: string) => ['communication-logs', userId] as const,
  preferences: (userId?: string) => ['notification-preferences', userId] as const,
};

export function fetchNotificationInbox(userId: string, limit = 50) {
  return notificationsService.list({
    userId,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
}

export function fetchUnreadNotificationSummary(userId: string) {
  return notificationsService.list({
    userId,
    unreadOnly: true,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
}

export function fetchCommunicationLogs(userId: string, limit = 30) {
  return notificationsService.communicationLogs({
    recipientUserId: userId,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
}
