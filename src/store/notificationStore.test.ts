import { beforeEach, describe, expect, it } from 'vitest';

import { useNotificationStore } from '@/store/notificationStore';

describe('notificationStore', () => {
  beforeEach(() => {
    useNotificationStore.getState().clearReadState();
  });

  it('marks a single notification as read', () => {
    const { markAsRead, isRead } = useNotificationStore.getState();

    expect(isRead(42)).toBe(false);
    markAsRead(42);
    expect(useNotificationStore.getState().isRead(42)).toBe(true);
  });

  it('marks all provided notification ids as read', () => {
    const { markAllAsRead, isRead } = useNotificationStore.getState();

    markAllAsRead([1, 2, 3]);

    expect(isRead(1)).toBe(true);
    expect(isRead(2)).toBe(true);
    expect(isRead(3)).toBe(true);
    expect(isRead(4)).toBe(false);
  });

  it('does not duplicate read ids', () => {
    const { markAsRead } = useNotificationStore.getState();

    markAsRead(7);
    markAsRead(7);

    expect(useNotificationStore.getState().readIds).toEqual([7]);
  });
});
