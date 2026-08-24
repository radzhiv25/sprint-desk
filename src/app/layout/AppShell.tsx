import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { cn } from '@/lib/utils/cn';

import { MobileMenuButton, Sidebar } from './Sidebar';
import { useMediaQuery } from './useMediaQuery';

export function AppShell(): JSX.Element {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const isBoardRoute = pathname === '/board';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {isMobile ? (
          <div className="flex h-16 shrink-0 items-center border-b border-border px-3 md:hidden">
            <MobileMenuButton onClick={() => setMobileOpen(true)} />
            <span className="ml-3 font-display text-sm font-semibold tracking-display text-foreground">
              SprintDesk
            </span>
          </div>
        ) : null}

        <main
          className={cn(
            'min-h-0 flex-1 bg-background',
            isBoardRoute ? 'overflow-hidden' : 'overflow-y-auto',
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
