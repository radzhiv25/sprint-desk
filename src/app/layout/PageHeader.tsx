import type { ReactNode } from 'react';

import { useAuthStore } from '@/store/authStore';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps): JSX.Element {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 sm:px-6">
      <div className="flex min-w-0 flex-col justify-center gap-0.5">
        <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        {subtitle ? (
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        ) : user ? (
          <p className="truncate text-sm text-muted-foreground">
            Welcome back, {user.firstName} {user.lastName}
          </p>
        ) : null}
      </div>

      {children ? (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      ) : null}
    </header>
  );
}
