import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import {
  mergeNotifications,
  POLL_INTERVAL_MS,
} from '@/features/notifications/notifications.utils';
import { usePageVisibility } from '@/features/notifications/usePageVisibility';
import { notificationQueryKeys } from '@/services/notifications.queryKeys';
import {
  fetchLatestPosts,
  mapPostToNotification,
} from '@/services/notifications.service';
import type { Notification } from '@/types';

export interface UseNotificationPollingOptions {
  onNewNotifications?: (notifications: Notification[]) => void;
}

export interface UseNotificationPollingResult {
  notifications: Notification[];
  isLoading: boolean;
  isPolling: boolean;
}

export function useNotificationPolling(
  options: UseNotificationPollingOptions = {},
): UseNotificationPollingResult {
  const { onNewNotifications } = options;
  const isVisible = usePageVisibility();
  const seenIdsRef = useRef<Set<number>>(new Set());
  const hasInitializedRef = useRef(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: notificationQueryKeys.posts(),
    queryFn: fetchLatestPosts,
    refetchInterval: isVisible ? POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (!data) return;

    const mapped = data.map(mapPostToNotification);
    const newItems = mapped.filter((item) => !seenIdsRef.current.has(item.id));

    for (const item of mapped) {
      seenIdsRef.current.add(item.id);
    }

    setNotifications((prev) => mergeNotifications(prev, mapped));

    if (hasInitializedRef.current && newItems.length > 0) {
      onNewNotifications?.(newItems);
    }

    hasInitializedRef.current = true;
  }, [data, onNewNotifications]);

  return {
    notifications,
    isLoading,
    isPolling: isVisible && (isLoading || isFetching),
  };
}
