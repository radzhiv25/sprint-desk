import { Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/utils/cn';
import { useThemeStore } from '@/store/themeStore';

export interface LoginThemeToggleProps {
  className?: string;
}

export function LoginThemeToggle({ className }: LoginThemeToggleProps): JSX.Element {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className={cn(
        'rounded-md p-2 text-muted-foreground transition-colors',
        'hover:bg-muted/60 hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
