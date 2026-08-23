import { useEffect } from 'react';

import { RouteFallback } from '@/app/RouteFallback';
import { useAuthStore } from '@/store/authStore';

export interface SessionBootstrapProps {
  children: React.ReactNode;
}

export function SessionBootstrap({ children }: SessionBootstrapProps): JSX.Element {
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  if (isBootstrapping) {
    return <RouteFallback />;
  }

  return <>{children}</>;
}
