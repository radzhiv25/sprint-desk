import type { ReactNode } from 'react';

import { NotificationsContextProvider } from '@/features/notifications/NotificationsContextProvider';
import { useNotifications } from '@/features/notifications/useNotifications';

export interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps): JSX.Element {
  const notifications = useNotifications();

  return (
    <NotificationsContextProvider value={notifications}>{children}</NotificationsContextProvider>
  );
}
