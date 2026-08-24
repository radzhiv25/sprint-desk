import { Eye, EyeOff } from 'lucide-react';
import { useId, useState, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** When true (default for `type="password"`), shows an inline visibility toggle. */
  showPasswordToggle?: boolean;
}

export function Input({
  label,
  error,
  hint,
  className,
  id,
  type,
  showPasswordToggle,
  ...props
}: InputProps): JSX.Element {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  const isPasswordType = type === 'password';
  const hasPasswordToggle = showPasswordToggle ?? isPasswordType;
  const [passwordVisible, setPasswordVisible] = useState(false);

  const resolvedType = hasPasswordToggle
    ? passwordVisible
      ? 'text'
      : 'password'
    : type;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          type={resolvedType}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'placeholder:text-muted-foreground',
            'transition-[border-color,box-shadow] duration-200 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            hasPasswordToggle && 'pr-10',
            className,
          )}
          {...props}
        />
        {hasPasswordToggle ? (
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1',
              'text-muted-foreground transition-colors hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            )}
          >
            {passwordVisible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
