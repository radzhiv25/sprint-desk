import { describe, expect, it } from 'vitest';

import {
  getTotalPages,
  mergeNotifications,
  paginateNotifications,
} from '@/features/notifications/notifications.utils';
import type { Notification } from '@/types';

function createNotification(id: number, createdAt: string): Notification {
  return {
    id,
    title: `Notification ${id}`,
    message: `Message ${id}`,
    type: 'task',
    read: false,
    createdAt,
  };
}

describe('notifications.utils', () => {
  it('merges notifications without duplicates and sorts newest first', () => {
    const existing = [createNotification(1, '2026-08-20T10:00:00Z')];
    const incoming = [
      createNotification(1, '2026-08-20T10:00:00Z'),
      createNotification(2, '2026-08-21T10:00:00Z'),
    ];

    const merged = mergeNotifications(existing, incoming);

    expect(merged).toHaveLength(2);
    expect(merged[0]?.id).toBe(2);
    expect(merged[1]?.id).toBe(1);
  });

  it('paginates notifications by page size', () => {
    const notifications = Array.from({ length: 25 }, (_, index) =>
      createNotification(index + 1, `2026-08-${String(index + 1).padStart(2, '0')}T10:00:00Z`),
    );

    expect(paginateNotifications(notifications, 1, 20)).toHaveLength(20);
    expect(paginateNotifications(notifications, 2, 20)).toHaveLength(5);
    expect(getTotalPages(25, 20)).toBe(2);
    expect(getTotalPages(0, 20)).toBe(1);
  });
});
