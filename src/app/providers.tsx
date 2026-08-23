import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { ToastContainer } from '@/components/ui/ToastContainer';
import { SessionBootstrap } from '@/features/auth/SessionBootstrap';
import { NotificationProvider } from '@/features/notifications';
import { applyTheme } from '@/lib/theme/applyTheme';
import { useThemeStore } from '@/store/themeStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

export interface AppProvidersProps {
  children: ReactNode;
}

function ThemeSync(): null {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return null;
}

export function AppProviders({ children }: AppProvidersProps): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <SessionBootstrap>
        <NotificationProvider>{children}</NotificationProvider>
      </SessionBootstrap>
      <ToastContainer />
    </QueryClientProvider>
  );
}
