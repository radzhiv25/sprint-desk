import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';

import { AppShell } from '@/app/layout';
import { RouteFallback } from '@/app/RouteFallback';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';

const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import('@/features/auth/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const BoardPage = lazy(() =>
  import('@/features/board/BoardPage').then((m) => ({ default: m.BoardPage })),
);
const AnalyticsPage = lazy(() =>
  import('@/features/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);

function withSuspense(element: JSX.Element): JSX.Element {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

const routes: RouteObject[] = [
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    element: withSuspense(
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>,
    ),
    children: [
      {
        path: '/dashboard',
        element: withSuspense(<DashboardPage />),
      },
      {
        path: '/board',
        element: withSuspense(<BoardPage />),
      },
      {
        path: '/analytics',
        element: withSuspense(<AnalyticsPage />),
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];

export const router = createBrowserRouter(routes, {
  future: {
    v7_relativeSplatPath: true,
  },
});
