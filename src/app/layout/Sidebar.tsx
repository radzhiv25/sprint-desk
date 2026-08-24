import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

import { NotificationPanel } from '@/features/notifications/NotificationPanel';
import { useNotificationsContext } from '@/features/notifications/notificationsContext';
import { springSnappy } from '@/lib/motion';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

import { useSidebarCollapsed } from './useSidebarCollapsed';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/board', label: 'Board', icon: KanbanSquare },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
] as const;

export interface SidebarProps {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  isMobile: boolean;
}

function SidebarNavLink({
  to,
  label,
  icon: Icon,
  collapsed,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  collapsed: boolean;
  onNavigate?: () => void;
}): JSX.Element {
  const prefersReducedMotion = useReducedMotion();

  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-2' : 'px-3',
          'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isActive ? 'text-foreground' : 'text-muted-foreground hover:bg-muted/50',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <motion.span
              layoutId="sidebar-nav-indicator"
              className={cn(
                'absolute bg-primary',
                collapsed
                  ? 'inset-1 rounded-md bg-primary/10'
                  : 'bottom-1 left-0 top-1 w-0.5 rounded-full',
              )}
              transition={prefersReducedMotion ? { duration: 0 } : springSnappy}
              aria-hidden="true"
            />
          ) : null}
          <Icon className="relative z-[1] h-5 w-5 shrink-0" aria-hidden="true" />
          {!collapsed ? <span className="relative z-[1]">{label}</span> : null}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar({ mobileOpen, onMobileOpenChange, isMobile }: SidebarProps): JSX.Element {
  const navigate = useNavigate();
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const logout = useAuthStore((state) => state.logout);
  const notifications = useNotificationsContext();
  const prefersReducedMotion = useReducedMotion();
  const prevUnreadRef = useRef(0);
  const [bellAnimating, setBellAnimating] = useState(false);

  const showCollapsed = isMobile ? false : collapsed;
  const isDrawerVisible = isMobile ? mobileOpen : true;

  const handleLogout = (): void => {
    logout();
    navigate('/login', { replace: true });
    onMobileOpenChange(false);
  };

  const closeMobile = (): void => {
    onMobileOpenChange(false);
  };

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
  } = notifications;

  useEffect(() => {
    if (!isPanelOpen && unreadCount > prevUnreadRef.current) {
      setBellAnimating(true);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, isPanelOpen]);

  return (
    <>
      {isMobile && mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50"
          aria-label="Close navigation menu"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={cn(
          'z-50 flex h-full shrink-0 flex-col border-r border-border bg-sidebar shadow-sm transition-[width,transform] duration-200',
          isMobile
            ? cn(
                'fixed inset-y-0 left-0 w-64 shadow-lg',
                isDrawerVisible ? 'translate-x-0' : '-translate-x-full',
              )
            : cn(showCollapsed ? 'w-16' : 'w-56'),
        )}
        aria-label="Main navigation"
      >
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-border px-3',
            showCollapsed && !isMobile ? 'justify-center' : 'justify-between',
          )}
        >
          {!showCollapsed || isMobile ? (
            <span className="truncate font-display text-sm font-semibold tracking-display text-foreground">
              SprintDesk
            </span>
          ) : (
            <span className="sr-only">SprintDesk</span>
          )}

          {isMobile ? (
            <button
              type="button"
              onClick={closeMobile}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronsRight className="h-5 w-5" />
              ) : (
                <ChevronsLeft className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {NAV_ITEMS.map((item) => (
            <SidebarNavLink
              key={item.to}
              {...item}
              collapsed={showCollapsed}
              onNavigate={isMobile ? closeMobile : undefined}
            />
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-border p-2">
          <button
            type="button"
            onClick={togglePanel}
            title={showCollapsed ? 'Notifications' : undefined}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={isPanelOpen}
            aria-haspopup="dialog"
            className={cn(
              'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isPanelOpen && 'bg-accent text-accent-foreground',
              !isPanelOpen && 'text-muted-foreground',
              showCollapsed && 'justify-center px-2',
            )}
          >
            <motion.span
              className="relative shrink-0"
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
              {unreadCount > 0 && showCollapsed ? (
                <motion.span
                  className="absolute -right-1 -top-1 flex h-2 w-2 rounded-full bg-primary"
                  animate={
                    bellAnimating && !prefersReducedMotion
                      ? { scale: [1, 1.6, 1], opacity: [1, 0.7, 1] }
                      : { scale: 1, opacity: 1 }
                  }
                  transition={{ duration: 0.55 }}
                  aria-hidden="true"
                />
              ) : null}
            </motion.span>
            {!showCollapsed ? <span>Notifications</span> : null}
            {unreadCount > 0 ? (
              <motion.span
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-semibold text-primary-foreground',
                  showCollapsed
                    ? 'absolute -right-0.5 -top-0.5'
                    : 'ml-auto',
                )}
                initial={prefersReducedMotion ? false : { scale: 0.8 }}
                animate={
                  bellAnimating && !prefersReducedMotion
                    ? { scale: [1, 1.2, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.4 }}
                aria-hidden="true"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            title={showCollapsed ? `Switch to ${theme === 'light' ? 'dark' : 'light'} mode` : undefined}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              showCollapsed && 'justify-center px-2',
            )}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 shrink-0" aria-hidden="true" />
            ) : (
              <Sun className="h-5 w-5 shrink-0" aria-hidden="true" />
            )}
            {!showCollapsed ? (
              <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title={showCollapsed ? 'Log out' : undefined}
            aria-label="Log out"
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive',
              'hover:bg-destructive/10',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              showCollapsed && 'justify-center px-2',
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!showCollapsed ? <span>Log out</span> : null}
          </button>
        </div>
      </aside>

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

export function MobileMenuButton({ onClick }: { onClick: () => void }): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-border bg-card p-2 text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
      aria-label="Open navigation menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
