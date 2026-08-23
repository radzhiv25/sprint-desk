import { useCallback, useMemo, useState } from 'react';

import {
  getTotalPages,
  NOTIFICATIONS_PAGE_SIZE,
  paginateNotifications,
} from '@/features/notifications/notifications.utils';
import { useNotificationPolling } from '@/features/notifications/useNotificationPolling';
import { useToast } from '@/hooks/useToast';
import { useNotificationStore } from '@/store/notificationStore';
import type { Notification } from '@/types';

export interface UseNotificationsResult {
  notifications: Notification[];
  pageNotifications: Notification[];
  unreadCount: number;
  currentPage: number;
  totalPages: number;
  isPanelOpen: boolean;
  isLoading: boolean;
  isPolling: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setPage: (page: number) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  isRead: (id: number) => boolean;
}

export function useNotifications(): UseNotificationsResult {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsReadStore = useNotificationStore((state) => state.markAllAsRead);
  const isRead = useNotificationStore((state) => state.isRead);

  const handleNewNotifications = useCallback(
    (items: Notification[]) => {
      if (isPanelOpen) return;

      const latest = items[0];
      if (!latest) return;

      toast({
        title: latest.title,
        description: latest.message,
        variant: 'default',
      });
    },
    [isPanelOpen, toast],
  );

  const { notifications, isLoading, isPolling } = useNotificationPolling({
    onNewNotifications: handleNewNotifications,
  });

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !isRead(notification.id)).length,
    [notifications, isRead],
  );

  const totalPages = getTotalPages(notifications.length, NOTIFICATIONS_PAGE_SIZE);
  const pageNotifications = paginateNotifications(
    notifications,
    currentPage,
    NOTIFICATIONS_PAGE_SIZE,
  );

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);
  const togglePanel = useCallback(() => setIsPanelOpen((open) => !open), []);

  const markAllAsRead = useCallback(() => {
    markAllAsReadStore(notifications.map((notification) => notification.id));
  }, [markAllAsReadStore, notifications]);

  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    },
    [totalPages],
  );

  return {
    notifications,
    pageNotifications,
    unreadCount,
    currentPage,
    totalPages,
    isPanelOpen,
    isLoading,
    isPolling,
    openPanel,
    closePanel,
    togglePanel,
    setPage,
    markAsRead,
    markAllAsRead,
    isRead,
  };
}
