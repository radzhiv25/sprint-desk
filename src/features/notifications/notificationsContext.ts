import { createContext, useContext } from 'react';

import type { UseNotificationsResult } from '@/features/notifications/useNotifications';

export const NotificationsContext = createContext<UseNotificationsResult | null>(null);

export function useNotificationsContext(): UseNotificationsResult {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within NotificationProvider');
  }
  return context;
}
