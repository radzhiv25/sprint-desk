import { GuestRoute } from '@/features/auth/ProtectedRoute';
import { LoginForm } from '@/features/auth/LoginForm';
import { LoginMarketingPanel, LoginMobileBanner } from '@/features/auth/LoginMarketingPanel';
import { LoginThemeToggle } from '@/features/auth/LoginThemeToggle';

function LoginLayout(): JSX.Element {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background md:flex-row">
      <div className="fixed right-4 top-4 z-20">
        <LoginThemeToggle />
      </div>

      <LoginMobileBanner />
      <LoginMarketingPanel />

      <section
        className="relative flex min-h-0 flex-1 flex-col bg-background md:w-1/2"
        aria-label="Sign in"
      >
        <LoginForm />
      </section>
    </div>
  );
}

export function LoginPage(): JSX.Element {
  return (
    <GuestRoute>
      <LoginLayout />
    </GuestRoute>
  );
}
