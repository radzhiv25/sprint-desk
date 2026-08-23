import { Bell } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { NotificationPanel } from '@/features/notifications/NotificationPanel';
import type { UseNotificationsResult } from '@/features/notifications/useNotifications';
import { cn } from '@/lib/utils/cn';

export interface NotificationBellProps {
  notifications: UseNotificationsResult;
}

export function NotificationBell({ notifications }: NotificationBellProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const {
    unreadCount,
    isPanelOpen,
    togglePanel,
    closePanel,
    pageNotifications,
    currentPage,
    totalPages,
    setPage,
    markAsRead,
    markAllAsRead,
    isRead,
    isLoading,
    isPolling,
  } = notifications;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isPanelOpen}
        aria-haspopup="dialog"
        onClick={togglePanel}
        className={cn('relative', isPolling && 'ring-1 ring-ring/40')}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <motion.span
            initial={prefersReducedMotion ? false : { scale: 0 }}
            animate={prefersReducedMotion ? undefined : { scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground"
            aria-hidden="true"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        ) : null}
      </Button>

      <AnimatePresence>
        {isPanelOpen ? (
          <NotificationPanel
            notifications={pageNotifications}
            currentPage={currentPage}
            totalPages={totalPages}
            isLoading={isLoading}
            onClose={closePanel}
            onPageChange={setPage}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            isRead={isRead}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
