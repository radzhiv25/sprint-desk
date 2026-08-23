import type { Notification } from '@/types';

export const NOTIFICATIONS_PAGE_SIZE = 20;

export const POLL_INTERVAL_MS = 30_000;

export function mergeNotifications(
  existing: Notification[],
  incoming: Notification[],
): Notification[] {
  const byId = new Map<number, Notification>();

  for (const notification of existing) {
    byId.set(notification.id, notification);
  }

  for (const notification of incoming) {
    if (!byId.has(notification.id)) {
      byId.set(notification.id, notification);
    }
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function paginateNotifications(
  notifications: Notification[],
  page: number,
  pageSize = NOTIFICATIONS_PAGE_SIZE,
): Notification[] {
  const start = (page - 1) * pageSize;
  return notifications.slice(start, start + pageSize);
}

export function getTotalPages(count: number, pageSize = NOTIFICATIONS_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

export function formatNotificationTime(createdAt: string): string {
  const date = new Date(createdAt);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
