import type { ReactNode } from 'react';

import { NotificationsContext } from '@/features/notifications/notificationsContext';
import type { UseNotificationsResult } from '@/features/notifications/useNotifications';

export interface NotificationsContextProviderProps {
  value: UseNotificationsResult;
  children: ReactNode;
}

export function NotificationsContextProvider({
  value,
  children,
}: NotificationsContextProviderProps): JSX.Element {
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
