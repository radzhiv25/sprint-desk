import { Bell } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { NotificationPanel } from '@/features/notifications/NotificationPanel';
import type { UseNotificationsResult } from '@/features/notifications/useNotifications';
import { cn } from '@/lib/utils/cn';

export interface NotificationBellProps {
  notifications: UseNotificationsResult;
}

export function NotificationBell({ notifications }: NotificationBellProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const prevUnreadRef = useRef(0);
  const [bellAnimating, setBellAnimating] = useState(false);
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

  useEffect(() => {
    if (!isPanelOpen && unreadCount > prevUnreadRef.current) {
      setBellAnimating(true);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, isPanelOpen]);

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
        <motion.span
          className="relative"
          animate={
            bellAnimating && !prefersReducedMotion
              ? {
                  rotate: [0, -14, 14, -10, 10, -4, 0],
                  scale: [1, 1.12, 1.08, 1.1, 1],
                }
              : { rotate: 0, scale: 1 }
          }
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          onAnimationComplete={() => setBellAnimating(false)}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </motion.span>
        {unreadCount > 0 ? (
          <motion.span
            initial={prefersReducedMotion ? false : { scale: 0 }}
            animate={
              bellAnimating && !prefersReducedMotion
                ? { scale: [1, 1.25, 1] }
                : { scale: 1 }
            }
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
