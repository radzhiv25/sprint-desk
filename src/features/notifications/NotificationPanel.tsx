import { Bell, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { formatNotificationTime } from '@/features/notifications/notifications.utils';
import { cn } from '@/lib/utils/cn';
import type { Notification } from '@/types';

export interface NotificationPanelProps {
  notifications: Notification[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onClose: () => void;
  onPageChange: (page: number) => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  isRead: (id: number) => boolean;
}

export function NotificationPanel({
  notifications,
  currentPage,
  totalPages,
  isLoading,
  onClose,
  onPageChange,
  onMarkAsRead,
  onMarkAllAsRead,
  isRead,
}: NotificationPanelProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-40"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/30 dark:bg-black/50"
        aria-label="Close notifications panel"
        onClick={onClose}
      />

      <motion.aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        tabIndex={-1}
        initial={prefersReducedMotion ? false : { x: '100%' }}
        animate={{ x: 0 }}
        exit={prefersReducedMotion ? undefined : { x: '100%' }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' }}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            <Bell className="h-5 w-5" aria-hidden="true" />
            Notifications
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
              Mark all read
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading notifications…</p>
          ) : null}

          {!isLoading && notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>
          ) : null}

          <ul className="divide-y divide-border">
            {notifications.map((notification) => {
              const read = isRead(notification.id);

              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                      !read && 'bg-muted/30',
                    )}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{notification.title}</p>
                      {!read ? (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatNotificationTime(notification.createdAt)} · {notification.type}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {totalPages > 1 ? (
          <footer className="flex items-center justify-between border-t border-border px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </footer>
        ) : null}
      </motion.aside>
    </motion.div>
  );
}
